# Stack

## Runtime

- **Node.js** — JavaScript runtime. Uses ES Modules (`"type": "module"`).

## Dependencies

### Server

- **Hono** — lightweight web framework. Handles routing, request parsing, static file serving. Alternative to Express but faster and built on web standards (Request/Response).
- **@hono/node-server** — adapter to run Hono on Node.js. Hono is designed for edge runtimes so this bridges it to Node's `http` module.

### AI

- **ai** (Vercel AI SDK) — framework for building AI apps. Provides `streamText()` which handles streaming LLM responses. Returns a standard `Response` with a `ReadableStream` body — no manual SSE formatting needed.
- **@ai-sdk/google** — Google Gemini provider for the AI SDK. Wraps the Gemini API so `streamText()` can talk to Gemini models.

### Utilities

- **dotenv** — loads environment variables from `.env` files. We use it to load `GEMINI_API_KEY`.

### Dev

- **nodemon** — watches files for changes and restarts the server automatically. Used via `npm run dev`.

## Client-side (CDN)

- **Alpine.js** — reactive UI framework. Adds reactivity to HTML with attributes like `x-data`, `x-for`, `x-model`. No build step needed. Replaces manual DOM manipulation.
- **marked** — markdown parser. Converts the model's markdown responses to HTML for rendering.

## Concepts

### Streaming

The model generates text token-by-token. Instead of waiting for the full response, we stream it to the browser as it's generated:

1. Client sends a POST with the message
2. Server calls `streamText()` which returns a streaming `Response`
3. `toTextStreamResponse()` sends plain text chunks as a `ReadableStream`
4. Client reads chunks with `ReadableStream.getReader()` and appends each chunk to the DOM

### ReadableStream

A web standard for consuming data incrementally. The client calls `reader.read()` in a loop — each call resolves when the next chunk arrives from the server. This is what makes the text appear word-by-word in the browser.

### ES Modules (ESM)

JavaScript's standard module system. Uses `import`/`export` instead of `require`/`module.exports` (CommonJS). The `ai` package only ships ESM, which is why the project uses `"type": "module"` in package.json.
