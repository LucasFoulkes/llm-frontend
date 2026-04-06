const { exec } = require("node:child_process");
const { promisify } = require("node:util");

const execAsync = promisify(exec);

const runCliCommandTool = {
  type: "function",
  name: "run_cli_command",
  description:
    "Execute a shell command in the user's terminal and return stdout/stderr. " +
    "Use for any filesystem operation (ls, find, cat, mkdir, touch, rm, mv, cp), " +
    "running scripts (node, python, bash), installing packages (npm, pip), " +
    "git operations, process management, and any other CLI task. " +
    "Commands run in a bash shell with a 30s timeout. " +
    "Prefer single concrete commands. Chain with && for dependent steps. " +
    "Use pipes and redirects freely.",
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description:
          "The bash command to execute. Examples: 'ls -la', 'cat package.json', " +
          "'git status', 'find . -name \"*.ts\" | head -20', 'npm install express'",
      },
      cwd: {
        type: "string",
        description:
          "Working directory for the command. Defaults to the user's current directory if omitted.",
      },
    },
    required: ["command"],
  },
};

async function runCliCommand(args = {}) {
  const { command, cwd } = args;

  if (!command?.trim()) {
    return "No command provided.";
  }

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout: 30_000,
      maxBuffer: 1024 * 1024, // 1MB
    });

    return (
      [stdout, stderr].filter((s) => s?.trim()).join("\n").trim() ||
      "Command completed with no output."
    );
  } catch (error) {
    return (
      [error?.stdout, error?.stderr, error?.message]
        .filter((s) => s?.toString().trim())
        .join("\n")
        .trim() || "Command failed with no output."
    );
  }
}

const tools = [runCliCommandTool];

async function executeTool(name, args) {
  if (name === "run_cli_command") return runCliCommand(args);
  return `Unknown tool: ${name}`;
}

module.exports = { tools, executeTool };