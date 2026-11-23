(() => {
  const launcher = document.querySelector('#portfolio-chat-launcher');
  const panel = document.querySelector('#portfolio-chat');
  const close = document.querySelector('#portfolio-chat-close');
  const log = document.querySelector('#portfolio-chat-log');
  const form = document.querySelector('#portfolio-chat-form');
  const questionInput = document.querySelector('#portfolio-chat-question');
  const submit = document.querySelector('#portfolio-chat-send');
  const status = document.querySelector('#portfolio-chat-status');
  const phoneLayout = matchMedia('(max-width: 820px), (max-height: 520px) and (pointer: coarse)');
  const visualViewport = window.visualViewport;
  const history = [];
  let chatOpen = false;
  let restingHeight = 0;
  let restingWidth = 0;

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
    const atEnd = log.scrollHeight - log.scrollTop - log.clientHeight < 8;

    document.body.style.setProperty('--portfolio-visible-top', `${top}px`);
    panel.style.setProperty('--portfolio-visible-height', `${height}px`);
    panel.style.setProperty('--portfolio-keyboard-inset', `${bottom}px`);
    panel.classList.toggle('portfolio-chat-keyboard-open', keyboardOpen);
    if (atEnd) log.scrollTop = log.scrollHeight;
  }

  function setOpen(open) {
    if (open === chatOpen) return;
    chatOpen = open;
    runPortfolioTransition(open ? 'portfolio-chat-opening' : 'portfolio-chat-closing', () => {
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

  function showQuestion(question) {
    const line = document.createElement('p');
    line.className = 'portfolio-chat-question';
    const mark = document.createElement('span');
    mark.className = 'portfolio-chat-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = '> ';
    line.append(mark, question);
    log.append(line);
  }

  function showAnswer({ paragraphs, sources }) {
    if (!Array.isArray(paragraphs) || !paragraphs.length || paragraphs.some((text) => typeof text !== 'string')) {
      throw new Error('Chat returned an unreadable reply.');
    }
    for (const text of paragraphs.slice(0, 3)) {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      log.append(paragraph);
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
    if (links.childElementCount) log.append(links);
  }

  async function answerFromNotes(question) {
    const { retrieveDocuments, citationsFor, unknownAnswer } = await import('./chat-api/lib/knowledge.js');
    const notes = retrieveDocuments(question, history.slice(-3)).slice(0, 2);
    return notes.length ? { paragraphs: notes.map(({ text }) => text), sources: citationsFor(notes) } : unknownAnswer;
  }

  async function requestAnswer(question) {
    const endpoint = panel.dataset.endpoint;
    if (!endpoint) return answerFromNotes(question);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history: history.slice(-3) }),
      credentials: 'omit',
      signal: AbortSignal.timeout(18_000)
    });
    if (response.status === 429) throw new Error('The model service is busy. Try again shortly.');
    if (!response.ok) throw new Error('Chat couldn’t answer right now. Try again shortly.');
    return response.json();
  }

  if (!panel.dataset.endpoint) {
    log.querySelector('.portfolio-chat-intro').textContent = 'Ask about my projects or background. Answers use public portfolio notes.';
  }
  launcher.hidden = false;
  launcher.addEventListener('click', () => setOpen(true));
  close.addEventListener('click', () => setOpen(false));
  window.addEventListener('resize', fitPhoneChat);
  visualViewport?.addEventListener('resize', fitPhoneChat);
  visualViewport?.addEventListener('scroll', fitPhoneChat);
  questionInput.addEventListener('focus', fitPhoneChat);
  questionInput.addEventListener('blur', fitPhoneChat);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && chatOpen) setOpen(false);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const question = questionInput.value.trim();
    if (!question || submit.disabled) return;
    showQuestion(question);
    questionInput.value = '';
    submit.disabled = true;
    showStatus('Looking up portfolio notes…');
    log.scrollTop = log.scrollHeight;
    try {
      const answer = await requestAnswer(question);
      showAnswer(answer);
      history.push(question);
      if (history.length > 3) history.shift();
      showStatus();
    } catch (error) {
      showStatus(error instanceof Error && error.name === 'Error'
        ? error.message : 'Chat couldn’t answer right now. Try again shortly.');
    } finally {
      submit.disabled = false;
      log.scrollTop = log.scrollHeight;
    }
  });
})();
