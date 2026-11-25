import {
  buildFallbackAnswer,
  matchFastPath,
  normalizeCacheKey,
  starterPrompts
} from './chat-api/lib/knowledge.js?v=6';

const launcher = document.querySelector('#portfolio-chat-launcher');
const panel = document.querySelector('#portfolio-chat');
const close = document.querySelector('#portfolio-chat-close');
const clearBtn = document.querySelector('#portfolio-chat-clear');
const log = document.querySelector('#portfolio-chat-log');
const form = document.querySelector('#portfolio-chat-form');
const questionInput = document.querySelector('#portfolio-chat-question');
const submit = document.querySelector('#portfolio-chat-send');
const status = document.querySelector('#portfolio-chat-status');
const phoneLayout = matchMedia('(max-width: 820px), (max-height: 520px) and (pointer: coarse)');
const visualViewport = window.visualViewport;

const CACHE_PREFIX = 'atulk-chat:v6:';
const CACHE_TTL_MS = 30 * 60 * 1000;
const INTRO_TEXT = 'Ask about a project, my background, or how to reach me.';
const history = [];
let chatOpen = false;
let restingHeight = 0;
let restingWidth = 0;
let suggestionsEl = null;

function isScrolledNearEnd() {
  return log.scrollHeight - log.scrollTop - log.clientHeight < 24;
}

function fitPhoneChat() {
  if (panel.hidden || !phoneLayout.matches) return;

  // Mobile keyboards can resize the visual viewport without moving fixed elements.
  const height = visualViewport?.height ?? window.innerHeight;
  const top = Math.max(0, visualViewport?.offsetTop ?? 0);
  const bottom = Math.max(0, window.innerHeight - top - height);
  const typing = document.activeElement === questionInput;
  if (!restingHeight || restingWidth !== window.innerWidth || (!typing && bottom < 72)) {
    restingHeight = height;
    restingWidth = window.innerWidth;
  }
  const keyboardOpen = bottom >= 72 || (typing && restingHeight - height >= 72);
  const atEnd = isScrolledNearEnd();

  document.body.style.setProperty('--portfolio-visible-top', `${top}px`);
  panel.style.setProperty('--portfolio-visible-height', `${height}px`);
  panel.style.setProperty('--portfolio-keyboard-inset', `${bottom}px`);
  panel.classList.toggle('portfolio-chat-keyboard-open', keyboardOpen);
  if (atEnd) log.scrollTop = log.scrollHeight;
}

function setOpen(open) {
  if (open === chatOpen) return;
  chatOpen = open;
  const runTransition = typeof window.runPortfolioTransition === 'function'
    ? window.runPortfolioTransition
    : (_name, fn) => fn();

  runTransition(open ? 'portfolio-chat-opening' : 'portfolio-chat-closing', () => {
    document.body.classList.toggle('portfolio-chat-open', open);
    panel.hidden = !open;
    launcher.hidden = open;
    launcher.setAttribute('aria-expanded', String(open));
    if (open) {
      restingHeight = 0;
      fitPhoneChat();
      (phoneLayout.matches ? close : questionInput).focus({ preventScroll: true });
    } else {
      launcher.focus({ preventScroll: true });
    }
  });
}

function showStatus(message = '') {
  status.textContent = message;
  status.hidden = !message;
}

function updateClearVisibility() {
  if (clearBtn) {
    clearBtn.hidden = history.length === 0 && !log.querySelector('.portfolio-chat-question');
  }
}

function readClientCache(key) {
  if (!key) return null;
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() - parsed.at > CACHE_TTL_MS) {
      sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

function writeClientCache(key, value) {
  if (!key) return;
  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({ at: Date.now(), value }));
  } catch {
    // Ignore storage quota / privacy mode failures.
  }
}

function showQuestion(question) {
  const line = document.createElement('p');
  line.className = 'portfolio-chat-question';
  const mark = document.createElement('span');
  mark.className = 'portfolio-chat-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '> ';
  line.append(mark, question);
  log.append(line);
  updateClearVisibility();
}

function createAnswerContainer({ streaming = false } = {}) {
  const box = document.createElement('div');
  box.className = 'portfolio-chat-answer';
  if (streaming) {
    const p = document.createElement('p');
    p.className = 'portfolio-chat-streaming';
    box.append(p);
  }
  log.append(box);
  return box;
}

function renderToolStatus(box, text) {
  const pinBottom = isScrolledNearEnd();
  box.replaceChildren();
  const line = document.createElement('p');
  line.className = 'portfolio-chat-tool-status';
  line.textContent = text;
  box.append(line);
  if (pinBottom) log.scrollTop = log.scrollHeight;
}

function renderStreamingText(box, rawText) {
  const pinBottom = isScrolledNearEnd();
  const parts = rawText
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}|\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const display = parts.length ? parts.slice(0, 3) : [''];
  box.replaceChildren();
  display.forEach((text, idx) => {
    const p = document.createElement('p');
    p.textContent = text;
    if (idx === display.length - 1) p.className = 'portfolio-chat-streaming';
    box.append(p);
  });
  if (pinBottom) log.scrollTop = log.scrollHeight;
}

function renderFinalAnswer(box, { paragraphs, sources }) {
  if (!Array.isArray(paragraphs) || !paragraphs.length || paragraphs.some((text) => typeof text !== 'string')) {
    throw new Error('Chat returned an unreadable reply.');
  }

  const pinBottom = isScrolledNearEnd();
  box.replaceChildren();
  for (const text of paragraphs.slice(0, 3)) {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    box.append(paragraph);
  }

  const links = document.createElement('p');
  links.className = 'portfolio-chat-sources';
  for (const source of Array.isArray(sources) ? sources.slice(0, 6) : []) {
    try {
      const url = new URL(source.url);
      if (!['https:', 'mailto:'].includes(url.protocol) || typeof source.title !== 'string') continue;
      const link = document.createElement('a');
      link.href = url.href;
      link.rel = 'noopener noreferrer';
      if (url.protocol === 'https:') link.target = '_blank';
      link.textContent = `${source.title} ↗`;
      links.append(link);
    } catch {
      // Skip a source if its URL is invalid.
    }
  }
  if (links.childElementCount) box.append(links);
  if (pinBottom) log.scrollTop = log.scrollHeight;
}

async function consumeSseResponse(response, { onDelta, onStatus }) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Chat stream was empty.');

  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let finalPayload = null;

  const processBlock = (rawBlock) => {
    let eventName = 'message';
    const dataLines = [];
    for (const line of rawBlock.split(/\r?\n/)) {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
    }
    if (!dataLines.length) return;
    const payload = JSON.parse(dataLines.join('\n'));
    if (eventName === 'status' && typeof payload?.text === 'string') {
      onStatus?.(payload.text);
    } else if (eventName === 'delta' && typeof payload?.text === 'string') {
      onDelta(payload.text);
    } else if (eventName === 'done') {
      finalPayload = payload;
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary;
      while ((boundary = buffer.search(/\r?\n\r?\n/)) !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary).replace(/^\r?\n\r?\n/, '');
        if (block.trim()) processBlock(block);
      }
    }
    buffer += decoder.decode();
    if (buffer.trim()) processBlock(buffer);
  } finally {
    reader.releaseLock();
  }

  if (!finalPayload) throw new Error('Chat stream ended unexpectedly.');
  return finalPayload;
}

async function requestAnswer(question, callbacks) {
  const endpoint = panel.dataset.endpoint;
  if (!endpoint) return buildFallbackAnswer(question, history);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream'
    },
    body: JSON.stringify({
      question,
      history: history.slice(-3),
      stream: true
    }),
    credentials: 'omit',
    signal: AbortSignal.timeout(24_000)
  });

  if (response.status === 429) {
    const err = await response.json().catch(() => null);
    throw Object.assign(
      new Error(err?.error || 'Too many questions in a short time. Try again in a moment.'),
      { statusCode: 429 }
    );
  }
  if (!response.ok) {
    throw Object.assign(new Error('Upstream chat error.'), { statusCode: response.status });
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('text/event-stream')) {
    return consumeSseResponse(response, callbacks);
  }
  return response.json();
}

function recordTurn(question, answer) {
  const summary = Array.isArray(answer.paragraphs) ? answer.paragraphs.join(' ').slice(0, 500) : '';
  const sourceIds = Array.isArray(answer.sourceIds) ? answer.sourceIds.slice(0, 4) : [];
  history.push({ q: question, a: summary, sourceIds });
  if (history.length > 3) history.shift();
  updateClearVisibility();
}

function renderStarterChips() {
  if (suggestionsEl) return;
  const group = document.createElement('div');
  group.className = 'portfolio-chat-suggestions';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Suggested questions');

  for (const item of starterPrompts) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'portfolio-chat-chip';
    chip.textContent = item.label;
    chip.addEventListener('click', () => {
      if (submit.disabled) return;
      askQuestion(item.question);
    });
    group.append(chip);
  }

  suggestionsEl = group;
  log.append(group);
}

function clearChat() {
  if (submit.disabled) return;
  history.length = 0;
  suggestionsEl = null;
  log.replaceChildren();
  const intro = document.createElement('p');
  intro.className = 'portfolio-chat-intro';
  intro.textContent = INTRO_TEXT;
  log.append(intro);
  renderStarterChips();
  showStatus();
  updateClearVisibility();
  questionInput.focus({ preventScroll: true });
}

async function askQuestion(rawQuestion) {
  const question = rawQuestion.trim();
  if (!question || submit.disabled) return;

  if (suggestionsEl) {
    suggestionsEl.remove();
    suggestionsEl = null;
  }

  showQuestion(question);
  questionInput.value = '';
  showStatus();
  log.scrollTop = log.scrollHeight;

  // Layer 1: 0ms client-side deterministic fast-path.
  const fast = matchFastPath(question, history);
  if (fast) {
    const box = createAnswerContainer();
    renderFinalAnswer(box, fast);
    recordTurn(question, fast);
    return;
  }

  // Layer 1.5: 0ms client-side session cache for repeated single-turn AI queries.
  const cacheKey = history.length === 0 ? normalizeCacheKey(question) : '';
  const cached = cacheKey ? readClientCache(cacheKey) : null;
  if (cached) {
    const box = createAnswerContainer();
    renderFinalAnswer(box, cached);
    recordTurn(question, cached);
    return;
  }

  // Layer 2: Live SSE streaming from Vercel -> Azure Foundry (gpt-6-luna + GitHub repo tools).
  submit.disabled = true;
  log.setAttribute('aria-busy', 'true');
  const box = createAnswerContainer({ streaming: true });
  let streamed = '';
  log.scrollTop = log.scrollHeight;

  try {
    const answer = await requestAnswer(question, {
      onStatus(text) {
        if (!streamed) renderToolStatus(box, text);
      },
      onDelta(delta) {
        streamed += delta;
        renderStreamingText(box, streamed);
      }
    });
    renderFinalAnswer(box, answer);
    recordTurn(question, answer);
    if (cacheKey && answer.mode === 'ai') {
      writeClientCache(cacheKey, {
        paragraphs: answer.paragraphs,
        sources: answer.sources,
        sourceIds: answer.sourceIds
      });
    }
    showStatus(answer.notice || '');
  } catch (error) {
    if (error?.statusCode === 429) {
      box.remove();
      showStatus(error.message);
    } else {
      // Layer 3: Client-side offline / network-failure fallback to curated notes.
      const fallback = buildFallbackAnswer(question, history);
      renderFinalAnswer(box, fallback);
      recordTurn(question, fallback);
      showStatus(fallback.notice || 'Showing curated portfolio notes right now.');
    }
  } finally {
    log.removeAttribute('aria-busy');
    submit.disabled = false;
    log.scrollTop = log.scrollHeight;
  }
}

renderStarterChips();
updateClearVisibility();
launcher.hidden = false;
launcher.addEventListener('click', () => setOpen(true));
close.addEventListener('click', () => setOpen(false));
clearBtn?.addEventListener('click', clearChat);
window.addEventListener('resize', fitPhoneChat);
visualViewport?.addEventListener('resize', fitPhoneChat);
visualViewport?.addEventListener('scroll', fitPhoneChat);
questionInput.addEventListener('focus', fitPhoneChat);
questionInput.addEventListener('blur', fitPhoneChat);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && chatOpen && !document.querySelector('dialog[open]')) {
    setOpen(false);
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  askQuestion(questionInput.value);
});
