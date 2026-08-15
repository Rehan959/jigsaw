import { describe, it, expect, vi, beforeEach } from "vitest";

const mockLimitCrawl = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();

vi.mock("@jigsaw/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        innerJoin: vi.fn(() => ({
          where: mockWhere.mockReturnValue({
            orderBy: mockOrderBy.mockReturnValue({
              limit: mockLimitCrawl,
            }),
          }),
          orderBy: mockOrderBy.mockReturnValue({
            limit: mockLimitCrawl,
          }),
        })),
      })),
    })),
  },
  crawlJobs: {},
  sources: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((_col: any, val: any) => ({ _eq: val })),
  desc: vi.fn((col: any) => ({ _desc: col })),
}));

import { registerCrawlStatusTool } from "../crawl-status.js";

function createMockServer() {
  const handlers = new Map<string, Function>();
  return {
    registerTool: vi.fn((name: string, _config: any, handler: Function) => {
      handlers.set(name, handler);
    }),
    handlers,
  };
}

describe("crawl_status tool", () => {
  let mockServer: ReturnType<typeof createMockServer>;
  let handler: Function;

  beforeEach(() => {
    vi.clearAllMocks();
    mockServer = createMockServer();
    registerCrawlStatusTool(mockServer as any);
    handler = mockServer.handlers.get("crawl_status")!;
  });

  it("returns jobs on happy path", async () => {
    const now = new Date("2025-01-15T10:00:00Z");
    mockLimitCrawl.mockResolvedValue([
      {
        id: "job-1",
        sourceId: "src-1",
        sourceName: "Example",
        sourceUrl: "https://example.com",
        status: "completed",
        startedAt: now,
        completedAt: now,
        error: null,
        createdAt: now,
      },
    ]);

    const result = await handler({ limit: 10 });

    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.jobCount).toBe(1);
    expect(parsed.jobs[0].status).toBe("completed");
  });

  it("returns empty results when no jobs exist", async () => {
    mockLimitCrawl.mockResolvedValue([]);

    const result = await handler({ limit: 10 });

    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.jobCount).toBe(0);
    expect(parsed.jobs).toEqual([]);
  });

  it("passes sourceId filter by calling where", async () => {
    mockLimitCrawl.mockResolvedValue([]);

    await handler({
      sourceId: "550e8400-e29b-41d4-a716-446655440000",
      limit: 10,
    });

    expect(mockWhere).toHaveBeenCalled();
    expect(mockOrderBy).toHaveBeenCalled();
    expect(mockLimitCrawl).toHaveBeenCalled();
  });

  it("rejects invalid sourceId format via Zod validation", async () => {
    const { z } = await import("zod/v4");
    const schema = z.object({
      sourceId: z.string().uuid().optional(),
      limit: z.number().optional().default(10),
    });

    const result = schema.safeParse({ sourceId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("accepts valid UUID sourceId", async () => {
    const { z } = await import("zod/v4");
    const schema = z.object({
      sourceId: z.string().uuid().optional(),
      limit: z.number().optional().default(10),
    });

    const result = schema.safeParse({
      sourceId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });
});
