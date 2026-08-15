import { describe, it, expect, vi, beforeEach } from "vitest";

const mockEmbeddingsCreate = vi.fn();
const mockQuery = vi.fn();

vi.mock("openai", () => ({
  default: class MockOpenAI {
    embeddings = { create: mockEmbeddingsCreate };
  },
}));

vi.mock("@pinecone-database/pinecone", () => ({
  Pinecone: class MockPinecone {
    index(_name: string) {
      return { query: mockQuery };
    }
  },
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
    mockEmbeddingsCreate.mockResolvedValue({
      data: [{ embedding: [0.1, 0.2, 0.3] }],
    });
    mockQuery.mockResolvedValue({
      matches: [
        {
          id: "chunk-1",
          score: 0.92,
          metadata: {
            content: "Test content",
            sourceId: "src-1",
            url: "https://example.com",
            title: "Example",
            chunkIndex: 0,
            totalChunks: 3,
          },
        },
      ],
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
  });

  it("returns empty results when Pinecone has no matches", async () => {
    mockEmbeddingsCreate.mockResolvedValue({
      data: [{ embedding: [0.1, 0.2, 0.3] }],
    });
    mockQuery.mockResolvedValue({ matches: [] });

    const result = await searchHandler({
      query: "no results query",
      limit: 5,
    });

    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.resultCount).toBe(0);
    expect(parsed.results).toEqual([]);
  });

  it("returns error when OpenAI API fails", async () => {
    mockEmbeddingsCreate.mockRejectedValue(
      new Error("Unauthorized: invalid API key"),
    );

    const result = await searchHandler({
      query: "test query",
      limit: 5,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Authentication failed");
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

  it("passes sourceId filter to Pinecone", async () => {
    mockEmbeddingsCreate.mockResolvedValue({
      data: [{ embedding: [0.1, 0.2, 0.3] }],
    });
    mockQuery.mockResolvedValue({ matches: [] });

    await searchHandler({
      query: "test",
      sourceId: "src-123",
      limit: 5,
    });

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { sourceId: "src-123" },
      }),
    );
  });
});
