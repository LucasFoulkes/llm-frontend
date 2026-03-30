const mathTool = {
  name: "evaluate_expression",
  description: "Evaluates a math expression and returns the numeric result.",
  parameters: {
    type: "object",
    properties: {
      expression: {
        type: "string",
        description: "Math expression, e.g. 12 + (7 * 3) - 4/2",
      },
    },
    required: ["expression"],
  },
};

function evaluateExpression(expression) {
  const expr = String(expression ?? "");
  const safe = expr.replace(/[×x]/g, "*").replace(/\^/g, "**");
  if (!/^[0-9+\-*/().\s%*]+$/.test(safe)) {
    throw new Error("Invalid expression");
  }

  const result = Function(`"use strict"; return (${safe})`)();
  if (!Number.isFinite(result)) {
    throw new Error("Not a finite number");
  }

  return result;
}

module.exports = { mathTool, evaluateExpression };
