const { GoogleGenAI, ThinkingLevel } = require("@google/genai");
const dotenv = require("dotenv");
const path = require("path");
const { models } = require("./models");
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("node:process");

dotenv.config({ path: path.resolve(__dirname, "..", ".env"), quiet: true });

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey });

async function main() {
  const chat = ai.chats.create({
    model: models[5],
    history: [],
    config: {
      systemInstruction: "you are a computer, you always reply like a computer. like a terminal like a robot not in binary tho. still nieeds to be a human readable response.",
    }
  });
  const rl = readline.createInterface({ input, output });

  while (true) {
    const contents = await rl.question("> ");

    if (!contents.trim()) {
      continue;
    }

    const response = await chat.sendMessageStream({ message: contents });

    for await (const chunk of response) {
      process.stdout.write(chunk.text || "");
    }
    process.stdout.write("\n");
  }
}

main().catch((error) => {
  console.error("Error calling Gemini:", error?.message || error);
  process.exit(1);
});
