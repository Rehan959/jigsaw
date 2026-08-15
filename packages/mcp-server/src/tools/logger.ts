function generateRequestId(): string {
  return Math.random().toString(16).slice(2, 10);
}

export function logToolCall(
  toolName: string,
  params: Record<string, unknown>,
  startTime: number,
  resultCount?: number,
  error?: boolean,
): void {
  const latency = Date.now() - startTime;
  const paramStr = JSON.stringify(params).slice(0, 200);
  const status = error ? "ERROR" : "OK";
  const countStr =
    resultCount !== undefined ? ` results=${resultCount}` : "";
  console.error(
    `[jigsaw] ${toolName}: params=${paramStr} latency=${latency}ms${countStr} ${status}`,
  );
}

export { generateRequestId };
