import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPost = vi.fn();

vi.mock("../../api-client.js", () => ({
  getApiClient: () => ({
    post: mockPost,
  }),
}));

import { registerSearchTool } from "../search.js";

function createMockServer() {
  const handlers = new Map<string, Function>();
  return {
    registerTool: vi.fn((name: string, _config: any, handler: Function) => {
      handlers.set(name, handler);
    }),
    handlers,
  };
}

describe("search_knowledge_base tool", () => {
  let mockServer: ReturnType<typeof createMockServer>;
  let searchHandler: Function;

  beforeEach(() => {
    vi.clearAllMocks();
    mockServer = createMockServer();
    registerSearchTool(mockServer as any);
    searchHandler = mockServer.handlers.get("search_knowledge_base")!;
  });

  it("returns results on happy path", async () => {
    mockPost.mockResolvedValue({
      data: {
        results: [
          {
            id: "chunk-1",
            score: 0.92,
            content: "Test content",
            metadata: {
              sourceId: "src-1",
              url: "https://example.com",
              title: "Example",
              chunkIndex: 0,
              totalChunks: 3,
            },
          },
        ],
        count: 1,
      },
      status: 200,
    });

    const result = await searchHandler({
      query: "test query",
      limit: 5,
    });

    expect(result.isError).toBeFalsy();
    expect(result.content[0].type).toBe("text");
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.query).toBe("test query");
    expect(parsed.resultCount).toBe(1);
    expect(parsed.results[0].id).toBe("chunk-1");
    expect(parsed.results[0].score).toBe(0.92);
    expect(mockPost).toHaveBeenCalledWith("/api/search", {
      query: "test query",
      sourceId: undefined,
      limit: 5,
      threshold: undefined,
    });
  });

  it("returns empty results when API has no matches", async () => {
    mockPost.mockResolvedValue({
      data: { results: [], count: 0 },
      status: 200,
    });

    const result = await searchHandler({
      query: "no results query",
      limit: 5,
    });

    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.resultCount).toBe(0);
    expect(parsed.results).toEqual([]);
  });

  it("returns error when API fails with auth error", async () => {
    const apiError = new Error("Unauthorized") as any;
    apiError.status = 401;
    mockPost.mockRejectedValue(apiError);

    const result = await searchHandler({
      query: "test query",
      limit: 5,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Authentication failed");
  });

  it("returns error when API fails with 500", async () => {
    const apiError = new Error("Internal server error") as any;
    apiError.status = 500;
    mockPost.mockRejectedValue(apiError);

    const result = await searchHandler({
      query: "test query",
      limit: 5,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("API error (500)");
  });

  it("rejects non-string query via Zod validation", async () => {
    const { z } = await import("zod/v4");
    const schema = z.object({
      query: z.string().max(10000),
      sourceId: z.string().optional(),
      limit: z.number().optional().default(5),
      threshold: z.number().optional(),
    });

    const result = schema.safeParse({ query: 123 });
    expect(result.success).toBe(false);
  });

  it("rejects query exceeding 10000 char limit", async () => {
    const { z } = await import("zod/v4");
    const schema = z.object({
      query: z.string().max(10000),
    });

    const longQuery = "a".repeat(10001);
    const result = schema.safeParse({ query: longQuery });
    expect(result.success).toBe(false);
  });

  it("passes sourceId filter to API", async () => {
    mockPost.mockResolvedValue({
      data: { results: [], count: 0 },
      status: 200,
    });

    await searchHandler({
      query: "test",
      sourceId: "src-123",
      limit: 5,
    });

    expect(mockPost).toHaveBeenCalledWith(
      "/api/search",
      expect.objectContaining({
        sourceId: "src-123",
      }),
    );
  });

  it("retries on transient failures", async () => {
    const transientError = new Error("ECONNRESET") as any;
    transientError.status = 503;

    mockPost
      .mockRejectedValueOnce(transientError)
      .mockResolvedValueOnce({
        data: { results: [], count: 0 },
        status: 200,
      });

    const result = await searchHandler({
      query: "test query",
      limit: 5,
    });

    expect(result.isError).toBeFalsy();
    expect(mockPost).toHaveBeenCalledTimes(2);
  });
});
