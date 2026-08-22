import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();

vi.mock("../../api-client.js", () => ({
  getApiClient: () => ({
    get: mockGet,
  }),
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
    mockGet.mockResolvedValue({
      data: {
        jobs: [
          {
            id: "job-1",
            sourceId: "src-1",
            status: "completed",
            startedAt: "2025-01-15T10:00:00.000Z",
            completedAt: "2025-01-15T10:05:00.000Z",
            error: null,
            createdAt: "2025-01-15T10:00:00.000Z",
          },
        ],
      },
      status: 200,
    });

    const result = await handler({ limit: 10 });

    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.jobCount).toBe(1);
    expect(parsed.jobs[0].status).toBe("completed");
    expect(mockGet).toHaveBeenCalledWith("/api/jobs", {});
  });

  it("returns empty results when no jobs exist", async () => {
    mockGet.mockResolvedValue({
      data: { jobs: [] },
      status: 200,
    });

    const result = await handler({ limit: 10 });

    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.jobCount).toBe(0);
    expect(parsed.jobs).toEqual([]);
  });

  it("passes sourceId filter to API", async () => {
    mockGet.mockResolvedValue({
      data: {
        jobs: [
          {
            id: "job-1",
            sourceId: "550e8400-e29b-41d4-a716-446655440000",
            status: "completed",
            startedAt: null,
            completedAt: null,
            error: null,
            createdAt: "2025-01-15T10:00:00.000Z",
          },
        ],
      },
      status: 200,
    });

    const result = await handler({
      sourceId: "550e8400-e29b-41d4-a716-446655440000",
      limit: 10,
    });

    expect(mockGet).toHaveBeenCalledWith("/api/jobs", {
      sourceId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.isError).toBeFalsy();
  });

  it("filters jobs by sourceId client-side", async () => {
    mockGet.mockResolvedValue({
      data: {
        jobs: [
          {
            id: "job-1",
            sourceId: "src-1",
            status: "completed",
            startedAt: null,
            completedAt: null,
            error: null,
            createdAt: "2025-01-15T10:00:00.000Z",
          },
          {
            id: "job-2",
            sourceId: "src-2",
            status: "running",
            startedAt: null,
            completedAt: null,
            error: null,
            createdAt: "2025-01-15T10:00:00.000Z",
          },
        ],
      },
      status: 200,
    });

    const result = await handler({
      sourceId: "src-1",
      limit: 10,
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.jobCount).toBe(1);
    expect(parsed.jobs[0].sourceId).toBe("src-1");
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

  it("returns error on API failure", async () => {
    const apiError = new Error("Internal server error") as any;
    apiError.status = 500;
    mockGet.mockRejectedValue(apiError);

    const result = await handler({ limit: 10 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("API error (500)");
  });
});
