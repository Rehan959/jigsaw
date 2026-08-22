import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();

vi.mock("../../api-client.js", () => ({
  getApiClient: () => ({
    get: mockGet,
  }),
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
    mockGet.mockResolvedValue({
      data: {
        sources: [
          {
            id: "src-1",
            url: "https://example.com",
            name: "Example",
            crawlFrequency: "daily",
            lastCrawledAt: "2025-01-15T10:00:00.000Z",
            createdAt: "2025-01-15T10:00:00.000Z",
          },
        ],
      },
      status: 200,
    });

    const result = await handler({ limit: 20 });

    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.sourceCount).toBe(1);
    expect(parsed.sources[0].id).toBe("src-1");
    expect(parsed.sources[0].createdAt).toBe("2025-01-15T10:00:00.000Z");
    expect(mockGet).toHaveBeenCalledWith("/api/sources");
  });

  it("returns empty array when API has no sources", async () => {
    mockGet.mockResolvedValue({
      data: { sources: [] },
      status: 200,
    });

    const result = await handler({ limit: 20 });

    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.sourceCount).toBe(0);
    expect(parsed.sources).toEqual([]);
  });

  it("respects limit parameter", async () => {
    const sources = Array.from({ length: 30 }, (_, i) => ({
      id: `src-${i}`,
      url: `https://example${i}.com`,
      name: `Example ${i}`,
      crawlFrequency: null,
      lastCrawledAt: null,
      createdAt: "2025-01-15T10:00:00.000Z",
    }));

    mockGet.mockResolvedValue({
      data: { sources },
      status: 200,
    });

    const result = await handler({ limit: 5 });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.sourceCount).toBe(5);
  });

  it("returns error on API failure", async () => {
    const apiError = new Error("Internal server error") as any;
    apiError.status = 500;
    mockGet.mockRejectedValue(apiError);

    const result = await handler({ limit: 20 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("API error (500)");
  });
});
