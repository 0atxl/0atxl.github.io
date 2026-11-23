# Portfolio chat

GitHub Pages serves the portfolio. The widget posts questions to `/api/chat`
on Vercel. The endpoint sends each valid question, recent questions, and the
public notes in `lib/knowledge.js` to Gemini 3.5 Flash-Lite. Gemini writes the
reply. The endpoint resolves any cited note IDs to public links.

On Vercel, use `chat-api` as the Root Directory, the Other framework preset,
and `GOOGLE_GENERATIVE_AI_API_KEY` as a server-side Production secret.
The widget shows an availability message if Gemini fails.
