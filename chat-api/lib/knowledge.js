// Pure browser + Node ESM knowledge base, deterministic fast-path, and hybrid BM25/alias RAG retriever.
// Publish only information already shared on the portfolio or linked public pages.

export const starterPrompts = [
  { label: 'Projects', question: 'What projects has Atul built?' },
  { label: 'Tech stack', question: "What is Atul's tech stack?" },
  { label: 'TrialSync', question: 'How does TrialSync work?' },
  { label: 'Contact', question: 'How can I contact Atul?' }
];

export const publicNotes = [
  {
    id: 'about',
    title: 'About Atul',
    url: 'https://atulk.me/',
    summary: 'Final-year CS undergrad in Vadodara (from Rourkela, India) building in systems, AI, and automation.',
    aliases: [
      'atul kumar', 'about atul', 'about you', 'about yourself', 'who is atul',
      'your background', 'tell me about atul', 'biography', 'bio'
    ],
    keywords: 'atul kumar cs undergrad computer science engineering final year student vadodara rourkela india systems ai automation applied mathematics research papers implement ideas fast learner helping others developer',
    text: 'Atul Kumar is a final-year Computer Science engineering student based in Vadodara who grew up in Rourkela, India. He builds tools at the intersection of systems, AI, and automation, focusing on turning research and mathematical thinking into practical software. He regularly reads research papers, implements ideas, builds small Python automation tools, and enjoys helping others learn.'
  },
  {
    id: 'stack',
    title: 'Tech stack & skills',
    url: 'https://atulk.me/',
    summary: 'Python, C++, TypeScript, Java, Go; PyTorch/NLP ML systems; React, FastAPI, PostgreSQL; Vercel, Docker; DSA & system design.',
    aliases: [
      'tech stack', 'your stack', 'his stack', 'your skills', 'his skills',
      'programming languages', 'what languages', 'technologies'
    ],
    keywords: 'stack skills languages python c++ cpp typescript java go golang pytorch nlp ml machine learning healthcare energy full stack web apps react fastapi postgresql serverless cli vercel docker devops dsa data structures algorithms system design competitive programming 500 problems',
    text: 'Atul works with Python, C++, TypeScript, Java, and Go. He has built ML systems for healthcare and energy using PyTorch and NLP, full-stack web apps with TypeScript, React, FastAPI, and PostgreSQL, and serverless and CLI tools using Vercel and Docker. He is also comfortable across DevOps, system design, and algorithmic problem solving, with 500+ problems solved across competitive programming platforms.'
  },
  {
    id: 'ethos',
    title: 'Engineering ethos',
    url: 'https://atulk.me/',
    summary: 'Learn by building, prioritize math & systems fundamentals, automate routine work, apply research, build small compounding tools.',
    aliases: [
      'ethos', 'engineering ethos', 'philosophy', 'principles', 'values', 'how does atul think'
    ],
    keywords: 'ethos philosophy principles values mindset building fastest way learn fundamentals math systems trends automation mental energy research applied small well made tools compound teaching explaining reinforces learning',
    text: 'Atul follows six core principles: building is the fastest way to truly understand ideas; strong fundamentals in math and systems matter more than short-term trends; automation saves mental energy for harder problems; research is valuable only when applied; small, well-made tools compound over time; and teaching or explaining ideas reinforces learning.'
  },
  {
    id: 'contact',
    title: 'Contact and profiles',
    url: 'https://atulk.me/',
    summary: 'Email hello@atulk.me, GitHub/LinkedIn/X as 0atxl, plus competitive programming profiles.',
    links: [
      { title: 'Email', url: 'mailto:hello@atulk.me' },
      { title: 'GitHub', url: 'https://github.com/0atxl' },
      { title: 'LinkedIn', url: 'https://linkedin.com/in/0atxl' },
      { title: 'X', url: 'https://x.com/0atxl' }
    ],
    aliases: [
      'contact atul', 'contact you', 'contact him', 'your email', 'his email',
      'your github', 'his github', 'your linkedin', 'his linkedin', 'reach out',
      'reach atul', 'reach him', 'hire atul', 'social links', 'twitter', 'x profile'
    ],
    keywords: 'contact reach email mail hello@atulk.me social github linkedin x twitter profile profiles hire connect message handle 0atxl',
    text: 'You can reach Atul by email at hello@atulk.me, or connect with him on GitHub, LinkedIn, and X under the handle 0atxl. His portfolio also links to his public Codeforces, CodeChef, LeetCode, and HackerRank profiles.'
  },
  {
    id: 'profiles',
    title: 'Competitive programming profiles',
    url: 'https://atulk.me/',
    summary: '500+ algorithmic problems solved across Codeforces, CodeChef, LeetCode, and HackerRank.',
    links: [
      { title: 'Codeforces', url: 'https://codeforces.com/profile/0atxl' },
      { title: 'CodeChef', url: 'https://codechef.com/users/atxl' },
      { title: 'LeetCode', url: 'https://leetcode.com/u/0atxl' },
      { title: 'HackerRank', url: 'https://www.hackerrank.com/0atxl' }
    ],
    aliases: [
      'codeforces', 'codechef', 'leetcode', 'hackerrank',
      'competitive programming', 'cp profiles', 'coding profiles', 'dsa profiles'
    ],
    keywords: 'competitive programming cp dsa algorithms problem solving 500 problems codeforces codechef leetcode hackerrank 0atxl atxl profile profiles',
    text: 'Atul has solved 500+ algorithmic problems across competitive programming platforms. His public profiles are on Codeforces (0atxl), CodeChef (atxl), LeetCode (0atxl), and HackerRank (0atxl).'
  },
  {
    id: 'projects',
    title: 'Portfolio projects',
    url: 'https://atulk.me/#projects',
    summary: 'Nine featured projects: 0xbin, TrialSync, Morning, ClawForge, Subpoena, Stickies, apsis, Frost, and DOOR.',
    aliases: [
      'what have you built', 'what has atul built', 'your projects', 'his projects',
      'atul projects', 'what projects', 'list projects', 'all projects',
      'what do you build', 'what are you working on', 'portfolio projects', 'showcase'
    ],
    keywords: 'projects project portfolio examples showcase work built building repositories demos tools apps list overview',
    text: 'Atul’s portfolio features nine projects: 0xbin (encrypted paste sharing), TrialSync (clinical-trial eligibility screening), Morning (multilingual browser voice assistant), ClawForge (3D CAD studio and AI inference benchmark), Subpoena (courtroom-themed GitHub activity summaries), Stickies (native edge-of-screen desktop notes), apsis (Solana payment simulation and rent recovery), Frost (local Linux file manager with a browser UI), and DOOR (local-first GATE CS and DA practice).'
  },
  {
    id: '0xbin',
    title: '0xbin',
    url: 'https://0xbin.app/',
    repo: 'https://github.com/0atxl/0xbin',
    summary: 'Open-source encrypted paste sharing with auto-expiry, burn-after-read, and real-time collaboration (Go, SQLite, React).',
    aliases: ['0xbin', '0x bin', 'pastebin', 'paste sharing'],
    keywords: '0xbin paste pastes sharing encryption encrypted client side security expiry expiring burn after read password collaboration realtime websocket go golang api sqlite react frontend open source cli',
    text: '0xbin is an open-source paste-sharing service with automatic expiry, optional burn-after-read, and real-time collaboration. It supports client-side encryption and is built with a Go API, SQLite storage, and a React frontend. The live app is at 0xbin.app and the source code is on GitHub.'
  },
  {
    id: 'trialsync',
    title: 'TrialSync',
    url: 'https://trialsync.atuls.me/',
    repo: 'https://github.com/0atxl/TrialSync',
    summary: 'Clinical-trial patient eligibility screening with criterion-level evidence trails (FastAPI, React, PostgreSQL, LangChain, Gemini).',
    aliases: ['trialsync', 'trial sync', 'clinical trial', 'clinical trials'],
    keywords: 'trialsync clinical trial trials patient eligibility screen screening healthcare medical medicine match matching evidence trail citations criteria fastapi react postgresql transactions alembic migrations langchain gemini llm rag retrieval academic',
    text: 'TrialSync is an academic project for screening patients against clinical-trial eligibility criteria, producing an evidence trail with criterion-level evidence and missing information for each match. It uses FastAPI, React, PostgreSQL transactions, and Alembic migrations, paired with a LangChain and Gemini retrieval workflow that generates structured summaries citing approved trial criteria.'
  },
  {
    id: 'morning',
    title: 'Morning',
    url: 'https://morning.atuls.me/',
    repo: 'https://github.com/0atxl/morning',
    summary: 'Multilingual browser voice assistant for reminders, email drafts, and sourced answers (React, TS, Go on Azure, Deepgram, Groq).',
    aliases: ['morning', 'voice assistant'],
    keywords: 'morning multilingual voice speech microphone english hindi hinglish reminder reminders email draft drafts sourced answers react typescript go golang api azure deepgram live transcription groq structured json validation tavily mcp open meteo weather lookup search',
    text: 'Morning is a multilingual browser voice assistant for setting reminders, drafting editable emails, and getting sourced answers. It combines a React and TypeScript frontend with a Go API on Azure, Deepgram live transcription, and Groq structured JSON with server-side validation, using Tavily MCP and Open-Meteo for read-only lookups while leaving email drafts for users to review and send.'
  },
  {
    id: 'clawforge',
    title: 'ClawForge',
    url: 'https://tryclawforge.vercel.app/',
    repo: 'https://github.com/0atxl/clawforge',
    summary: 'Interactive 3D CAD studio streaming structured assemblies into Three.js with a side-by-side AI inference benchmark.',
    aliases: ['clawforge', 'claw forge', 'cad studio', '3d cad'],
    keywords: 'clawforge interactive 3d cad studio mechanical model models assemblies streaming structured three js threejs viewer side by side ai inference throughput benchmark gpu parts exploded views cross section cutaways',
    text: 'ClawForge is an interactive 3D CAD studio with a side-by-side AI inference benchmark. It streams structured CAD assemblies into a Three.js viewer and compares inference throughput, with interactive controls for inspecting parts, exploded views, and cross-section cutaways.'
  },
  {
    id: 'subpoena',
    title: 'Subpoena',
    url: 'https://subpoena.vercel.app/',
    repo: 'https://github.com/0atxl/subpoena',
    summary: 'Turns public GitHub repository and activity data into courtroom-themed summaries and printable rap sheets.',
    aliases: ['subpoena', 'rap sheet', 'rap sheets'],
    keywords: 'subpoena github activity commits repositories public contributions courtroom themed summaries printable rap sheet sheets shareable cards',
    text: 'Subpoena transforms public GitHub repository and contribution activity into courtroom-themed summaries and printable rap sheets, generating shareable cards directly from public GitHub data.'
  },
  {
    id: 'stickies',
    title: 'Stickies',
    url: 'https://getstickies.vercel.app/',
    repo: 'https://github.com/0atxl/stickies',
    summary: 'Small native desktop notes app that stays docked at the edge of the screen.',
    aliases: ['stickies', 'sticky notes', 'desktop notes'],
    keywords: 'stickies sticky note notes native desktop app edge screen writing quick capture',
    text: 'Stickies is a lightweight, native desktop notes application designed to stay neatly docked at the edge of the screen for quick note-taking. Both its website and GitHub repository are linked on the portfolio.'
  },
  {
    id: 'apsis',
    title: 'apsis',
    url: 'https://ap-sis.vercel.app/',
    repo: 'https://github.com/0atxl/ap-sis',
    summary: 'Simulates Solana payments before signing and closes empty token accounts in the same transaction to recover SOL deposits.',
    aliases: ['apsis', 'ap sis', 'solana payments', 'solana'],
    keywords: 'apsis ap sis solana crypto web3 payments payment transaction transactions wallet simulate simulation signing devnet sol empty token accounts rent refundable deposits recover recovery',
    text: 'apsis simulates Solana payments before signing and can bundle closing eligible empty token accounts into the same transaction to recover their refundable SOL rent deposits. The public demo runs on Solana Devnet and recovers existing deposits rather than generating yield.'
  },
  {
    id: 'frost',
    title: 'Frost',
    url: 'https://getfrost.vercel.app/',
    repo: 'https://github.com/0atxl/frost',
    summary: 'Local Linux file manager with a browser interface and an interactive sample-file demo.',
    aliases: ['frost', 'file manager', 'linux file manager'],
    keywords: 'frost linux local file manager files folders filesystem browser interface web ui desktop interactive demo sample files releases',
    text: 'Frost is a local Linux file manager featuring a browser-based interface. Its public website includes an interactive demo powered by sample files, and both source code and releases are published on GitHub.'
  },
  {
    id: 'door',
    title: 'DOOR',
    url: 'https://doorprep.vercel.app/',
    summary: 'Local-first practice app for the GATE CS and DA exams.',
    aliases: ['door', 'doorprep', 'gate practice', 'gate exam'],
    keywords: 'door doorprep gate cs da exam exams preparation prep practice study local first offline computer science data analytics',
    text: 'DOOR is a local-first practice application built for preparing for the GATE CS (Computer Science) and DA (Data Science & Artificial Intelligence) exams, with a public demo available at doorprep.vercel.app.'
  }
];

export const notesById = new Map(publicNotes.map((note) => [note.id, note]));

export const repoSlugByProjectId = Object.fromEntries(
  publicNotes
    .filter((note) => typeof note.repo === 'string' && note.repo.startsWith('https://github.com/'))
    .map((note) => [note.id, note.repo.replace('https://github.com/', '').replace(/\/+$/, '')])
);

export const portfolioIndexCard = [
  'Portfolio overview for Atul Kumar (handle: 0atxl, email: hello@atulk.me):',
  ...publicNotes.map((note) => `- [${note.id}] ${note.title}: ${note.summary}`)
].join('\n');

export const unknownAnswer = {
  paragraphs: [
    'That isn’t covered in Atul’s public portfolio notes. You can ask about his projects, tech stack, engineering ethos, or how to reach him.'
  ],
  sources: [],
  sourceIds: []
};

const stopWords = new Set(
  'a an and any are about at be by can could did do does for from get has have he him his how i in is it its me my of on or some tell that the their them there they this to was were what when where which who will with would you your'
    .split(' ')
);

const followUpCue = /^(and\b|also\b|what about\b|how about\b|tell me more\b|more\b|why\b|can you explain\b)|\b(it|its|that|this|those|them|first one|second one|last one|that project|this project|the repo|the website|the demo|the stack|tech stack)\b/i;

function stem(token) {
  if (token.length <= 3) return token;
  if (token.endsWith('ies') && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith('ing') && token.length > 5) return token.slice(0, -3);
  if (token.endsWith('tion') && token.length > 6) return token.slice(0, -4);
  if (token.endsWith('ed') && token.length > 4) return token.slice(0, -2);
  if (token.endsWith('es') && token.length > 4) return token.slice(0, -2);
  if (token.endsWith('s') && !token.endsWith('ss') && token.length > 3) return token.slice(0, -1);
  return token;
}

export function tokenize(value) {
  return (String(value ?? '').toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}+#@.-]+/gu) ?? [])
    .map((token) => token.replace(/^[.-]+|[.-]+$/g, ''))
    .filter(Boolean);
}

function phrase(value) {
  return ` ${tokenize(value).join(' ')} `;
}

export function normalizeCacheKey(question) {
  return tokenize(question).join(' ');
}

const corpusIndex = publicNotes.map((document) => {
  const rawTokens = tokenize(`${document.title} ${document.aliases.join(' ')} ${document.keywords} ${document.text}`);
  const stemmedTokens = rawTokens.map(stem);
  const tf = new Map();
  for (const token of stemmedTokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  const uniqueTokens = new Set([...rawTokens, ...stemmedTokens]);
  return {
    document,
    aliases: document.aliases.map(phrase),
    tf,
    uniqueTokens,
    length: stemmedTokens.length || 1
  };
});

const avgDocLength = corpusIndex.reduce((sum, entry) => sum + entry.length, 0) / corpusIndex.length;
const docFreq = new Map();
for (const entry of corpusIndex) {
  for (const token of entry.tf.keys()) {
    docFreq.set(token, (docFreq.get(token) ?? 0) + 1);
  }
}

const projectIds = new Set(['0xbin', 'trialsync', 'morning', 'clawforge', 'subpoena', 'stickies', 'apsis', 'frost', 'door']);

function findNamedEntries(text) {
  const q = phrase(text);
  return corpusIndex.filter(({ aliases }) => aliases.some((alias) => q.includes(alias)));
}

function extractHistoryTexts(history = []) {
  const texts = [];
  const priorSourceIds = [];
  for (const item of Array.isArray(history) ? history : []) {
    if (typeof item === 'string') {
      texts.push(item);
    } else if (item && typeof item === 'object') {
      if (typeof item.q === 'string') texts.push(item.q);
      if (typeof item.a === 'string') texts.push(item.a);
      if (Array.isArray(item.sourceIds)) {
        for (const id of item.sourceIds) {
          if (notesById.has(id)) priorSourceIds.push(id);
        }
      }
    }
  }
  return { texts, priorSourceIds };
}

export function retrieveDocuments(question, history = [], { limit = 4 } = {}) {
  const namedNow = findNamedEntries(question);
  const rawTerms = [...new Set(tokenize(question).filter((t) => !stopWords.has(t)))];
  const queryStems = [...new Set(rawTerms.map(stem))];

  const N = corpusIndex.length;
  const k1 = 1.2;
  const b = 0.75;

  const scores = new Map();
  for (const entry of corpusIndex) {
    let score = 0;

    if (namedNow.includes(entry)) {
      score += 10;
    }

    for (const qStem of queryStems) {
      const freq = entry.tf.get(qStem) ?? 0;
      if (freq > 0) {
        const df = docFreq.get(qStem) ?? 1;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        score += idf * ((freq * (k1 + 1)) / (freq + k1 * (1 - b + b * (entry.length / avgDocLength))));
      } else if (qStem.length >= 5) {
        for (const token of entry.uniqueTokens) {
          if (token.startsWith(qStem) || qStem.startsWith(token) && token.length >= 5) {
            score += 0.6;
            break;
          }
        }
      }
    }

    if (score > 0) {
      scores.set(entry.document.id, score);
    }
  }

  // Carry over context from recent Q+A turns for pronouns/follow-ups or sparse queries.
  if (history?.length && (followUpCue.test(question) || scores.size === 0)) {
    const { texts, priorSourceIds } = extractHistoryTexts(history);
    for (let i = priorSourceIds.length - 1; i >= 0; i--) {
      const id = priorSourceIds[i];
      scores.set(id, (scores.get(id) ?? 0) + 4.5);
    }
    for (const prevText of [...texts].reverse()) {
      const carried = findNamedEntries(prevText);
      if (carried.length) {
        for (const entry of carried) {
          scores.set(entry.document.id, (scores.get(entry.document.id) ?? 0) + 3.5);
        }
        break;
      }
    }
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => notesById.get(id))
    .filter(Boolean);
}

const complexQuestionHint = /\b(compare|comparison|versus|vs|difference|differ|better|best|why|explain|architecture|how does|how did|how is|built with|using|use|uses|workflow|deep dive|detail|details|favorite|favourite|recommend)\b/i;

export function matchFastPath(question, history = []) {
  const cleaned = String(question ?? '').trim();
  if (!cleaned) return null;

  const norm = normalizeCacheKey(cleaned);
  const words = norm ? norm.split(' ') : [];

  // 1. Pure greetings (instant, zero API calls).
  if (/^(hi|hello|hey|hiya|yo|sup|namaste|good morning|good afternoon|good evening|greetings)(\s+(there|assistant|bot|ai))?$/.test(norm)) {
    return {
      paragraphs: [
        'Hi! I’m the assistant for Atul Kumar’s portfolio. Ask me about his projects, tech stack, engineering ethos, or how to get in touch.'
      ],
      sources: [],
      sourceIds: [],
      mode: 'fast'
    };
  }

  // 2. Capability / identity questions.
  if (/^(who are you|what are you|what can you do|help|how does this work|what can i ask|what do you know)$/.test(norm)) {
    return {
      paragraphs: [
        'I’m Atul Kumar’s portfolio assistant. I can answer questions about his background, tech stack, engineering ethos, and projects like 0xbin, TrialSync, Morning, and ClawForge, and share links to demos and repositories.'
      ],
      sources: [],
      sourceIds: [],
      mode: 'fast'
    };
  }

  // Never hijack follow-ups, multi-part, or analytical questions — route those to AI.
  if (words.length > 10 || complexQuestionHint.test(cleaned)) return null;
  const named = findNamedEntries(cleaned);
  if (named.some(({ document }) => projectIds.has(document.id))) return null;

  // 3. Direct contact / links lookup.
  if (
    /^(contact|email|mail|reach out|github|linkedin|twitter|x|socials|social links)$/.test(norm) ||
    /^(how (can|do) i (contact|reach|email|connect with|message) (atul|him|you)|what is (atul s|atuls|his|your) (email|github|linkedin|contact|x|twitter)|where can i find (atul|him|you))$/.test(norm)
  ) {
    const doc = notesById.get('contact');
    return {
      paragraphs: [doc.text],
      sources: citationsFor([doc]),
      sourceIds: [doc.id],
      mode: 'fast'
    };
  }

  // 4. Direct competitive programming profiles lookup.
  if (/^(competitive programming|cp profiles|coding profiles|leetcode|codeforces|codechef|hackerrank|profiles)$/.test(norm)) {
    const doc = notesById.get('profiles');
    return {
      paragraphs: [doc.text],
      sources: citationsFor([doc]),
      sourceIds: [doc.id],
      mode: 'fast'
    };
  }

  // 5. Direct starter / overview lookups (only when not a nuanced follow-up).
  if (!history?.length || !followUpCue.test(cleaned)) {
    if (/^(projects|portfolio|what projects has atul built|what projects|list projects|show projects|what has atul built|what have you built|what is atul building)$/.test(norm)) {
      const doc = notesById.get('projects');
      return {
        paragraphs: [
          doc.text,
          'Ask about any specific project — like TrialSync, 0xbin, Morning, or ClawForge — to dive into its architecture and stack.'
        ],
        sources: citationsFor([doc]),
        sourceIds: [doc.id],
        mode: 'fast'
      };
    }

    if (/^(stack|tech stack|skills|what is atul s tech stack|what is atuls tech stack|what is his tech stack|what are atul s skills|what skills does atul have|what languages does atul know)$/.test(norm)) {
      const doc = notesById.get('stack');
      return {
        paragraphs: [doc.text],
        sources: citationsFor([doc]),
        sourceIds: [doc.id],
        mode: 'fast'
      };
    }

    if (/^(about|about atul|who is atul|tell me about atul|background|bio)$/.test(norm)) {
      const doc = notesById.get('about');
      return {
        paragraphs: [doc.text],
        sources: citationsFor([doc]),
        sourceIds: [doc.id],
        mode: 'fast'
      };
    }

    if (/^(ethos|engineering ethos|philosophy|what is atul s ethos|what is atuls ethos|principles)$/.test(norm)) {
      const doc = notesById.get('ethos');
      return {
        paragraphs: [doc.text],
        sources: citationsFor([doc]),
        sourceIds: [doc.id],
        mode: 'fast'
      };
    }
  }

  return null;
}

export function citationsFor(documents) {
  const links = documents.flatMap(({ title, url, repo, links }) => links ?? [
    { title, url },
    ...(repo ? [{ title: `${title} GitHub`, url: repo }] : [])
  ]);
  return [...new Map(links.map((link) => [link.url, link])).values()].slice(0, 6);
}

export function citationsByIds(sourceIds = []) {
  const docs = [];
  const seen = new Set();
  for (const id of Array.isArray(sourceIds) ? sourceIds : []) {
    const clean = String(id).trim().toLowerCase();
    if (!seen.has(clean) && notesById.has(clean)) {
      seen.add(clean);
      docs.push(notesById.get(clean));
    }
  }
  return citationsFor(docs);
}

export function buildFallbackAnswer(question, history = []) {
  const fast = matchFastPath(question, history);
  if (fast) return { ...fast, mode: 'fallback', notice: 'Showing curated portfolio notes.' };

  const namedProjects = findNamedEntries(question)
    .map((entry) => entry.document)
    .filter((doc) => projectIds.has(doc.id));

  const docs = namedProjects.length
    ? namedProjects.slice(0, 2)
    : retrieveDocuments(question, history, { limit: 2 });

  if (!docs.length) {
    return {
      ...unknownAnswer,
      mode: 'fallback',
      notice: 'Live AI is temporarily unavailable; searched curated portfolio notes.'
    };
  }
  return {
    paragraphs: docs.map(({ text }) => text),
    sources: citationsFor(docs),
    sourceIds: docs.map(({ id }) => id),
    mode: 'fallback',
    notice: 'Live AI is temporarily unavailable. Showing curated portfolio notes.'
  };
}
