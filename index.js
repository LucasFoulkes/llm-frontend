const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
const path = require("path");
const { models } = require("./models");
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("node:process");

dotenv.config({ path: path.resolve(__dirname, "..", ".env"), quiet: true });

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey });

async function runInteraction(task) {
  const originalWarn = console.warn;
  console.warn = (message, ...rest) => {
    if (typeof message === "string" && message.startsWith("GoogleGenAI.interactions:")) {
      return;
    }
    originalWarn(message, ...rest);
  };

  try {
    return await task();
  } finally {
    console.warn = originalWarn;
  }
}

async function main() {
  let previousInteractionId;
  const rl = readline.createInterface({ input, output });

  while (true) {
    const userInput = await rl.question(">");

    if (!userInput.trim()) {
      continue;
    }

    const interaction = await runInteraction(() =>
      ai.interactions.create({
        model: models[5],
        input: userInput,
        system_instruction: "your responses are always shor",
        previous_interaction_id: previousInteractionId,
        tools: [{ type: 'google_search' }]
      })
    );

    const textOutput = interaction.outputs.find((output) => output.type === "text");
    if (textOutput) {
      process.stdout.write(textOutput.text);
    }
    previousInteractionId = interaction.id;
    process.stdout.write("\n");
  }
}

main().catch((error) => {
  console.error("Error calling Gemini:", error?.message || error);
  process.exit(1);
});