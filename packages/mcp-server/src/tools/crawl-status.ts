import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/server";
import { logToolCall, generateRequestId } from "./logger.js";

const inputSchema = z.object({
  sourceId: z
    .string()
    .uuid()
    .optional()
    .describe("Optional. Filter jobs to a specific source by its ID."),
  limit: z
    .number()
    .optional()
    .default(10)
    .describe("Optional. Maximum number of jobs to return. Default: 10."),
}) as any;

type CrawlStatusArgs = { sourceId?: string; limit: number };

export function registerCrawlStatusTool(server: McpServer): void {
  server.registerTool(
    "crawl_status",
    {
      description:
        "Check the status of crawl jobs in JigSaw. Returns recent job statuses with source information. Use this to monitor crawling progress.",
      inputSchema,
    },
    async ({ sourceId, limit }: CrawlStatusArgs) => {
      const requestId = generateRequestId();
      const startTime = Date.now();
      console.error(
        `[jigsaw] crawl_status: sourceId=${sourceId ?? "all"} request_id=${requestId}`,
      );

      try {
        const { db, crawlJobs, sources } = await import("@jigsaw/db");
        const { eq, desc } = await import("drizzle-orm");

        const baseQuery = db
          .select({
            id: crawlJobs.id,
            sourceId: crawlJobs.sourceId,
            sourceName: sources.name,
            sourceUrl: sources.url,
            status: crawlJobs.status,
            startedAt: crawlJobs.startedAt,
            completedAt: crawlJobs.completedAt,
            error: crawlJobs.error,
            createdAt: crawlJobs.createdAt,
          })
          .from(crawlJobs)
          .innerJoin(sources, eq(crawlJobs.sourceId, sources.id));

        const filteredQuery = sourceId
          ? baseQuery.where(eq(crawlJobs.sourceId, sourceId))
          : baseQuery;

        const results = await filteredQuery
          .orderBy(desc(crawlJobs.createdAt))
          .limit(limit || 10);

        const formatted = results.map((r) => ({
          ...r,
          startedAt: r.startedAt?.toISOString() || null,
          completedAt: r.completedAt?.toISOString() || null,
          createdAt: r.createdAt.toISOString(),
        }));

        logToolCall(
          "crawl_status",
          { sourceId, limit },
          startTime,
          formatted.length,
        );

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  jobCount: formatted.length,
                  jobs: formatted,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        logToolCall(
          "crawl_status",
          { sourceId, limit },
          startTime,
          undefined,
          true,
        );
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            {
              type: "text" as const,
              text: `Error checking crawl status: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
