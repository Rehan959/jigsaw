import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/server";
import { logToolCall, generateRequestId } from "./logger.js";

const inputSchema = z.object({
  limit: z
    .number()
    .optional()
    .default(20)
    .describe("Optional. Maximum number of sources to return. Default: 20."),
}) as any;

type ListSourcesArgs = { limit: number };

export function registerListSourcesTool(server: McpServer): void {
  server.registerTool(
    "list_sources",
    {
      description:
        "List all tracked data sources in JigSaw. Returns URLs, names, and crawl status for each source. Use this to see what websites are being monitored.",
      inputSchema,
    },
    async ({ limit }: ListSourcesArgs) => {
      const requestId = generateRequestId();
      const startTime = Date.now();
      console.error(
        `[jigsaw] list_sources: limit=${limit} request_id=${requestId}`,
      );

      try {
        const { db, sources } = await import("@jigsaw/db");
        const results = await db
          .select({
            id: sources.id,
            url: sources.url,
            name: sources.name,
            crawlFrequency: sources.crawlFrequency,
            lastCrawledAt: sources.lastCrawledAt,
            createdAt: sources.createdAt,
          })
          .from(sources)
          .limit(limit || 20);

        const formatted = results.map((r) => ({
          ...r,
          lastCrawledAt: r.lastCrawledAt?.toISOString() || null,
          createdAt: r.createdAt.toISOString(),
        }));

        logToolCall("list_sources", { limit }, startTime, formatted.length);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  sourceCount: formatted.length,
                  sources: formatted,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        logToolCall("list_sources", { limit }, startTime, undefined, true);
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            {
              type: "text" as const,
              text: `Error listing sources: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
