const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
const path = require("path");
const { models } = require("./models");
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("node:process");

dotenv.config({ path: path.join(__dirname, ".env") });

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey });

async function main() {
  const rl = readline.createInterface({ input, output });

  while (true) {
    const contents = await rl.question("> ");

    if (contents.toLowerCase() === "exit" || contents.toLowerCase() === "quit") {
      break;
    }

    if (!contents.trim()) {
      continue;
    }

    const response = await ai.models.generateContentStream({
      model: models[1],
      contents,
    });

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
