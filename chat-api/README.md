# Portfolio chat API

The portfolio stays on GitHub Pages. The chat uses public notes in `lib/knowledge.js`. The API retrieves up to four notes, passes them to Gemini 3.5 Flash Lite through Vercel AI Gateway, and returns short paragraphs with links from those notes.

When the portfolio has no API URL, the widget quotes relevant notes in the browser and shows their source links.

## Deploy the endpoint

1. Create a Vercel project for this repo with **Root Directory** set to `chat-api` and **Framework Preset** set to **Other**. Leave **Automatically expose System Environment Variables** enabled. The function is `/api/chat`.
2. AI Gateway can authenticate automatically with Vercel OIDC. To use a dedicated Gateway key with a spending limit, set `AI_GATEWAY_API_KEY` in the function project's environment. Add any provider key through AI Gateway's BYOK settings. `AI_GATEWAY_MODEL` can override the default `google/gemini-3.5-flash-lite`.
3. Set `data-endpoint` on `#portfolio-chat` in the portfolio's `index.html` to the deployment's HTTPS `/api/chat` URL. The API allows browser requests from `atulk.me`, `www.atulk.me`, and `0atxl.github.io`.

The endpoint accepts questions up to 400 characters. It gives the model up to 320 output tokens and returns at most three paragraphs and 120 words. All source links come from the portfolio notes. The chat allows one pending question per browser and displays a retry message when the model service returns 429. Keep keys in the function environment and put only already-public information in the notes.
