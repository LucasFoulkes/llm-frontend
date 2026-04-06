const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
const path = require("node:path");
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("node:process");
const { tools, executeTool } = require("./tools");
const { models } = require("./models");
const { SYSTEM_INSTRUCTION } = require("./prompt");

dotenv.config({ path: path.resolve(__dirname, "../../", ".env"), quiet: true });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = models[2];

async function streamInteraction(params) {
  const stream = await ai.interactions.create({ ...params, stream: true });

  const functionCalls = [];
  let interactionId = null;

  for await (const chunk of stream) {
    if (chunk.event_type === "content.delta") {
      if (chunk.delta.type === "text" && chunk.delta.text) {
        process.stdout.write(chunk.delta.text);
      } else if (chunk.delta.type === "function_call") {
        functionCalls.push(chunk.delta);
      }
    } else if (chunk.event_type === "interaction.complete") {
      interactionId = chunk.interaction.id;
    }
  }

  return { interactionId, functionCalls };
}

async function main() {
  const rl = readline.createInterface({ input, output });
  let previousId;

  while (true) {
    const userInput = await rl.question("> ");
    if (!userInput.trim()) continue;

    try {
      let inputPayload = userInput.trim();

      while (true) {
        const { interactionId, functionCalls } = await streamInteraction({
          model: MODEL,
          system_instruction: SYSTEM_INSTRUCTION,
          input: inputPayload,
          previous_interaction_id: previousId,
          tools,
        });

        previousId = interactionId;

        if (functionCalls.length === 0) break;

        const results = [];
        for (const call of functionCalls) {
          const result = await executeTool(call.name, call.arguments);
          console.log(
            `\n[tool] ${call.name}(${JSON.stringify(call.arguments)})`
          );
          console.log(`[result]\n${result}`);
          results.push({
            type: "function_result",
            name: call.name,
            call_id: call.id,
            result: JSON.stringify(result),
          });
        }

        inputPayload = results;
      }

      process.stdout.write("\n");
    } catch (error) {
      console.error("Error:", error?.message || error);
    }
  }
}

main().catch((error) => {
  console.error("Fatal error:", error?.message || error);
  process.exit(1);
});
