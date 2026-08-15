import { describe, it, expect, vi, beforeEach } from "vitest";

const mockLimit = vi.fn();

vi.mock("@jigsaw/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        limit: mockLimit,
      })),
    })),
  },
  sources: {},
}));

import { registerListSourcesTool } from "../list-sources.js";

function createMockServer() {
  const handlers = new Map<string, Function>();
  return {
    registerTool: vi.fn((name: string, _config: any, handler: Function) => {
      handlers.set(name, handler);
    }),
    handlers,
  };
}

describe("list_sources tool", () => {
  let mockServer: ReturnType<typeof createMockServer>;
  let handler: Function;

  beforeEach(() => {
    vi.clearAllMocks();
    mockServer = createMockServer();
    registerListSourcesTool(mockServer as any);
    handler = mockServer.handlers.get("list_sources")!;
  });

  it("returns sources on happy path", async () => {
    const now = new Date("2025-01-15T10:00:00Z");
    mockLimit.mockResolvedValue([
      {
        id: "src-1",
        url: "https://example.com",
        name: "Example",
        crawlFrequency: "daily",
        lastCrawledAt: now,
        createdAt: now,
      },
    ]);

    const result = await handler({ limit: 20 });

    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.sourceCount).toBe(1);
    expect(parsed.sources[0].id).toBe("src-1");
    expect(parsed.sources[0].createdAt).toBe("2025-01-15T10:00:00.000Z");
  });

  it("returns empty array when database has no sources", async () => {
    mockLimit.mockResolvedValue([]);

    const result = await handler({ limit: 20 });

    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.sourceCount).toBe(0);
    expect(parsed.sources).toEqual([]);
  });

  it("passes custom limit parameter", async () => {
    mockLimit.mockResolvedValue([]);

    await handler({ limit: 5 });

    expect(mockLimit).toHaveBeenCalledWith(5);
  });
});
