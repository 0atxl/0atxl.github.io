import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildFallbackAnswer,
  matchFastPath,
  normalizeCacheKey,
  retrieveDocuments
} from '../lib/knowledge.js';
import {
  createSourceMarkerFilter,
  generateWithFailover,
  reasoningEffortFor,
  resolveAzureChatUrl
} from '../lib/providers.js';
import { createMemoryStore, handleChat } from '../lib/handler.js';

function sseResponse(events, status = 200) {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      for (const chunk of events) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    }
  });
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8' }
  });
}

function makeRequest(body, {
  origin = 'https://atulk.me',
  method = 'POST',
  accept = 'application/json',
  ip = '203.0.113.10'
} = {}) {
  const headers = new Headers({
    Origin: origin,
    Accept: accept,
    'x-forwarded-for': ip
  });
  const init = { method, headers };
  if (method === 'POST') {
    headers.set('Content-Type', 'application/json');
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  return new Request('https://atulk-portfolio-chat.vercel.app/api/chat', init);
}

test('knowledge: fast-path handles greetings, contact, and overview chips without hijacking nuanced queries', () => {
  const hi = matchFastPath('Hello there!');
  assert.equal(hi?.mode, 'fast');
  assert.deepEqual(hi?.sources, []);

  const contact = matchFastPath('How can I contact Atul?');
  assert.equal(contact?.mode, 'fast');
  assert.ok(contact.sources.some((s) => s.url === 'mailto:hello@atulk.me'));
  assert.ok(contact.sources.some((s) => s.url === 'https://x.com/0atxl'));

  const projects = matchFastPath('What projects has Atul built?');
  assert.equal(projects?.mode, 'fast');
  assert.ok(projects.paragraphs[0].includes('TrialSync'));

  const stack = matchFastPath("What is Atul's tech stack?");
  assert.equal(stack?.mode, 'fast');
  assert.ok(stack.paragraphs[0].includes('PyTorch'));

  // Nuanced & project-specific queries must go to AI (not fast-path).
  assert.equal(matchFastPath('How does TrialSync work?'), null);
  assert.equal(matchFastPath('Compare 0xbin and Morning'), null);
  assert.equal(matchFastPath('Which projects use Go?'), null);
  assert.equal(matchFastPath('What is his GPA?'), null);
});

test('knowledge: hybrid BM25 + alias retriever finds ethos, stack, projects, and Q+A follow-ups', () => {
  const ethos = retrieveDocuments('What is his engineering philosophy and principles?');
  assert.equal(ethos[0]?.id, 'ethos');

  const cp = retrieveDocuments('Where is his LeetCode and Codeforces profile?');
  assert.equal(cp[0]?.id, 'profiles');

  const goProjects = retrieveDocuments('Which projects use Go and React?');
  const ids = goProjects.map((d) => d.id);
  assert.ok(ids.includes('0xbin') && ids.includes('morning'));

  // Follow-up using compact Q+A turn history.
  const followUp = retrieveDocuments('Tell me more about it', [
    { q: 'What is Frost?', a: 'Frost is a local Linux file manager.', sourceIds: ['frost'] }
  ]);
  assert.equal(followUp[0]?.id, 'frost');

  // Fallback answer returns grounded notes and notice.
  const fb = buildFallbackAnswer('How does apsis recover SOL?');
  assert.equal(fb.mode, 'fallback');
  assert.deepEqual(fb.sourceIds, ['apsis']);
  assert.ok(fb.sources.some((s) => s.url === 'https://ap-sis.vercel.app/'));
});

test('providers: Azure URL normalization and reasoning effort defaults', () => {
  assert.equal(
    resolveAzureChatUrl('https://secbrainwillow.openai.azure.com/', 'gpt-6-luna'),
    'https://secbrainwillow.openai.azure.com/openai/v1/chat/completions'
  );
  assert.equal(
    resolveAzureChatUrl('https://secbrainwillow.cognitiveservices.azure.com', 'gpt-6-luna'),
    'https://secbrainwillow.cognitiveservices.azure.com/openai/v1/chat/completions'
  );
  assert.equal(
    resolveAzureChatUrl('https://secbrainwillow.openai.azure.com', 'gpt-6-luna', '2025-04-01-preview'),
    'https://secbrainwillow.openai.azure.com/openai/deployments/gpt-6-luna/chat/completions?api-version=2025-04-01-preview'
  );
  assert.equal(
    resolveAzureChatUrl('https://secbrainwillow.openai.azure.com/openai/v1/chat/completions', 'gpt-6-luna'),
    'https://secbrainwillow.openai.azure.com/openai/v1/chat/completions'
  );

  assert.equal(reasoningEffortFor('gpt-6-luna'), 'none');
  assert.equal(reasoningEffortFor('gpt-5.4-nano'), 'none');
  assert.equal(reasoningEffortFor('gpt-5-nano'), 'minimal');
  assert.equal(reasoningEffortFor('gpt-4.1-nano'), undefined);
});

test('providers: source marker filter strips [[SOURCES: ...]] even when streamed 1 char at a time', () => {
  const full = 'TrialSync screens patients against clinical-trial criteria.\n\nIt uses FastAPI and PostgreSQL.\n[[SOURCES: trialsync, invalid_id, about]]';
  const deltas = [];
  const filter = createSourceMarkerFilter((d) => deltas.push(d));
  for (const ch of full) {
    filter.push(ch);
  }
  const res = filter.flush();

  assert.equal(deltas.join(''), 'TrialSync screens patients against clinical-trial criteria.\n\nIt uses FastAPI and PostgreSQL.');
  assert.equal(res.text, 'TrialSync screens patients against clinical-trial criteria.\n\nIt uses FastAPI and PostgreSQL.');
  assert.deepEqual(res.sourceIds, ['trialsync', 'about']);
  assert.equal(res.hadMarker, true);
});

test('providers: Azure primary retries on 503 then succeeds with reasoning_effort=none', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body), headers: init.headers });
    if (calls.length === 1) {
      return Response.json({ error: { code: 'overloaded', message: 'Temporary spike' } }, { status: 503 });
    }
    return sseResponse([
      'data: {"choices":[{"delta":{"content":"TrialSync screens patients "}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"with FastAPI and Gemini.\\n[[SOURCES: trialsync]]"},"finish_reason":"stop"}]}\n\n',
      'data: [DONE]\n\n'
    ]);
  };

  const deltas = [];
  const result = await generateWithFailover({
    question: 'How does TrialSync work?',
    notes: retrieveDocuments('How does TrialSync work?'),
    onDelta: (d) => deltas.push(d),
    env: {
      AZURE_OPENAI_ENDPOINT: 'https://secbrainwillow.openai.azure.com',
      AZURE_OPENAI_API_KEY: 'test-key',
      AZURE_OPENAI_DEPLOYMENT: 'gpt-6-luna'
    },
    fetchImpl,
    retryDelayMs: 5,
    logger: { warn() {} }
  });

  assert.equal(calls.length, 2);
  assert.equal(calls[0].body.model, 'gpt-6-luna');
  assert.equal(calls[0].body.reasoning_effort, 'none');
  assert.equal(calls[0].body.temperature, undefined);
  assert.equal(result.provider, 'azure');
  assert.deepEqual(result.sourceIds, ['trialsync']);
  assert.equal(deltas.join(''), 'TrialSync screens patients with FastAPI and Gemini.');
});

test('providers: Azure failures fail over cleanly to Gemini streaming fallback', async () => {
  const urls = [];
  const fetchImpl = async (url) => {
    urls.push(url);
    if (url.includes('azure.com')) {
      return Response.json({ error: { message: 'Service unavailable' } }, { status: 503 });
    }
    return sseResponse([
      'data: {"candidates":[{"content":{"parts":[{"text":"thinking...","thought":true},{"text":"0xbin uses Go, SQLite, and React."}]}}]}\n\n',
      'data: {"candidates":[{"content":{"parts":[{"text":"\\n[[SOURCES: 0xbin]]"}]},"finishReason":"STOP"}]}\n\n'
    ]);
  };

  const deltas = [];
  const result = await generateWithFailover({
    question: 'What stack powers 0xbin?',
    notes: retrieveDocuments('What stack powers 0xbin?'),
    onDelta: (d) => deltas.push(d),
    env: {
      AZURE_OPENAI_ENDPOINT: 'https://secbrainwillow.openai.azure.com',
      AZURE_OPENAI_API_KEY: 'test-key',
      GOOGLE_GENERATIVE_AI_API_KEY: 'test-gemini-key'
    },
    fetchImpl,
    retryDelayMs: 5,
    logger: { warn() {} }
  });

  // 2 Azure attempts (initial + 1 retry) + 1 Gemini fallback attempt
  assert.equal(urls.length, 3);
  assert.equal(result.provider, 'gemini');
  assert.equal(deltas.join(''), '0xbin uses Go, SQLite, and React.');
  assert.deepEqual(result.sourceIds, ['0xbin']);
});

test('handler: SSE streaming, warm LRU cache, curated fallback, and rate limiting all work end-to-end', async () => {
  const store = createMemoryStore({ rateMaxRequests: 4 });
  let llmCalls = 0;

  const generateAnswer = async ({ onDelta }) => {
    llmCalls++;
    if (onDelta) {
      onDelta('TrialSync matches patients ');
      onDelta('to clinical trials.');
    }
    return {
      paragraphs: ['TrialSync matches patients to clinical trials.'],
      sourceIds: ['trialsync']
    };
  };

  // 1. Disallowed origin -> 403
  const forbidden = await handleChat(
    makeRequest({ question: 'hi' }, { origin: 'https://evil.example' }),
    { generateAnswer, store }
  );
  assert.equal(forbidden.status, 403);

  // 2. Layer 1 fast-path -> 0 LLM calls
  const fastRes = await handleChat(
    makeRequest({ question: 'hi' }),
    { generateAnswer, store }
  );
  assert.equal(fastRes.status, 200);
  const fastJson = await fastRes.json();
  assert.equal(fastJson.mode, 'fast');
  assert.equal(llmCalls, 0);

  // 3. Layer 2 SSE streaming -> streams deltas + done event and caches result
  const sseRes = await handleChat(
    makeRequest({ question: 'How does TrialSync work?', stream: true }, { accept: 'text/event-stream' }),
    { generateAnswer, store }
  );
  assert.equal(sseRes.status, 200);
  assert.ok(sseRes.headers.get('content-type').includes('text/event-stream'));
  const rawSse = await sseRes.text();
  assert.ok(rawSse.includes('event: delta'));
  assert.ok(rawSse.includes('event: done'));
  assert.ok(rawSse.includes('https://trialsync.atuls.me/'));
  assert.equal(llmCalls, 1);

  // 4. Normalized repeat query hits warm cache (0 extra LLM calls)
  const cachedRes = await handleChat(
    makeRequest({ question: 'how does trialsync work' }),
    { generateAnswer, store }
  );
  const cachedJson = await cachedRes.json();
  assert.equal(cachedJson.mode, 'cache');
  assert.equal(llmCalls, 1);

  // 5. Upstream failure degrades cleanly to Layer 3 curated fallback (HTTP 200, not 503)
  const fallbackRes = await handleChat(
    makeRequest({ question: 'Explain 0xbin encryption' }),
    {
      generateAnswer: async () => {
        throw Object.assign(new Error('AllProvidersFailed'), { statusCode: 503 });
      },
      store,
      logger: { error() {} }
    }
  );
  assert.equal(fallbackRes.status, 200);
  const fbJson = await fallbackRes.json();
  assert.equal(fbJson.mode, 'fallback');
  assert.ok(fbJson.sources.some((s) => s.url === 'https://0xbin.app/'));

  // 6. 6th request within 60s hits per-IP rate limit (429 + Retry-After)
  const limited = await handleChat(
    makeRequest({ question: 'Another question' }),
    { generateAnswer, store }
  );
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get('retry-after')) >= 1);
});

test('knowledge: normalizeCacheKey collapses punctuation and case', () => {
  assert.equal(normalizeCacheKey("What is Atul's tech stack?!"), 'what is atul s tech stack');
});
