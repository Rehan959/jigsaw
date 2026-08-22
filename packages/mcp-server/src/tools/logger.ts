function generateRequestId(): string {
  return Math.random().toString(16).slice(2, 10);
}

function sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      sanitized[key] = value.length > 100 ? value.slice(0, 50) + "...[truncated]" : value;
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function logToolCall(
  toolName: string,
  params: Record<string, unknown>,
  startTime: number,
  resultCount?: number,
  error?: boolean,
): void {
  const latency = Date.now() - startTime;
  const paramStr = JSON.stringify(sanitizeParams(params)).slice(0, 200);
  const status = error ? "ERROR" : "OK";
  const countStr =
    resultCount !== undefined ? ` results=${resultCount}` : "";
  console.error(
    `[jigsaw] ${toolName}: params=${paramStr} latency=${latency}ms${countStr} ${status}`,
  );
}

export { generateRequestId };
