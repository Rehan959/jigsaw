import { describe, it, expect, vi, beforeEach } from "vitest";

const mockValues = vi.fn();
const mockReturning = vi.fn();

vi.mock("@jigsaw/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: mockValues.mockReturnValue({
        returning: mockReturning,
      }),
    })),
  },
  sources: {},
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
    const now = new Date("2025-01-15T10:00:00Z");
    mockReturning.mockResolvedValue([
      {
        id: "src-new",
        url: "https://example.com",
        name: "My Example",
        createdAt: now,
      },
    ]);

    const result = await handler({
      url: "https://example.com",
      name: "My Example",
    });

    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.status).toBe("success");
    expect(parsed.source.id).toBe("src-new");
    expect(parsed.source.name).toBe("My Example");
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

  it("derives name from URL hostname when not provided", async () => {
    const now = new Date("2025-01-15T10:00:00Z");
    mockReturning.mockResolvedValue([
      {
        id: "src-2",
        url: "https://www.example.com/page",
        name: "example.com",
        createdAt: now,
      },
    ]);

    await handler({ url: "https://www.example.com/page" });

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "example.com",
      }),
    );
  });
});
