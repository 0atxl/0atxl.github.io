# Portfolio chat

GitHub Pages serves the portfolio. The chat searches public notes in
`lib/knowledge.js` in the browser and displays matching excerpts and source links.
Its `data-endpoint` attribute in `index.html` is empty.

The former Vercel `/api/chat` endpoint returns HTTP 410. The retrieval and
response handler remains in `lib/handler.js` for a future backend.
