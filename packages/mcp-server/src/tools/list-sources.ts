import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/server";
import { logToolCall, generateRequestId } from "./logger.js";
import { getApiClient, type ApiError } from "../api-client.js";

const inputSchema = z.object({
  limit: z
    .number()
    .optional()
    .default(20)
    .describe("Optional. Maximum number of sources to return. Default: 20."),
}) as any;

type ListSourcesArgs = { limit: number };

function formatApiError(error: unknown): string {
  if (error && typeof error === "object" && "status" in error) {
    const apiErr = error as ApiError;
    if (apiErr.status === 401) return "Authentication failed. API key is not configured on the server.";
    if (apiErr.status === 403) return "Access denied. Invalid API key.";
    if (apiErr.status === 429) return "Rate limited. Try again later.";
    return `API error (${apiErr.status}): ${apiErr.message}`;
  }
  return error instanceof Error ? error.message : "Unknown error";
}

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
        const client = getApiClient();
        const { data } = await client.get<{ sources: Array<{
          id: string;
          url: string;
          name: string;
          crawlFrequency: string | null;
          lastCrawledAt: string | null;
          createdAt: string;
        }> }>("/api/sources");

        const sources = data.sources.slice(0, limit);

        logToolCall("list_sources", { limit }, startTime, sources.length);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  sourceCount: sources.length,
                  sources,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        logToolCall("list_sources", { limit }, startTime, undefined, true);
        return {
          content: [
            {
              type: "text" as const,
              text: `Error listing sources: ${formatApiError(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
