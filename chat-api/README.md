# Portfolio chat API

The portfolio stays on GitHub Pages. The chat uses public notes in `lib/knowledge.js`. The API retrieves up to four notes, passes them to Gemini 3.5 Flash Lite, and returns short paragraphs with links from those notes.

When the portfolio has no API URL, the widget quotes relevant notes in the browser and shows their source links. It uses that same fallback with a visible notice if the provider returns a billing error.

## Deploy the endpoint

1. Create a Vercel project for this repo with **Root Directory** set to `chat-api` and **Framework Preset** set to **Other**. Leave **Automatically expose System Environment Variables** enabled. The function is `/api/chat`.
2. Add your Google AI Studio key as the Production secret `GOOGLE_GENERATIVE_AI_API_KEY` to use Google's Gemini API directly. `GEMINI_MODEL` can override the default `gemini-3.5-flash-lite`. Without a Google key, the API uses Vercel AI Gateway with OIDC or `AI_GATEWAY_API_KEY` and the model in `AI_GATEWAY_MODEL`.
3. Set `data-endpoint` on `#portfolio-chat` in the portfolio's `index.html` to the deployment's HTTPS `/api/chat` URL. The API allows browser requests from `atulk.me`, `www.atulk.me`, and `0atxl.github.io`.

The endpoint accepts questions up to 400 characters. It gives the model up to 320 output tokens and returns at most three paragraphs and 120 words. All source links come from the portfolio notes. The chat allows one pending question per browser and displays a retry message when the model service returns 429. Keep keys in the function environment and put only already-public information in the notes.
