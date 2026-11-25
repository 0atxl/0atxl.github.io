// Monochrome trifold resume sheet modal + fold-and-fly PDF download

const dialog = document.querySelector('#resume-dialog');
const trigger = document.querySelector('#resume-trigger');
const closeBtn = document.querySelector('#resume-close');
const copyBtn = document.querySelector('#resume-copy-tab');
const copyLabel = copyBtn?.querySelector('.resume-copy-label');
const sheet = document.querySelector('#resume-sheet');
const sheetInner = document.querySelector('#resume-sheet-inner');
const stage = document.querySelector('#resume-stage');

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let isFolding = false;
let staticPdfAvailable = null;

// --- Top-layer exit fallback for Firefox / Safari (per animate-to-from-top-layer guide) ---
let supportsDisplayTransition;
function canTransitionDisplay() {
  if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
  if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
    return false;
  }
  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  supportsDisplayTransition = getComputedStyle(probe).display === 'block';
  probe.remove();
  return supportsDisplayTransition;
}

function supportsTopLayerExit() {
  return Boolean(window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay());
}

async function closeDialogAnimated(el) {
  if (!el?.open || el.hasAttribute('data-closing')) return;
  if (!supportsTopLayerExit()) {
    el.setAttribute('data-closing', '');
    const animations = el.getAnimations({ subtree: true });
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((a) => a.finished)),
        new Promise((r) => setTimeout(r, 400))
      ]);
    }
    if (!el.hasAttribute('data-closing')) return;
    el.removeAttribute('data-closing');
  }
  el.close();
}

// --- Clean PDF 1.4 fallback builder (used only until ./resume.pdf is dropped into the repo root) ---
function escapePdfText(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildFallbackResumePdfBlob() {
  const lines = [
    { text: 'ATUL KUMAR (/ 0atxl)', size: 15, bold: true, gap: 18 },
    { text: 'Final-year Computer Science Engineering Student | Vadodara, India (from Rourkela)', size: 9.5, gap: 13 },
    { text: 'Email: hello@atulk.me   |   Web: https://atulk.me   |   GitHub: github.com/0atxl   |   LinkedIn: linkedin.com/in/0atxl', size: 8.8, gap: 20 },
    { text: 'SUMMARY', size: 10.5, bold: true, gap: 14 },
    { text: 'CS undergrad building at the intersection of systems, AI, and automation. Focused on turning', size: 9.2, gap: 12 },
    { text: 'research and mathematical thinking into performant developer tools and practical software.', size: 9.2, gap: 18 },
    { text: 'TECHNICAL STACK', size: 10.5, bold: true, gap: 14 },
    { text: 'Languages: Python, C++, TypeScript, Java, Go', size: 9.2, gap: 12 },
    { text: 'AI & ML: PyTorch, NLP, LangChain, Gemini, RAG, ML systems for healthcare and energy', size: 9.2, gap: 12 },
    { text: 'Web & Infra: React, FastAPI, PostgreSQL, SQLite, Docker, Vercel, Azure, DevOps, System Design', size: 9.2, gap: 12 },
    { text: 'Algorithms: 500+ problems across Codeforces, CodeChef, LeetCode, and HackerRank', size: 9.2, gap: 18 },
    { text: 'SELECTED PROJECTS', size: 10.5, bold: true, gap: 14 },
    { text: '0xbin (0xbin.app) — Go, SQLite, React', size: 9.4, bold: true, gap: 12 },
    { text: '  Encrypted paste sharing with auto-expiry, burn-after-read, and real-time collaboration.', size: 9, gap: 14 },
    { text: 'TrialSync (trialsync.atuls.me) — FastAPI, React, PostgreSQL, Alembic, LangChain, Gemini', size: 9.4, bold: true, gap: 12 },
    { text: '  Clinical-trial patient eligibility screening with criterion-level evidence trails and citations.', size: 9, gap: 14 },
    { text: 'Morning (morning.atuls.me) — React, TypeScript, Go (Azure), Deepgram, Groq, Tavily MCP', size: 9.4, bold: true, gap: 12 },
    { text: '  Multilingual browser voice assistant for reminders, editable email drafts, and sourced answers.', size: 9, gap: 14 },
    { text: 'ClawForge (tryclawforge.vercel.app) — Three.js, Streaming Structured CAD, AI Benchmarking', size: 9.4, bold: true, gap: 12 },
    { text: '  Interactive 3D CAD studio with exploded views, cutaways, and side-by-side inference benchmark.', size: 9, gap: 14 },
    { text: 'Subpoena (subpoena.vercel.app) — Public GitHub API, Printable Cards', size: 9.4, bold: true, gap: 12 },
    { text: '  Courtroom-themed GitHub activity summaries and printable rap sheets.', size: 9, gap: 14 },
    { text: 'apsis (ap-sis.vercel.app) — Solana Devnet, Transaction Simulation', size: 9.4, bold: true, gap: 12 },
    { text: '  Simulates Solana payments and closes empty token accounts to recover refundable SOL deposits.', size: 9, gap: 14 },
    { text: 'Frost (getfrost.vercel.app) & Stickies (getstickies.vercel.app) & DOOR (doorprep.vercel.app)', size: 9.4, bold: true, gap: 12 },
    { text: '  Linux browser file manager, native edge-of-screen desktop notes, and local-first GATE prep app.', size: 9, gap: 18 },
    { text: 'EDUCATION', size: 10.5, bold: true, gap: 14 },
    { text: 'B.Tech / B.E. in Computer Science Engineering — Final Year (Vadodara, India)', size: 9.2, gap: 12 }
  ];

  let y = 748;
  const ops = ['BT'];
  for (const line of lines) {
    const font = line.bold ? '/F2' : '/F1';
    ops.push(`${font} ${line.size} Tf`);
    ops.push(`1 0 0 1 48 ${y.toFixed(1)} Tm`);
    ops.push(`(${escapePdfText(line.text)}) Tj`);
    y -= line.gap;
  }
  ops.push('ET');
  const stream = `${ops.join('\n')}\n`;

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>\nendobj\n',
    `6 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }
  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

async function triggerResumeDownload() {
  const href = dialog?.dataset.resumeHref || './resume.pdf';
  const filename = dialog?.dataset.resumeFilename || 'Atul-Kumar-Resume.pdf';

  if (staticPdfAvailable === null) {
    try {
      const check = await fetch(href, { method: 'HEAD', cache: 'no-store' });
      const ct = check.headers.get('content-type') || '';
      staticPdfAvailable = check.ok && ct.includes('pdf');
    } catch {
      staticPdfAvailable = false;
    }
  }

  const link = document.createElement('a');
  link.download = filename;

  if (staticPdfAvailable) {
    link.href = href;
    document.body.append(link);
    link.click();
    link.remove();
    return;
  }

  const blob = buildFallbackResumePdfBlob();
  const blobUrl = URL.createObjectURL(blob);
  link.href = blobUrl;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
}

function buildTrifoldClone() {
  const height = sheet.offsetHeight;
  const trifold = document.createElement('div');
  trifold.className = 'resume-trifold';
  trifold.setAttribute('aria-hidden', 'true');

  const packet = document.createElement('div');
  packet.className = 'trifold-packet';

  const makePanel = (cls, includeBack) => {
    const panel = document.createElement('div');
    panel.className = `trifold-panel ${cls}`;

    const front = document.createElement('div');
    front.className = 'trifold-face trifold-front';
    const slice = sheetInner.cloneNode(true);
    slice.removeAttribute('id');
    slice.className = 'resume-sheet-inner trifold-slice';
    slice.style.height = `${height}px`;
    slice.style.maxHeight = 'none';
    slice.style.overflow = 'hidden';
    // Strip duplicate IDs inside cloned slices.
    slice.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    front.append(slice);
    panel.append(front);

    if (includeBack) {
      const back = document.createElement('div');
      back.className = 'trifold-face trifold-back';
      panel.append(back);
    }
    return panel;
  };

  const mid = makePanel('trifold-mid', false);
  const bot = makePanel('trifold-bot', true);
  const top = makePanel('trifold-top', true);

  packet.append(mid, bot, top);
  trifold.append(packet);
  return { trifold, packet, top, bot };
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function takeCopy() {
  if (isFolding || !dialog?.open) return;
  isFolding = true;

  if (reduceMotion.matches) {
    await triggerResumeDownload();
    if (copyLabel) copyLabel.textContent = 'copied ✓';
    await wait(1200);
    if (copyLabel) copyLabel.textContent = 'take a copy';
    isFolding = false;
    return;
  }

  // Pre-warm PDF availability check before animating so download triggers on time.
  const { trifold, packet, top, bot } = buildTrifoldClone();
  stage.append(trifold);
  copyBtn?.classList.add('is-hidden-for-fold');
  sheet.classList.add('is-underneath');

  // Force layout flush so CSS transitions start from unfolded 0deg state.
  trifold.getBoundingClientRect();

  // Step 1: bottom third folds up.
  await wait(70);
  bot.classList.add('is-folded');

  // Step 2: top third folds down over the folded packet.
  await wait(290);
  top.classList.add('is-folded');

  // Step 3: folded letter packet lifts and flies up-right to browser download bar.
  await wait(300);
  packet.classList.add('is-flying');

  // Fire actual download right as folded packet arrives near browser download icon.
  await wait(140);
  triggerResumeDownload();

  // Step 4: fresh sheet underneath sharpens back into focus and tab reappears.
  await wait(320);
  trifold.remove();
  sheet.classList.remove('is-underneath');
  if (copyLabel) copyLabel.textContent = 'copied ✓';
  copyBtn?.classList.remove('is-hidden-for-fold');

  await wait(1400);
  if (copyLabel) copyLabel.textContent = 'take a copy';
  isFolding = false;
}

if (dialog && trigger) {
  trigger.addEventListener('click', () => {
    if (!dialog.open) {
      dialog.showModal();
    }
  });

  closeBtn?.addEventListener('click', () => closeDialogAnimated(dialog));
  copyBtn?.addEventListener('click', takeCopy);

  // Route native Esc / light-dismiss cancel events through top-layer exit animation.
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeDialogAnimated(dialog);
  });

  // Safari fallback for closedby="any" (per dialog guide: require press & release outside rect).
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const isOutside = (e) => {
      const r = stage.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    let pressedOutside = false;
    dialog.addEventListener('pointerdown', (e) => {
      pressedOutside = isOutside(e);
    });
    dialog.addEventListener('pointerup', (e) => {
      if (pressedOutside && isOutside(e)) closeDialogAnimated(dialog);
      pressedOutside = false;
    });
  }
}
