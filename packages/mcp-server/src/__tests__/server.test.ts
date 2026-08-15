import { describe, it, expect, vi } from "vitest";

vi.mock("@jigsaw/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        limit: vi.fn().mockResolvedValue([]),
        innerJoin: vi.fn(() => {
          const chainable: any = {};
          chainable.where = vi.fn(() => chainable);
          chainable.orderBy = vi.fn(() => chainable);
          chainable.limit = vi.fn().mockResolvedValue([]);
          return chainable;
        }),
      })),
    })),
  },
  sources: {},
  crawlJobs: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  desc: vi.fn(),
}));

vi.mock("openai", () => ({ default: class {} }));
vi.mock("@pinecone-database/pinecone", () => ({
  Pinecone: class {},
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
