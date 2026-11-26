import { z } from 'zod';
import { createMemoryStore } from './handler.js';

const defaultAllowedOrigins = [
  'https://atulk.me',
  'https://www.atulk.me',
  'https://0atxl.github.io'
];

const maxBodyBytes = 4_096;
const MESSAGE_RATE_WINDOW_MS = 10 * 60 * 1000;
const MESSAGE_RATE_MAX_REQUESTS = 3;

const messageSchema = z.strictObject({
  message: z.string().trim().min(2).max(1000),
  sender: z.string().trim().min(1).max(160),
  website: z.string().max(120).optional()
});

const defaultMessageStore = createMemoryStore({
  rateWindowMs: MESSAGE_RATE_WINDOW_MS,
  rateMaxRequests: MESSAGE_RATE_MAX_REQUESTS
});

function getAllowedOrigins(env = process.env) {
  const extra = String(env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return new Set([...defaultAllowedOrigins, ...extra]);
}

function getClientIp(request) {
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get('x-forwarded-for');
  if (!forwarded) return '';
  return forwarded.split(',')[0].trim();
}

async function readJson(request) {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0;
  let body = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBodyBytes) throw new RangeError('Request body too large');
      body += decoder.decode(value, { stream: true });
    }
    return JSON.parse(body + decoder.decode());
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
}

export function formatTelegramMessage({ sender, message, origin }) {
  const cleanSender = String(sender ?? '').replace(/\0/g, '').trim();
  const cleanMessage = String(message ?? '').replace(/\0/g, '').trim();
  const lines = [
    'New portfolio message',
    '',
    `From: ${cleanSender}`,
    '',
    cleanMessage
  ];
  if (origin) {
    lines.push('', `Via: ${origin}`);
  }
  return lines.join('\n');
}

export async function handleMessage(
  request,
  {
    fetchImpl = fetch,
    store = defaultMessageStore,
    env = process.env,
    logger = console
  } = {}
) {
  const origin = request.headers.get('origin');
  const headers = new Headers({ 'Cache-Control': 'no-store', Vary: 'Origin' });
  const json = (body, status = 200) => Response.json(body, { status, headers });

  if (!getAllowedOrigins(env).has(origin)) {
    return json({ error: 'Open this chat from Atul’s portfolio.' }, 403);
  }
  headers.set('Access-Control-Allow-Origin', origin);

  if (request.method === 'OPTIONS') {
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Accept');
    headers.set('Access-Control-Max-Age', '600');
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== 'POST') {
    headers.set('Allow', 'POST, OPTIONS');
    return json({ error: 'Use POST to send a message.' }, 405);
  }

  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return json({ error: 'Expected an application/json request.' }, 415);
  }
  if (Number(request.headers.get('content-length')) > maxBodyBytes) {
    return json({ error: 'Your message is too large.' }, 413);
  }

  let parsed;
  try {
    parsed = messageSchema.safeParse(await readJson(request));
  } catch (error) {
    return error instanceof RangeError
      ? json({ error: 'Your message is too large.' }, 413)
      : json({ error: 'Couldn’t read that message.' }, 400);
  }
  if (!parsed.success) {
    return json({ error: 'Please include both a message (2–1000 chars) and your name.' }, 400);
  }

  // Silent honeypot drop for automated bots.
  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return json({ ok: true });
  }

  const rate = store.checkRateLimit(getClientIp(request));
  if (!rate.allowed) {
    headers.set('Retry-After', String(rate.retryAfterSec));
    return json({ error: 'Too many messages sent recently. Please try again in a few minutes.' }, 429);
  }

  const botToken = String(env.TELEGRAM_BOT_TOKEN ?? '').trim();
  const chatId = String(env.TELEGRAM_CHAT_ID ?? '').trim();
  if (!botToken || !chatId) {
    logger.error?.('Telegram messaging is not configured (missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID)');
    return json({ error: 'Direct messaging isn’t configured right now. You can email hello@atulk.me instead.' }, 503);
  }

  const text = formatTelegramMessage({
    sender: parsed.data.sender,
    message: parsed.data.message,
    origin
  });

  try {
    const response = await fetchImpl(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true
      }),
      signal: AbortSignal.timeout(10_000)
    });

    if (!response.ok) {
      logger.error?.('Telegram sendMessage failed', { status: response.status });
      return json({ error: 'Couldn’t deliver your message right now. Please email hello@atulk.me instead.' }, 502);
    }

    const result = await response.json().catch(() => null);
    if (result && result.ok === false) {
      logger.error?.('Telegram API returned ok=false', { description: result.description });
      return json({ error: 'Couldn’t deliver your message right now. Please email hello@atulk.me instead.' }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    logger.error?.('Telegram sendMessage request error', {
      name: error?.name,
      message: error?.message
    });
    return json({ error: 'Couldn’t deliver your message right now. Please email hello@atulk.me instead.' }, 502);
  }
}
