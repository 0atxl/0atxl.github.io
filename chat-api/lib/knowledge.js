// Publish only information already shared on the portfolio or linked public pages.
export const publicNotes = [
  {
    id: 'about', title: 'About Atul', url: 'https://atulk.me/',
    text: 'Atul Kumar is a final-year Computer Science engineering student based in Vadodara. He grew up in Rourkela, India. He builds tools in systems, AI, and automation, and is interested in applied mathematics and research. Public skills include Python, C++, TypeScript, Java, Go, React, FastAPI, PostgreSQL, Docker, DevOps, data structures, and system design.'
  },
  {
    id: 'contact', title: 'Contact and profiles', url: 'https://atulk.me/',
    links: [
      {title: 'Email', url: 'mailto:hello@atulk.me'},
      {title: 'GitHub', url: 'https://github.com/0atxl'},
      {title: 'LinkedIn', url: 'https://linkedin.com/in/0atxl'}
    ],
    text: 'Atul shares hello@atulk.me for contact and lists GitHub (0atxl) and LinkedIn (0atxl). The portfolio also links his public X, Codeforces, CodeChef, LeetCode, and HackerRank profiles.'
  },
  {
    id: 'projects', title: 'Portfolio projects', url: 'https://atulk.me/#projects',
    text: 'The portfolio features 0xbin (encrypted paste sharing), TrialSync (clinical-trial screening), Morning (voice assistant), ClawForge (3D CAD and inference benchmarking), Subpoena (GitHub activity summaries), Stickies (desktop notes), apsis (Solana payment simulation), Frost (Linux file manager), and DOOR (GATE exam practice).'
  },
  {
    id: '0xbin', title: '0xbin', url: 'https://0xbin.app/', repo: 'https://github.com/0atxl/0xbin',
    text: '0xbin is an open-source paste-sharing service with automatic expiry, optional burn-after-read, and real-time collaboration. It supports client-side encryption and has a Go API with SQLite and a React frontend. The public website is 0xbin.app and the source is on GitHub.'
  },
  {
    id: 'trialsync', title: 'TrialSync', url: 'https://trialsync.atuls.me/', repo: 'https://github.com/0atxl/TrialSync',
    text: 'TrialSync is an academic project for screening patients against clinical-trial criteria. Each result shows criterion-level evidence and missing information. It uses FastAPI, React, PostgreSQL transactions, and Alembic migrations. A LangChain and Gemini retrieval workflow produces structured summaries with citations to approved trial criteria. The public portfolio describes a screening project, and the repository documents the implementation.'
  },
  {
    id: 'morning', title: 'Morning', url: 'https://morning.atuls.me/', repo: 'https://github.com/0atxl/morning',
    text: 'Morning is a multilingual browser voice assistant for reminders, editable email drafts, and sourced answers. It uses React and TypeScript, a Go API on Azure, Deepgram live transcription, and Groq structured JSON with server-side validation. Its read-only lookups use Tavily MCP and Open-Meteo. The app opens drafts for people to review and send.'
  },
  {
    id: 'clawforge', title: 'ClawForge', url: 'https://tryclawforge.vercel.app/', repo: 'https://github.com/0atxl/clawforge',
    text: 'ClawForge is an interactive 3D CAD studio with a side-by-side AI inference benchmark. It streams structured CAD assemblies into a Three.js viewer and compares inference throughput. The studio supports inspecting parts, exploded views, and cross-section cutaways.'
  },
  {
    id: 'subpoena', title: 'Subpoena', url: 'https://subpoena.vercel.app/', repo: 'https://github.com/0atxl/subpoena',
    text: 'Subpoena turns public GitHub repository and activity data into courtroom-themed summaries and printable rap sheets. It renders shareable cards based on public activity.'
  },
  {
    id: 'stickies', title: 'Stickies', url: 'https://getstickies.vercel.app/', repo: 'https://github.com/0atxl/stickies',
    text: 'Stickies is a small, native desktop notes app that stays at the edge of the screen. The website shows the app and the source is on GitHub.'
  },
  {
    id: 'apsis', title: 'apsis', url: 'https://ap-sis.vercel.app/', repo: 'https://github.com/0atxl/ap-sis',
    text: 'apsis simulates Solana payments before signing and can include closing eligible empty token accounts in the same transaction to recover their refundable SOL deposits. The demo uses Solana Devnet. This recovers an existing deposit, not yield.'
  },
  {
    id: 'frost', title: 'Frost', url: 'https://getfrost.vercel.app/', repo: 'https://github.com/0atxl/frost',
    text: 'Frost is a local Linux file manager with a browser interface. Its public website includes an interactive demo using sample files. The source and releases are available on GitHub.'
  },
  {
    id: 'door', title: 'DOOR', url: 'https://doorprep.vercel.app/',
    text: 'DOOR is a local-first practice app for the GATE CS and DA exams. The portfolio links to the public demo at doorprep.vercel.app.'
  }
];

export function citationsFor(documents) {
  const links = documents.flatMap(({ title, url, repo, links }) => links ?? [
    { title, url },
    ...(repo ? [{ title: `${title} GitHub`, url: repo }] : [])
  ]);
  return [...new Map(links.map((link) => [link.url, link])).values()].slice(0, 6);
}
