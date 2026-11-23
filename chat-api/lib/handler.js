import { z } from 'zod';
import { citationsFor, retrieveDocuments, unknownAnswer } from './knowledge.js';

const allowedOrigins = new Set([
  'https://atulk.me', 'https://www.atulk.me', 'https://0atxl.github.io'
]);
const question = z.string().trim().min(1).max(400);
const input = z.strictObject({
  question,
  history: z.array(question).max(3).default([])
});
const maxBodyBytes = 8192;

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

export async function handleChat(request, { generateAnswer }) {
  const origin = request.headers.get('origin');
  const headers = new Headers({ 'Cache-Control': 'no-store', Vary: 'Origin' });
  const json = (body, status = 200) => Response.json(body, { status, headers });

  if (!allowedOrigins.has(origin)) return json({ error: 'Open this chat from Atul’s portfolio.' }, 403);
  headers.set('Access-Control-Allow-Origin', origin);
  if (request.method === 'OPTIONS') {
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
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
  let parsed;
  try {
    parsed = input.safeParse(await readJson(request));
  } catch (error) {
    return error instanceof RangeError
      ? json({ error: 'Your request is too large.' }, 413)
      : json({ error: 'Couldn’t read that question.' }, 400);
  }
  if (!parsed.success) return json({ error: 'Enter a question of 1–400 characters.' }, 400);

  const { question: current, history } = parsed.data;
  const notes = retrieveDocuments(current, history);
  if (!notes.length) return json(unknownAnswer);
  try {
    const answer = await generateAnswer({ question: current, history, notes });
    const cited = notes.filter(({ id }) => answer.sourceIds.includes(id));
    if (!cited.length || !answer.paragraphs.length) return json(unknownAnswer);

    // Keep both paragraph count and the total size of the rendered reply bounded.
    let wordsLeft = 120;
    const paragraphs = [];
    for (const paragraph of answer.paragraphs.slice(0, 3)) {
      const words = paragraph.trim().split(/\s+/).filter(Boolean);
      if (!words.length) continue;
      const limit = Math.min(words.length, wordsLeft);
      const excerpt = words.slice(0, limit).join(' ');
      paragraphs.push(excerpt + (limit < words.length ? '…' : ''));
      wordsLeft -= limit;
      if (!wordsLeft) break;
    }
    return json(paragraphs.length ? { paragraphs, sources: citationsFor(cited) } : unknownAnswer);
  } catch (error) {
    if (error?.statusCode === 402) {
      return json({ error: 'Gemini is temporarily unavailable.' }, 402);
    }
    if (error?.statusCode === 429) {
      return json({ error: 'The model service is busy. Try again shortly.' }, 429);
    }
    console.error('Portfolio chat generation failed', { name: error?.name });
    return json({ error: 'Chat couldn’t answer right now. Try again shortly.' }, 503);
  }
}
