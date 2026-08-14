import type { Chunk, ChunkMetadata } from "@jigsaw/shared";
import { generateId } from "@jigsaw/shared";

export interface ChunkOptions {
  maxChunkSize?: number;
  overlapSize?: number;
  separator?: string;
}

const DEFAULT_OPTIONS: Required<ChunkOptions> = {
  maxChunkSize: 1000,
  overlapSize: 200,
  separator: "\n\n",
};

export function chunkText(
  text: string,
  metadata: Omit<ChunkMetadata, "chunkIndex" | "totalChunks">,
  options: ChunkOptions = {}
): Chunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const paragraphs = text.split(opts.separator);
  const chunks: Chunk[] = [];
  let currentChunk = "";
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    if (
      currentChunk.length + paragraph.length > opts.maxChunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        id: generateId(),
        content: currentChunk.trim(),
        metadata: { ...metadata, chunkIndex, totalChunks: 0 },
      });
      chunkIndex++;

      const words = currentChunk.split(" ");
      const overlapWords = words.slice(-Math.floor(opts.overlapSize / 5));
      currentChunk = overlapWords.join(" ") + opts.separator + paragraph;
    } else {
      currentChunk = currentChunk
        ? currentChunk + opts.separator + paragraph
        : paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      id: generateId(),
      content: currentChunk.trim(),
      metadata: { ...metadata, chunkIndex, totalChunks: 0 },
    });
  }

  const totalChunks = chunks.length;
  return chunks.map((chunk) => ({
    ...chunk,
    metadata: { ...chunk.metadata, totalChunks },
  }));
}
