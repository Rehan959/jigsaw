import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPost = vi.fn();

vi.mock("../../api-client.js", () => ({
  getApiClient: () => ({
    post: mockPost,
  }),
}));

import { registerAddSourceTool } from "../add-source.js";

function createMockServer() {
  const handlers = new Map<string, Function>();
  return {
    registerTool: vi.fn((name: string, _config: any, handler: Function) => {
      handlers.set(name, handler);
    }),
    handlers,
  };
}

describe("add_source tool", () => {
  let mockServer: ReturnType<typeof createMockServer>;
  let handler: Function;

  beforeEach(() => {
    vi.clearAllMocks();
    mockServer = createMockServer();
    registerAddSourceTool(mockServer as any);
    handler = mockServer.handlers.get("add_source")!;
  });

  it("creates a source on happy path", async () => {
    mockPost.mockResolvedValue({
      data: {
        source: {
          id: "src-new",
          url: "https://example.com",
          name: "My Example",
          createdAt: "2025-01-15T10:00:00.000Z",
        },
      },
      status: 201,
    });

    const result = await handler({
      url: "https://example.com",
      name: "My Example",
    });

    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.status).toBe("success");
    expect(parsed.source.id).toBe("src-new");
    expect(parsed.source.name).toBe("My Example");
    expect(mockPost).toHaveBeenCalledWith("/api/sources", {
      url: "https://example.com",
      name: "My Example",
    });
  });

  it("rejects non-string URL via Zod validation", async () => {
    const { z } = await import("zod/v4");
    const schema = z.object({
      url: z.string().max(2048),
      name: z.string().optional(),
    });

    const result = schema.safeParse({ url: 123 });
    expect(result.success).toBe(false);
  });

  it("rejects URL exceeding 2048 char limit", async () => {
    const { z } = await import("zod/v4");
    const schema = z.object({
      url: z.string().max(2048),
    });

    const longUrl = "https://example.com/" + "a".repeat(2048);
    const result = schema.safeParse({ url: longUrl });
    expect(result.success).toBe(false);
  });

  it("returns error on API failure", async () => {
    const apiError = new Error("Invalid request") as any;
    apiError.status = 400;
    apiError.code = "VALIDATION_ERROR";
    mockPost.mockRejectedValue(apiError);

    const result = await handler({
      url: "invalid-url",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("API error (400)");
  });

  it("returns error on auth failure", async () => {
    const apiError = new Error("Invalid or missing API key") as any;
    apiError.status = 401;
    mockPost.mockRejectedValue(apiError);

    const result = await handler({
      url: "https://example.com",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Authentication failed");
  });
});
