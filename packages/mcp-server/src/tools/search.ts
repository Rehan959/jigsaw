import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/server";
import { logToolCall, generateRequestId } from "./logger.js";
import { getApiClient, type ApiError } from "../api-client.js";

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 2,
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const isTransient =
        lastError.message.includes("ECONNRESET") ||
        lastError.message.includes("ETIMEDOUT") ||
        lastError.message.includes("529") ||
        lastError.message.includes("503") ||
        lastError.message.includes("rate_limit");
      if (!isTransient || i === attempts - 1) {
        throw lastError;
      }
      await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
    }
  }
  throw lastError!;
}

function actionableMessage(error: unknown): string {
  if (error && typeof error === "object" && "status" in error) {
    const apiErr = error as ApiError;
    if (apiErr.status === 401) return "Authentication failed. API key is not configured on the server.";
    if (apiErr.status === 403) return "Access denied. Invalid API key.";
    if (apiErr.status === 429) return "Rate limited. Try again later.";
    return `API error (${apiErr.status}): ${apiErr.message}`;
  }
  const msg = error instanceof Error ? error.message : String(error);
  if (
    msg.includes("Unauthorized") ||
    msg.includes("401") ||
    msg.includes("invalid_api_key")
  ) {
    return `Authentication failed. OpenAI API key is not configured on the server.`;
  }
  if (msg.includes("Pinecone") && msg.includes("403")) {
    return `Pinecone access denied. API key is not configured on the server.`;
  }
  if (msg.includes("404") && msg.includes("Index")) {
    return `Pinecone index not found. Index is not configured on the server.`;
  }
  return msg;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inputSchema = z.object({
  query: z
    .string()
    .max(10000)
    .describe(
      "The search query. Natural language questions work best for semantic search.",
    ),
  sourceId: z
    .string()
    .optional()
    .describe(
      "Optional. Filter results to a specific data source by its ID.",
    ),
  limit: z
    .number()
    .optional()
    .default(5)
    .describe(
      "Optional. Maximum number of results to return. Default: 5.",
    ),
  threshold: z
    .number()
    .optional()
    .describe(
      "Optional. Minimum similarity score (0-1). Higher values return more relevant results. Default: 0.7.",
    ),
}) as any;

type SearchArgs = {
  query: string;
  sourceId?: string;
  limit: number;
  threshold?: number;
};

type SearchResult = {
  id: string;
  score: number;
  content: string;
  metadata: {
    sourceId: string;
    url: string;
    title: string;
    chunkIndex: number;
    totalChunks: number;
  };
};

type SearchResponse = {
  results: SearchResult[];
  count: number;
};

export function registerSearchTool(server: McpServer): void {
  server.registerTool(
    "search_knowledge_base",
    {
      description:
        "Search the JigSaw knowledge base using semantic similarity. Returns relevant content chunks from crawled websites. Use this when the user asks about information that was scraped and indexed from web sources.",
      inputSchema,
    },
    async ({ query, sourceId, limit, threshold }: SearchArgs) => {
      const requestId = generateRequestId();
      const startTime = Date.now();
      console.error(
        `[jigsaw] search: query="${query}" request_id=${requestId}`,
      );

      try {
        const client = getApiClient();
        const { data } = await withRetry(() =>
          client.post<SearchResponse>("/api/search", {
            query,
            sourceId,
            limit,
            threshold,
          }),
        );

        const formatted = data.results.map((match) => ({
          id: match.id,
          score: match.score,
          content: match.content,
          metadata: match.metadata,
        }));

        logToolCall("search", { query }, startTime, formatted.length);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  query,
                  resultCount: formatted.length,
                  results: formatted,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        logToolCall("search", { query }, startTime, undefined, true);
        const message = actionableMessage(error);
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
    },
  );
}
