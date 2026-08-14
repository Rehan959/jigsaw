import { Pinecone } from "@pinecone-database/pinecone";
import type { Chunk, SearchResult, SearchQuery } from "@jigsaw/shared";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const INDEX_NAME = process.env.PINECONE_INDEX || "jigsaw";

function getIndex() {
  return pinecone.index(INDEX_NAME);
}

export async function upsertChunks(chunks: Chunk[]): Promise<void> {
  const index = getIndex();
  const vectors = chunks.map((chunk) => ({
    id: chunk.id,
    values: chunk.metadata as unknown as number[],
    metadata: {
      content: chunk.content,
      sourceId: chunk.metadata.sourceId,
      url: chunk.metadata.url,
      title: chunk.metadata.title,
      chunkIndex: chunk.metadata.chunkIndex,
      totalChunks: chunk.metadata.totalChunks,
    },
  }));

  await index.upsert(vectors);
}

export async function searchKnowledgeBase(
  query: SearchQuery
): Promise<SearchResult[]> {
  const index = getIndex();
  const { generateEmbedding } = await import("./embedder.js");
  const queryEmbedding = await generateEmbedding(query.query);

  const results = await index.query({
    vector: queryEmbedding,
    topK: query.limit || 10,
    includeMetadata: true,
    filter: query.sourceId
      ? { sourceId: { $eq: query.sourceId } }
      : undefined,
  });

  return results.matches
    .filter(
      (match) =>
        !query.threshold || (match.score && match.score >= query.threshold)
    )
    .map((match) => ({
      id: match.id,
      score: match.score || 0,
      content: (match.metadata?.content as string) || "",
      metadata: {
        sourceId: (match.metadata?.sourceId as string) || "",
        url: (match.metadata?.url as string) || "",
        title: (match.metadata?.title as string) || "",
        chunkIndex: (match.metadata?.chunkIndex as number) || 0,
        totalChunks: (match.metadata?.totalChunks as number) || 0,
      },
    }));
}

export async function deleteBySource(sourceId: string): Promise<void> {
  const index = getIndex();
  await index.deleteMany({ filter: { sourceId: { $eq: sourceId } } });
}
