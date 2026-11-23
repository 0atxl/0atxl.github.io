// Publish only information already shared on the portfolio or linked public pages.
const documents = [
  {
    id: 'about', title: 'About Atul', url: 'https://atulk.me/',
    aliases: ['atul kumar', 'about atul', 'about you', 'about yourself', 'who are you', 'who is atul', 'your background', 'your skills'],
    keywords: 'atul bio biography background education student engineering year university based location hometown vadodara rourkela graduate graduation languages tech stack interests skills work developer studies',
    text: 'Atul Kumar is a final-year Computer Science engineering student based in Vadodara. He grew up in Rourkela, India. He builds tools in systems, AI, and automation, and is interested in applied mathematics and research. Public skills include Python, C++, TypeScript, Java, Go, React, FastAPI, PostgreSQL, Docker, DevOps, data structures, and system design.'
  },
  {
    id: 'contact', title: 'Contact and profiles', url: 'https://atulk.me/',
    links: [
      {title: 'Email', url: 'mailto:hello@atulk.me'},
      {title: 'GitHub', url: 'https://github.com/0atxl'},
      {title: 'LinkedIn', url: 'https://linkedin.com/in/0atxl'}
    ],
    aliases: ['contact atul', 'contact you', 'your email', 'your github', 'your linkedin', 'reach out'],
    keywords: 'contact reach email mail social github linkedin profile profiles hire connect handle 0atxl contact information',
    text: 'Atul shares hello@atulk.me for contact and lists GitHub (0atxl) and LinkedIn (0atxl). The portfolio also links his public X, Codeforces, CodeChef, LeetCode, and HackerRank profiles.'
  },
  {
    id: 'projects', title: 'Portfolio projects', url: 'https://atulk.me/#projects',
    aliases: ['what have you built', 'your projects', 'atul s projects', 'what projects', 'list projects', 'what do you build', 'what are you working on'],
    keywords: 'projects project portfolio examples showcase work built building repositories demos',
    text: 'The portfolio features 0xbin (encrypted paste sharing), TrialSync (clinical-trial screening), Morning (voice assistant), ClawForge (3D CAD and inference benchmarking), Subpoena (GitHub activity summaries), Stickies (desktop notes), apsis (Solana payment simulation), Frost (Linux file manager), and DOOR (GATE exam practice).'
  },
  {
    id: '0xbin', title: '0xbin', url: 'https://0xbin.app/', repo: 'https://github.com/0atxl/0xbin',
    aliases: ['0xbin', '0x bin', 'pastebin'],
    keywords: 'paste pastes encryption encrypted client side share expiry expiring burn after read password collaboration realtime websocket go sqlite react cli',
    text: '0xbin is an open-source paste-sharing service with automatic expiry, optional burn-after-read, and real-time collaboration. It supports client-side encryption and has a Go API with SQLite and a React frontend. The public website is 0xbin.app and the source is on GitHub.'
  },
  {
    id: 'trialsync', title: 'TrialSync', url: 'https://trialsync.atuls.me/', repo: 'https://github.com/0atxl/TrialSync',
    aliases: ['trialsync', 'trial sync'],
    keywords: 'clinical trial trials patient eligibility screen screening medical medicine match matching evidence citations fastapi pytest postgresql alembic migrations langchain gemini llm rag xgboost',
    text: 'TrialSync is an academic project for screening patients against clinical-trial criteria. Each result shows criterion-level evidence and missing information. It uses FastAPI, React, PostgreSQL transactions, and Alembic migrations. A LangChain and Gemini retrieval workflow produces structured summaries with citations to approved trial criteria. The public portfolio describes a screening project, and the repository documents the implementation.'
  },
  {
    id: 'morning', title: 'Morning', url: 'https://morning.atuls.me/', repo: 'https://github.com/0atxl/morning',
    aliases: ['morning', 'voice assistant'],
    keywords: 'voice speech microphone english hindi hinglish reminder reminders email draft drafts deepgram groq llm json structured azure go react typescript tavily mcp open meteo lookup search',
    text: 'Morning is a multilingual browser voice assistant for reminders, editable email drafts, and sourced answers. It uses React and TypeScript, a Go API on Azure, Deepgram live transcription, and Groq structured JSON with server-side validation. Its read-only lookups use Tavily MCP and Open-Meteo. The app opens drafts for people to review and send.'
  },
  {
    id: 'clawforge', title: 'ClawForge', url: 'https://tryclawforge.vercel.app/', repo: 'https://github.com/0atxl/clawforge',
    aliases: ['clawforge', 'claw forge', 'cad studio'],
    keywords: 'cad 3d model models mechanical assemblies three js gpu inference benchmark cerebras side by side rendering',
    text: 'ClawForge is an interactive 3D CAD studio with a side-by-side AI inference benchmark. It streams structured CAD assemblies into a Three.js viewer and compares inference throughput. The studio supports inspecting parts, exploded views, and cross-section cutaways.'
  },
  {
    id: 'subpoena', title: 'Subpoena', url: 'https://subpoena.vercel.app/', repo: 'https://github.com/0atxl/subpoena',
    aliases: ['subpoena', 'rap sheet'],
    keywords: 'github activity commits repositories public contributions court courtroom noir printable png dynamic preview rap sheet',
    text: 'Subpoena turns public GitHub repository and activity data into courtroom-themed summaries and printable rap sheets. It renders shareable cards based on public activity.'
  },
  {
    id: 'stickies', title: 'Stickies', url: 'https://getstickies.vercel.app/', repo: 'https://github.com/0atxl/stickies',
    aliases: ['stickies', 'sticky notes', 'desktop notes'],
    keywords: 'note notes native desktop edge screen writing linux',
    text: 'Stickies is a small, native desktop notes app that stays at the edge of the screen. The website shows the app and the source is on GitHub.'
  },
  {
    id: 'apsis', title: 'apsis', url: 'https://ap-sis.vercel.app/', repo: 'https://github.com/0atxl/ap-sis',
    aliases: ['apsis', 'ap sis', 'solana payments'],
    keywords: 'solana payments payment transaction transactions wallet simulate simulation devnet sol token accounts rent deposits recover hackathon',
    text: 'apsis simulates Solana payments before signing and can include closing eligible empty token accounts in the same transaction to recover their refundable SOL deposits. The demo uses Solana Devnet. This recovers an existing deposit, not yield.'
  },
  {
    id: 'frost', title: 'Frost', url: 'https://getfrost.vercel.app/', repo: 'https://github.com/0atxl/frost',
    aliases: ['frost', 'file manager'],
    keywords: 'linux local browser files folders filesystem desktop interactive demo sample files',
    text: 'Frost is a local Linux file manager with a browser interface. Its public website includes an interactive demo using sample files. The source and releases are available on GitHub.'
  },
  {
    id: 'door', title: 'DOOR', url: 'https://doorprep.vercel.app/',
    aliases: ['door', 'doorprep', 'gate practice'],
    keywords: 'gate cs da exam exams preparation prep practice study local first computer science data analytics',
    text: 'DOOR is a local-first practice app for the GATE CS and DA exams. The portfolio links to the public demo at doorprep.vercel.app.'
  }
];

export const unknownAnswer = {
  paragraphs: ["I don't have that information in Atul's public portfolio. Try asking about a project, his background, or how to reach him."],
  sources: []
};

const stopWords = new Set('a an and any about at be can could did do does for from how i in is it me of on or some tell that the their them there they this to was what when where which who will with would you your'.split(' '));
const words = (value) => value.toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}+#]+/gu) ?? [];
const phrase = (value) => ` ${words(value).join(' ')} `;

const index = documents.map((document) => ({
  document,
  aliases: document.aliases.map(phrase),
  terms: new Set(words(`${document.title} ${document.keywords}`))
}));

function namedDocuments(question) {
  const query = phrase(question);
  return index.filter(({ aliases }) => aliases.some((alias) => query.includes(alias)));
}

export function retrieveDocuments(question, history = []) {
  const named = namedDocuments(question);
  if (named.length) return named.slice(0, 4).map(({ document }) => document);

  if (/^(and\b|also\b|what about\b|tell me more\b)|\b(it|its|that project|this project|the repo|the website)\b/i.test(question)) {
    for (const previous of [...history].reverse()) {
      const carry = namedDocuments(previous);
      if (carry.length) return carry.slice(0, 4).map(({ document }) => document);
    }
  }

  const queryTerms = [...new Set(words(question).filter((term) => !stopWords.has(term)))];
  return index.map((entry) => ({
    document: entry.document,
    score: queryTerms.reduce((total, term) => {
      if (!entry.terms.has(term)) return total;
      const frequency = index.filter(({ terms }) => terms.has(term)).length;
      return total + 1 / frequency;
    }, 0)
  })).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score)
    .slice(0, 4).map(({ document }) => document);
}

export function citationsFor(documents) {
  const links = documents.flatMap(({ title, url, repo, links }) => links ?? [
    { title, url },
    ...(repo ? [{ title: `${title} GitHub`, url: repo }] : [])
  ]);
  return [...new Map(links.map((link) => [link.url, link])).values()].slice(0, 6);
}
