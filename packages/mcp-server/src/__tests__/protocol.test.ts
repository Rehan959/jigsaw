import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn, type ChildProcess } from "child_process";
import path from "path";

const SERVER_PATH = path.resolve(__dirname, "../../dist/index.js");

function sendRaw(proc: ChildProcess, data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    proc.stdin!.write(data, (err) => (err ? reject(err) : resolve()));
  });
}

function readLine(proc: ChildProcess, timeout = 10000): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Timeout reading response")),
      timeout,
    );

    let buffer = "";
    const onData = (chunk: Buffer) => {
      buffer += chunk.toString();
      const newlineIdx = buffer.indexOf("\n");
      if (newlineIdx !== -1) {
        clearTimeout(timer);
        proc.stdout!.removeListener("data", onData);
        resolve(buffer.substring(0, newlineIdx).trim());
      }
    };

    proc.stdout!.on("data", onData);
  });
}

describe("MCP protocol handshake", () => {
  let proc: ChildProcess;

  beforeAll(async () => {
    proc = spawn("node", [SERVER_PATH], {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        DATABASE_URL: "postgres://test:test@localhost:5432/jigsaw_test",
      },
    });
    proc.stderr!.on("data", () => {});
  });

  afterAll(() => {
    proc?.kill();
  });

  it("responds to initialize with correct protocol fields", async () => {
    const initRequest = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" },
      },
    });

    await sendRaw(proc, initRequest + "\n");
    const raw = await readLine(proc);
    const response = JSON.parse(raw);

    expect(response.jsonrpc).toBe("2.0");
    expect(response.id).toBe(1);
    expect(response.result).toBeDefined();
    expect(response.result.protocolVersion).toBeDefined();
    expect(response.result.capabilities).toBeDefined();
    expect(response.result.serverInfo).toBeDefined();
    expect(response.result.serverInfo.name).toBe("jigsaw");
    expect(response.result.serverInfo.version).toBe("0.1.0");
  });

  it("lists all 4 tools via tools/list", async () => {
    const listRequest = JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    });

    await sendRaw(proc, listRequest + "\n");
    const raw = await readLine(proc);
    const response = JSON.parse(raw);

    expect(response.jsonrpc).toBe("2.0");
    expect(response.id).toBe(2);
    expect(response.result).toBeDefined();
    expect(response.result.tools).toBeDefined();
    expect(response.result.tools.length).toBe(4);

    const toolNames = response.result.tools.map((t: any) => t.name);
    expect(toolNames).toContain("search_knowledge_base");
    expect(toolNames).toContain("list_sources");
    expect(toolNames).toContain("add_source");
    expect(toolNames).toContain("crawl_status");

    for (const tool of response.result.tools) {
      expect(tool.name).toBeDefined();
      expect(tool.description).toBeDefined();
      expect(tool.inputSchema).toBeDefined();
    }
  });
});
