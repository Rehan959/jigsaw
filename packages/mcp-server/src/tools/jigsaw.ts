import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const SearchSchema = z.object({
  query: z.string().describe("The search query to find relevant content"),
  sourceId: z
    .string()
    .optional()
    .describe("Filter results to a specific source"),
  limit: z
    .number()
    .default(5)
    .describe("Maximum number of results to return"),
  threshold: z.number().optional().describe("Minimum similarity score"),
});

const ListSourcesSchema = z.object({
  limit: z.number().default(10).describe("Maximum number of sources to return"),
});

const AddSourceSchema = z.object({
  url: z.string().url().describe("The URL to crawl and add to knowledge base"),
  name: z.string().optional().describe("Optional display name for the source"),
  userId: z.string().describe("User ID who owns this source"),
});

const CrawlStatusSchema = z.object({
  sourceId: z.string().optional().describe("Filter jobs by source ID"),
  limit: z
    .number()
    .default(10)
    .describe("Maximum number of jobs to return"),
});

export function registerJigsawTools(server: McpServer): void {
  server.tool(
    "jigsaw_search",
    "Search the JigSaw knowledge base using AI-powered semantic search. Returns relevant content chunks with source attribution and relevance scores. Use this when users ask questions about crawled content.",
    SearchSchema.shape,
    async ({ query, sourceId, limit, threshold }) => {
      try {
        const { searchKnowledgeBase } = await import("@jigsaw/ingestion");
        const searchQuery: import("@jigsaw/shared").SearchQuery = {
          query,
          sourceId,
          limit,
          threshold,
        };
        const results = await searchKnowledgeBase(searchQuery);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message || String(error)
            : "Unknown error";
        return {
          content: [
            {
              type: "text" as const,
              text: `Error searching knowledge base: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "jigsaw_list_sources",
    "List all websites and URLs that have been crawled and added to the knowledge base. Shows source name, URL, crawl frequency, and last crawled timestamp.",
    ListSourcesSchema.shape,
    async ({ limit }) => {
      try {
        const { db, sources } = await import("@jigsaw/db");
        const rows = await db.select().from(sources).limit(limit);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(rows, null, 2),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message || String(error)
            : "Unknown error";
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
    }
  );

  server.tool(
    "jigsaw_add_source",
    "Add a new website URL to be crawled and ingested into the knowledge base. Creates a source record and queues a crawl job. Requires a valid URL and user ID.",
    AddSourceSchema.shape,
    async ({ url, name, userId }) => {
      try {
        const { db, sources } = await import("@jigsaw/db");
        const [inserted] = await db
          .insert(sources)
          .values({
            url,
            name: name || url,
            userId,
          })
          .returning();
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(inserted, null, 2),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message || String(error)
            : "Unknown error";
        return {
          content: [
            {
              type: "text" as const,
              text: `Error adding source: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "jigsaw_crawl_status",
    "Check the status of crawl jobs (queued, running, completed, or failed). Filter by source ID to see jobs for a specific website.",
    CrawlStatusSchema.shape,
    async ({ sourceId, limit }) => {
      try {
        const { db, crawlJobs } = await import("@jigsaw/db");
        const { eq } = await import("drizzle-orm");
        const rows = sourceId
          ? await db
              .select()
              .from(crawlJobs)
              .where(eq(crawlJobs.sourceId, sourceId))
              .limit(limit)
          : await db.select().from(crawlJobs).limit(limit);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(rows, null, 2),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message || String(error)
            : "Unknown error";
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
    }
  );
}
