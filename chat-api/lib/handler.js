import { z } from 'zod';
import {
  buildFallbackAnswer,
  citationsByIds,
  matchFastPath,
  normalizeCacheKey,
  retrieveDocuments
} from './knowledge.js';

const defaultAllowedOrigins = [
  'https://atulk.me',
  'https://www.atulk.me',
  'https://0atxl.github.io'
];

const questionSchema = z.string().trim().min(1).max(400);
const turnSchema = z.union([
  questionSchema,
  z.strictObject({
    q: questionSchema,
    a: z.string().trim().max(600).optional(),
    sourceIds: z.array(z.string().trim().min(1).max(32)).max(4).optional()
  })
]);

const inputSchema = z.strictObject({
  question: questionSchema,
  history: z.array(turnSchema).max(3).default([]),
  stream: z.boolean().optional()
});

const maxBodyBytes = 12_288;

// Warm-instance in-memory LRU cache (single-turn AI replies) and per-IP sliding-window rate limiter.
const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_MAX_ENTRIES = 100;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX_REQUESTS = 25;

export function createMemoryStore({
  cacheTtlMs = CACHE_TTL_MS,
  cacheMaxEntries = CACHE_MAX_ENTRIES,
  rateWindowMs = RATE_WINDOW_MS,
  rateMaxRequests = RATE_MAX_REQUESTS
} = {}) {
  const cache = new Map();
  const hitsByIp = new Map();

  return {
    getCached(key, now = Date.now()) {
      const entry = cache.get(key);
      if (!entry) return null;
      if (now - entry.at > cacheTtlMs) {
        cache.delete(key);
        return null;
      }
      // Refresh LRU order.
      cache.delete(key);
      cache.set(key, entry);
      return entry.value;
    },

    setCached(key, value, now = Date.now()) {
      if (cache.has(key)) cache.delete(key);
      cache.set(key, { at: now, value });
      if (cache.size > cacheMaxEntries) {
        const oldest = cache.keys().next().value;
        cache.delete(oldest);
      }
    },

    checkRateLimit(ip, now = Date.now()) {
      if (!ip) return { allowed: true, retryAfterSec: 0 };
      const cutoff = now - rateWindowMs;
      const recent = (hitsByIp.get(ip) ?? []).filter((ts) => ts > cutoff);
      if (recent.length >= rateMaxRequests) {
        hitsByIp.set(ip, recent);
        const retryAfterSec = Math.max(1, Math.ceil((recent[0] + rateWindowMs - now) / 1000));
        return { allowed: false, retryAfterSec };
      }
      recent.push(now);
      hitsByIp.set(ip, recent);
      if (hitsByIp.size > 500) {
        for (const [k, list] of hitsByIp) {
          if (!list.some((ts) => ts > cutoff)) hitsByIp.delete(k);
        }
      }
      return { allowed: true, retryAfterSec: 0 };
    }
  };
}

const defaultStore = createMemoryStore();

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

function formatSse(event, payload) {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

function createImmediateSseResponse(payload, baseHeaders) {
  const headers = new Headers(baseHeaders);
  headers.set('Content-Type', 'text/event-stream; charset=utf-8');
  headers.set('X-Accel-Buffering', 'no');
  return new Response(formatSse('done', payload), { status: 200, headers });
}

export async function handleChat(
  request,
  {
    generateAnswer,
    store = defaultStore,
    env = process.env,
    logger = console
  }
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
    return json({ error: 'Use POST to ask a question.' }, 405);
  }

  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return json({ error: 'Expected an application/json request.' }, 415);
  }
  if (Number(request.headers.get('content-length')) > maxBodyBytes) {
    return json({ error: 'Your request is too large.' }, 413);
  }

  const rate = store.checkRateLimit(getClientIp(request));
  if (!rate.allowed) {
    headers.set('Retry-After', String(rate.retryAfterSec));
    return json({ error: 'Too many questions in a short time. Try again in a moment.' }, 429);
  }

  let parsed;
  try {
    parsed = inputSchema.safeParse(await readJson(request));
  } catch (error) {
    return error instanceof RangeError
      ? json({ error: 'Your request is too large.' }, 413)
      : json({ error: 'Couldn’t read that question.' }, 400);
  }
  if (!parsed.success) {
    return json({ error: 'Enter a question of 1–400 characters.' }, 400);
  }

  const { question: current, history, stream: requestedStream } = parsed.data;
  const wantsStream = requestedStream === true || (request.headers.get('accept') ?? '').includes('text/event-stream');

  // Layer 1: Instant deterministic fast-path (0 AI tokens, <5ms).
  const fast = matchFastPath(current, history);
  if (fast) {
    return wantsStream ? createImmediateSseResponse(fast, headers) : json(fast);
  }

  // Layer 1.5: Warm-instance cache hit for normalized single-turn questions.
  const cacheKey = history.length === 0 ? normalizeCacheKey(current) : '';
  if (cacheKey) {
    const cached = store.getCached(cacheKey);
    if (cached) {
      const hit = { ...cached, mode: 'cache' };
      return wantsStream ? createImmediateSseResponse(hit, headers) : json(hit);
    }
  }

  // Layer 2: Hybrid BM25 + alias RAG retrieval -> streaming or JSON AI generation.
  const notes = retrieveDocuments(current, history, { limit: 4 });

  if (!wantsStream) {
    try {
      const result = await generateAnswer({ question: current, history, notes });
      const payload = {
        paragraphs: result.paragraphs,
        sources: citationsByIds(result.sourceIds),
        sourceIds: result.sourceIds,
        mode: 'ai'
      };
      if (cacheKey) store.setCached(cacheKey, payload);
      return json(payload);
    } catch (error) {
      logger.error?.('Portfolio chat generation failed; falling back to curated notes', {
        name: error?.name,
        message: error?.message,
        status: error?.statusCode,
        provider: error?.provider,
        model: error?.model
      });
      // Layer 3: Automatic graceful fallback to curated portfolio notes.
      return json(buildFallbackAnswer(current, history));
    }
  }

  // SSE streaming response.
  const sseHeaders = new Headers(headers);
  sseHeaders.set('Content-Type', 'text/event-stream; charset=utf-8');
  sseHeaders.set('X-Accel-Buffering', 'no');

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event, payload) => {
        controller.enqueue(encoder.encode(formatSse(event, payload)));
      };

      try {
        const result = await generateAnswer({
          question: current,
          history,
          notes,
          onStatus(text) {
            send('status', { text });
          },
          onDelta(text) {
            send('delta', { text });
          }
        });
        const payload = {
          paragraphs: result.paragraphs,
          sources: citationsByIds(result.sourceIds),
          sourceIds: result.sourceIds,
          mode: 'ai'
        };
        if (cacheKey) store.setCached(cacheKey, payload);
        send('done', payload);
      } catch (error) {
        logger.error?.('Portfolio chat stream failed; falling back to curated notes', {
          name: error?.name,
          message: error?.message,
          status: error?.statusCode,
          provider: error?.provider,
          model: error?.model
        });
        send('done', buildFallbackAnswer(current, history));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, { status: 200, headers: sseHeaders });
}
