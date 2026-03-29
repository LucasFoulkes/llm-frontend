const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
const path = require("path");
const { models } = require("./models");

dotenv.config({ path: path.join(__dirname, ".env") });


const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Set GEMINI_API_KEY in js-server/.env or environment before running.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function main() {
  const response = await ai.models.generateContentStream({
    model: models[1],
    contents: "Explain how AI works in 10 sentences.",
  });

  for await (const chunk of response){
    console.log(chunk.text)
  }
}

main().catch((error) => {
  console.error("Error calling Gemini:", error?.message || error);
  // process.exit(1);
});
