import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/server";
import { logToolCall, generateRequestId } from "./logger.js";

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
  const msg = error instanceof Error ? error.message : String(error);
  if (
    msg.includes("Unauthorized") ||
    msg.includes("401") ||
    msg.includes("invalid_api_key")
  ) {
    return `Authentication failed. Check OPENAI_API_KEY env var. Original: ${msg}`;
  }
  if (msg.includes("invalid_api_key") || msg.includes("Incorrect API key")) {
    return `Invalid OpenAI API key. Check OPENAI_API_KEY env var. Original: ${msg}`;
  }
  if (msg.includes("Pinecone") && msg.includes("403")) {
    return `Pinecone access denied. Check PINECONE_API_KEY env var. Original: ${msg}`;
  }
  if (msg.includes("404") && msg.includes("Index")) {
    return `Pinecone index not found. Check PINECONE_INDEX env var. Original: ${msg}`;
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
        // @ts-expect-error openai is a peer dependency
        const { default: OpenAI } = await import("openai");
        // @ts-expect-error @pinecone-database/pinecone is a peer dependency
        const { Pinecone } = await import("@pinecone-database/pinecone");
        const openai = new OpenAI();
        const pinecone = new Pinecone();
        const indexName = process.env.PINECONE_INDEX || "jigsaw";
        const index = pinecone.index(indexName);

        const embeddingResponse: any = await withRetry(() =>
          openai.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
          }),
        );

        if (!embeddingResponse.data || embeddingResponse.data.length === 0) {
          throw new Error(
            "OpenAI returned no embeddings. Check OPENAI_API_KEY and input content.",
          );
        }

        const queryVector = embeddingResponse.data[0].embedding;

        const searchOptions: Record<string, unknown> = {
          topK: limit || 5,
          includeMetadata: true,
        };
        if (sourceId) {
          searchOptions.filter = { sourceId };
        }
        if (threshold) {
          searchOptions.minScore = threshold;
        }

        const results: any = await withRetry(() =>
          index.query({
            vector: queryVector,
            ...searchOptions,
          }),
        );

        const formatted = results.matches.map(
          (match: any) => ({
            id: match.id,
            score: match.score,
            content: (match.metadata?.content as string) || "",
            metadata: {
              sourceId: (match.metadata?.sourceId as string) || "",
              url: (match.metadata?.url as string) || "",
              title: (match.metadata?.title as string) || "",
              chunkIndex: (match.metadata?.chunkIndex as number) || 0,
              totalChunks: (match.metadata?.totalChunks as number) || 0,
            },
          }),
        );

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
