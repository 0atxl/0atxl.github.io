# Portfolio chat

GitHub Pages serves the portfolio. The widget uses a 3-layer hybrid pipeline:

1. **Instant fast-path (`lib/knowledge.js`)** — greetings, capability questions, direct contact/profile lookups, and starter chips respond immediately with zero API calls.
2. **Hybrid RAG + GitHub-only streaming agent (`/api/chat` on Vercel)** — in-memory BM25 + alias retrieval selects the top matching notes alongside a compact portfolio index card, then streams the reply via SSE from **Azure AI Foundry (`gpt-6-luna`, `reasoning_effort: "none"`)**. When visitors ask deeper questions (license, free/open-source terms, setup, dependencies, recent activity), the agent can call read-only tools (`read_repo_file`, `get_repo_info`) scoped strictly to Atul’s allowlisted public GitHub repositories, with automatic retry and failover to an optional secondary Azure deployment or **Gemini 3.5 Flash-Lite**. Single-turn AI replies and fetched repo files are cached in memory (and single-turn replies in `sessionStorage` on the client).
3. **Curated notes fallback** — if all upstream providers fail or the browser is offline, the chat degrades cleanly to local retrieved notes and source links instead of showing an error dead-end.

## Vercel setup

Use `chat-api` as the Root Directory, the **Other** framework preset, and configure Production secrets:

* `AZURE_OPENAI_ENDPOINT` — e.g. `https://secbrainwillow.openai.azure.com` (or `.cognitiveservices.azure.com`)
* `AZURE_OPENAI_API_KEY` — Azure AI Foundry resource key
* `AZURE_OPENAI_DEPLOYMENT` — defaults to `gpt-6-luna`
* `AZURE_FALLBACK_DEPLOYMENT` *(optional)* — e.g. `gpt-5-nano`
* `GOOGLE_GENERATIVE_AI_API_KEY` *(optional)* — secondary fallback to `gemini-3.5-flash-lite`
