const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
const path = require("path");
const { models } = require("./models");
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("node:process");

dotenv.config({ path: path.join(__dirname, ".env") });

const apiKey = process.env.GEMINI_API_KEY;
const selectedModel = models[1];

const ai = new GoogleGenAI({ apiKey });

async function main() {
  const chat = ai.chats.create({
    model: selectedModel,
    history: [],
    config: {
      systemInstruction: "you are a computer, you always reply like a computer. like a terminal like a robot",
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

  rl.close();
}

main().catch((error) => {
  console.error("Error calling Gemini:", error?.message || error);
  process.exit(1);
});
