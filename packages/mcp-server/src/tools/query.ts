import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchKnowledgeBase } from "@jigsaw/ingestion";
import { SearchToolSchema, ListSourcesToolSchema } from "./search.js";

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "jigsaw",
    version: "1.0.0",
  });

  server.tool(
    "search_knowledge_base",
    "Search the JigSaw knowledge base for relevant content. Returns semantic search results with source attribution.",
    SearchToolSchema.shape,
    async ({ query, sourceId, limit, threshold }) => {
      try {
        const results = await searchKnowledgeBase({
          query,
          sourceId,
          limit,
          threshold,
        });

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
          error instanceof Error ? error.message : "Unknown error";
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
    "list_sources",
    "List all available data sources in the knowledge base.",
    ListSourcesToolSchema.shape,
    async ({ limit }) => {
      try {
        return {
          content: [
            {
              type: "text" as const,
              text: `List sources tool called with limit: ${limit}. Implementation pending DB integration.`,
            },
          ],
        };
      } catch (error) {
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
    }
  );

  return server;
}
