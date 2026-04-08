import readline from "readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { streamResponse } from "../src/agent.js";

async function main() {
  const rl = readline.createInterface({ input, output });

  while (true) {
    const userInput = await rl.question("> ");
    if (!userInput.trim()) continue;
    const result = streamResponse(userInput.trim());
    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
    console.log();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error?.message || error);
  process.exit(1);
});
