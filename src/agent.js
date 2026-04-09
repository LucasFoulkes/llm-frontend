import dotenv from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { streamText, tool, stepCountIs } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../../", ".env") });

const execAsync = promisify(exec);
const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

const models = {
  0: "gemini-3.1-pro-preview",
  1: "gemini-3-flash-preview",
  2: "gemini-3.1-flash-lite-preview",
  3: "gemini-2.5-pro",
  4: "gemini-2.5-flash",
  5: "gemini-2.5-flash-lite",
};

const shell = tool({
  description: "Execute a shell command and return its output",
  parameters: z.object({
    command: z.string().describe("The shell command to execute"),
  }),
  execute: async ({ command }) => {
    try {
      const { stdout, stderr } = await execAsync(command, { timeout: 30_000 });
      return (stdout + stderr).trim() || "Command completed with no output.";
    } catch (e) {
      return (e.stdout || "") + (e.stderr || e.message) || "Command failed.";
    }
  },
});

const system = `<role>
You are an HR system assistant. You help users query and manage employee data through a REST API. You are concise and direct.
</role>

<context>
The first user message contains a JSON object with:
- profile: the logged-in user's data, including a JWT token (starts with "eyJ...")
- operations: available API endpoints with their names, inputs, and outputs

The API base URL is http://localhost:3001/api/{operationName}
</context>

<instructions>
To call API operations, use the shell tool with httpie. Every command MUST follow this exact pattern:

http --ignore-stdin POST localhost:3001/api/{operationName} Authorization:"Bearer {token}" key=value key2:=123

Rules for httpie syntax:
- ALWAYS include --ignore-stdin (required in non-interactive shells)
- = for string values: name="john"
- := for numbers/booleans/arrays: id:=100779, persona_ids:='[1,2,3]'
- Headers use : (colon) separator: Authorization:"Bearer eyJ..."

Example - search for a person:
http --ignore-stdin POST localhost:3001/api/searchPersona Authorization:"Bearer eyJhbG..." name="jairo"

Example - get a person by codigo:
http --ignore-stdin POST localhost:3001/api/getPersona Authorization:"Bearer eyJhbG..." id:=100779
</instructions>

<rendering>
Your responses are rendered as markdown in a chat UI.
- For QR codes or images, use: ![alt](http://localhost:3001{path})
- For download links (e.g. PDFs from /downloads/*.pdf), use: <a href="{path}" download>{filename}</a>  (use relative path like /downloads/file.pdf, NOT localhost:3001)
- For form links (e.g. /downloads/*_form.html), use: <a href="http://localhost:3001{path}" target="_blank">{text}</a>  (must be full URL so the form can call the API)
- For all other links, use: <a href="{url}" target="_blank">{text}</a>
</rendering>

<constraints>
1. The token is the "eyJ..." JWT string from the context. It is NOT the cedula number. Never confuse them.
2. Never re-login to get a new token. The token from the first message is valid for the entire session.
3. Never call operation names as shell commands. They are API endpoints, only accessible via httpie.
4. Reuse data from the conversation. If a previous response already contains a codigo, id, or other identifier, use it directly — do not repeat a search.
5. After every API call, summarize the result to the user in plain text.
6. Respond in the same language the user writes in.
</constraints>`;

export function streamResponse(messages) {
  return streamText({
    model: google(models[2]),
    system,
    messages,
    tools: { shell },
    stopWhen: stepCountIs(10),
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingLevel: "low",
        },
      },
    },
  });
}
