import type { Chunk, SearchResult, SearchQuery } from "@jigsaw/shared";

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
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
        lastError.message.includes("429") ||
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let openaiClient: any = null;

async function getOpenAI(): Promise<any> {
  if (openaiClient) return openaiClient;
  // @ts-expect-error openai is a peer dependency
  const { default: OpenAI } = await import("openai");
  openaiClient = new OpenAI();
  return openaiClient;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pineconeClient: any = null;

async function getPinecone(): Promise<any> {
  if (pineconeClient) return pineconeClient;
  // @ts-expect-error @pinecone-database/pinecone is a peer dependency
  const { Pinecone } = await import("@pinecone-database/pinecone");
  pineconeClient = new Pinecone();
  return pineconeClient;
}

function getIndexName(): string {
  return process.env.PINECONE_INDEX || "jigsaw";
}

export async function searchKnowledgeBase(
  query: SearchQuery,
): Promise<SearchResult[]> {
  const openai = await getOpenAI();
  const pinecone = await getPinecone();
  const index = pinecone.index(getIndexName());

  const embeddingResponse: any = await withRetry(() =>
    openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query.query,
    }),
  );

  if (!embeddingResponse.data || embeddingResponse.data.length === 0) {
    throw new Error(
      "OpenAI returned no embeddings. Check OPENAI_API_KEY and input content.",
    );
  }

  const queryVector = embeddingResponse.data[0].embedding;

  const searchOptions: Record<string, unknown> = {
    topK: query.limit || 10,
    includeMetadata: true,
  };
  if (query.sourceId) {
    searchOptions.filter = { sourceId: query.sourceId };
  }
  if (query.threshold) {
    searchOptions.minScore = query.threshold;
  }

  const results: any = await withRetry(() =>
    index.query({
      vector: queryVector,
      ...searchOptions,
    }),
  );

  return results.matches.map(
    (match: { id: string; score: number; metadata?: Record<string, unknown> }) => ({
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
}

export async function upsertChunks(
  chunks: Chunk[],
  embeddings: number[][],
): Promise<void> {
  const pinecone = await getPinecone();
  const index = pinecone.index(getIndexName());

  const records = chunks.map((chunk, i) => ({
    id: chunk.id,
    values: embeddings[i],
    metadata: {
      content: chunk.content,
      sourceId: chunk.metadata.sourceId,
      url: chunk.metadata.url,
      title: chunk.metadata.title,
      chunkIndex: chunk.metadata.chunkIndex,
      totalChunks: chunk.metadata.totalChunks,
    },
  }));

  const namespace = chunks[0]?.metadata.sourceId || "default";
  await index.namespace(namespace).upsert(records);
}

export async function deleteSourceChunks(sourceId: string): Promise<void> {
  const pinecone = await getPinecone();
  const index = pinecone.index(getIndexName());
  await index.namespace(sourceId).deleteAll();
}
