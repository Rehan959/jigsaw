import { describe, it, expect, vi } from "vitest";

vi.mock("../../api-client.js", () => ({
  getApiClient: () => ({
    get: vi.fn(),
    post: vi.fn(),
  }),
}));

import { createJigsawServer } from "../server.js";
import { McpServer } from "@modelcontextprotocol/server";

describe("createJigsawServer", () => {
  it("returns an McpServer instance", () => {
    const server = createJigsawServer();
    expect(server).toBeDefined();
    expect(server).toBeInstanceOf(McpServer);
  });

  it("registers all 4 tools", () => {
    const spy = vi.spyOn(McpServer.prototype, "registerTool");
    try {
      const server = createJigsawServer();
      const toolNames = spy.mock.calls.map((call) => call[0]);
      expect(toolNames).toContain("search_knowledge_base");
      expect(toolNames).toContain("list_sources");
      expect(toolNames).toContain("add_source");
      expect(toolNames).toContain("crawl_status");
      expect(toolNames.length).toBe(4);
    } finally {
      spy.mockRestore();
    }
  });
});
