const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
const path = require("path");
const { models } = require("./models");
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("node:process");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey });

async function main() {
  let previousInteractionId;
  const rl = readline.createInterface({ input, output });

  while (true) {
    const userInput = await rl.question("> ");

    if (!userInput.trim()) {
      continue;
    }

    const stream = await ai.interactions.create({
      model: models[5],
      input: userInput,
      system_instruction: "your responses are always short",
      previous_interaction_id: previousInteractionId,
      stream: true,
      tools: [{ type: 'google_search' }]
    });

    for await (const chunk of stream) {
      if (chunk.event_type === "content.delta") {
        if (chunk.delta.type === "text") {
          process.stdout.write(chunk.delta.text);
        }
      } else if (chunk.event_type === "interaction.complete") {
        previousInteractionId = chunk.interaction.id;
      }
    }
    process.stdout.write("\n");
  }
}

main().catch((error) => {
  console.error("Error calling Gemini:", error?.message || error);
  process.exit(1);
});