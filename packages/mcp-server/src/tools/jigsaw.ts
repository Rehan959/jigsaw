import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, sources, crawlJobs } from "@jigsaw/db";
import { searchKnowledgeBase } from "@jigsaw/ingestion";
import type { SearchQuery } from "@jigsaw/shared";

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
    "Search the JigSaw knowledge base for relevant content using semantic search",
    SearchSchema.shape,
    async ({ query, sourceId, limit, threshold }) => {
      try {
        const searchQuery: SearchQuery = {
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
    "List all crawled sources in the knowledge base",
    ListSourcesSchema.shape,
    async ({ limit }) => {
      try {
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
    "Add a URL to be crawled and ingested into the knowledge base",
    AddSourceSchema.shape,
    async ({ url, name, userId }) => {
      try {
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
    "Check the status of crawl jobs",
    CrawlStatusSchema.shape,
    async ({ sourceId, limit }) => {
      try {
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
