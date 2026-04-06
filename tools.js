const pty = require("node-pty");
const { exec } = require("node:child_process");
const { promisify } = require("node:util");
const os = require("node:os");

const execAsync = promisify(exec);

// ═══════════════════════════════════════════════════════════════════
// ANSI stripping
// ═══════════════════════════════════════════════════════════════════
const ANSI_RE =
  // eslint-disable-next-line no-control-regex
  /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nq-uy=><~]/g;

function stripAnsi(str) {
  return str.replace(ANSI_RE, "");
}

// ═══════════════════════════════════════════════════════════════════
// Tool 1: Persistent PTY session (node-pty)
// ═══════════════════════════════════════════════════════════════════
const PTY_TIMEOUT = 30_000;
const MAX_OUTPUT = 1024 * 512;

let ptyProcess = null;

function getOrCreatePty() {
  if (ptyProcess) return ptyProcess;

  const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

  ptyProcess = pty.spawn(shell, [], {
    name: "xterm-256color",
    cols: 200,
    rows: 50,
    cwd: process.env.HOME || process.cwd(),
    env: {
      ...process.env,
      PAGER: "cat",
      GIT_PAGER: "cat",
      LESS: "-FRX",
      PS1: "$ ",
      PS2: "> ",
      TERM: "xterm-256color",
    },
  });

  ptyProcess.onExit(() => {
    ptyProcess = null;
  });

  return ptyProcess;
}

function runPtyCommand(command) {
  return new Promise((resolve) => {
    const proc = getOrCreatePty();
    const marker = `__DONE_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    let output = "";
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      dispose();
      resolve(cleanPtyOutput(output, command, marker) + "\n(timed out after 30s)");
    }, PTY_TIMEOUT);

    const onData = proc.onData((data) => {
      const markerIdx = data.indexOf(marker);
      if (markerIdx !== -1) {
        output += data.slice(0, markerIdx);
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        dispose();
        resolve(cleanPtyOutput(output, command, marker));
        return;
      }

      output += data;

      if (output.length > MAX_OUTPUT) {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        dispose();
        resolve(
          cleanPtyOutput(output.slice(0, MAX_OUTPUT), command, marker) +
            "\n(output truncated at 512KB)"
        );
      }
    });

    function dispose() {
      onData.dispose();
    }

    proc.write(`${command}\r`);
    proc.write(`echo "${marker}"\r`);
  });
}

function cleanPtyOutput(raw, command, marker) {
  let text = stripAnsi(raw);

  const lines = text.split(/\r?\n/);
  const cleaned = lines.filter((line) => {
    const trimmed = line.trim();
    if (trimmed === `$ ${command}`) return false;
    if (trimmed.includes(`echo "${marker}"`)) return false;
    if (trimmed.includes(marker)) return false;
    if (trimmed === "$" || trimmed === ">") return false;
    return true;
  });

  return cleaned.join("\n").trim() || "Command completed with no output.";
}

// ═══════════════════════════════════════════════════════════════════
// Tool 2: One-shot exec (child_process)
// ═══════════════════════════════════════════════════════════════════
const EXEC_TIMEOUT = 30_000;

async function runExecCommand(command, cwd) {
  if (!command?.trim()) return "No command provided.";

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout: EXEC_TIMEOUT,
      maxBuffer: 1024 * 1024,
    });

    const parts = [];
    if (stdout?.trim()) parts.push(stdout.trim());
    if (stderr?.trim()) parts.push(`[stderr] ${stderr.trim()}`);
    return parts.join("\n") || "Command completed with no output.";
  } catch (error) {
    const parts = [];
    if (error?.stdout?.trim()) parts.push(error.stdout.trim());
    if (error?.stderr?.trim()) parts.push(`[stderr] ${error.stderr.trim()}`);
    if (!parts.length) parts.push(error?.message || "Command failed.");
    return parts.join("\n");
  }
}

// ═══════════════════════════════════════════════════════════════════
// Tool definitions
// ═══════════════════════════════════════════════════════════════════
const runCliCommandTool = {
  type: "function",
  name: "run_cli_command",
  description:
    "Execute a command in a persistent bash session (PTY). " +
    "Shell state persists: cd, export, aliases, background processes all carry across calls. " +
    "Interactive programs (vim, ssh, docker exec -it) work. " +
    "Use this as the DEFAULT tool for most shell tasks. " +
    "30s timeout. Output capped at 512KB.",
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description:
          'The bash command to execute. Examples: "ls -la", "export NODE_ENV=test", ' +
          '"cd /project && npm test", "node server.js &"',
      },
    },
    required: ["command"],
  },
};

const runCliExecTool = {
  type: "function",
  name: "run_cli_exec",
  description:
    "Execute a one-shot command in an isolated shell (no PTY). " +
    "Returns stdout and stderr SEPARATELY (stderr prefixed with [stderr]). " +
    "No state persists between calls. " +
    "Use this INSTEAD of run_cli_command when you need to: " +
    "distinguish errors from output, run a quick isolated command, " +
    "or avoid polluting the persistent session. " +
    "30s timeout.",
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description:
          'The bash command to execute. Examples: "node -e \\"console.log(1)\\"", ' +
          '"python3 script.py", "cat package.json | jq .version"',
      },
      cwd: {
        type: "string",
        description: "Working directory. Defaults to HOME if omitted.",
      },
    },
    required: ["command"],
  },
};

// ═══════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════
const tools = [runCliCommandTool, runCliExecTool];

async function executeTool(name, args = {}) {
  switch (name) {
    case "run_cli_command":
      if (!args.command?.trim()) return "No command provided.";
      try {
        return await runPtyCommand(args.command);
      } catch (error) {
        return error?.message || "Command failed.";
      }

    case "run_cli_exec":
      return runExecCommand(args.command, args.cwd);

    default:
      return `Unknown tool: ${name}`;
  }
}

module.exports = { tools, executeTool };
