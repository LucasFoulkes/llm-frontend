import { Hono } from "hono";
import { createAdaptorServer } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { streamSSE } from "hono/streaming";
import { streamResponse } from "./agent.js";

const app = new Hono();

app.get("/", serveStatic({ root: "./src", path: "login.html" }));
app.get("/chat", serveStatic({ root: "./src", path: "index.html" }));
app.use("/*", serveStatic({ root: "./src" }));

app.get("/downloads/*", async (c) => {
  const path = c.req.path;
  const res = await fetch(`http://localhost:3001${path}`);
  if (!res.ok) return c.text("not found", 404);
  const filename = path.split("/").pop();
  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});

app.post("/api/login", async (c) => {
  const body = await c.req.json();
  const res = await fetch("http://localhost:3001/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return c.json(await res.json());
});

app.post("/interaction", async (c) => {
  const { messages } = await c.req.json();
  if (!messages?.length) return c.json({ error: "messages is required" }, 400);

  const result = streamResponse(messages);

  return streamSSE(c, async (stream) => {
    for await (const part of result.fullStream) {
      const e = (data) => stream.writeSSE({ data: JSON.stringify(data) });
      switch (part.type) {
        case "reasoning-delta":
          await e({ type: "reasoning", text: part.delta });
          break;
        case "text-delta":
          await e({ type: "text", text: part.text });
          break;
        case "tool-call":
          await e({ type: "tool_call", name: part.toolName, args: part.input });
          break;
        case "tool-result":
          await e({ type: "tool_result", name: part.toolName, result: part.output });
          break;
        case "error":
          await e({ type: "error", error: String(part.error) });
          break;
      }
    }
  });
});

createAdaptorServer({ fetch: app.fetch }).listen(3000, () => {
  console.log(`Listening on http://localhost:3000`);
});
