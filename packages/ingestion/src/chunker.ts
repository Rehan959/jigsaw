import { generateId } from "@jigsaw/shared";
import type { Chunk, ScrapedContent } from "@jigsaw/shared";
import type { ChunkOptions } from "./types.js";

const DEFAULT_CHUNK_OPTIONS: ChunkOptions = {
  maxChars: 1000,
  overlap: 200,
};

const HEADER_REGEX = /^#{1,6}\s+.+/m;

function findBreakPoint(text: string, maxChars: number): number {
  const headerMatch = text.slice(0, maxChars).match(HEADER_REGEX);
  if (headerMatch && headerMatch.index !== undefined && headerMatch.index > 0) {
    return headerMatch.index;
  }

  const paragraphBreak = text.lastIndexOf("\n\n", maxChars);
  if (paragraphBreak > maxChars * 0.3) {
    return paragraphBreak + 2;
  }

  const newlineBreak = text.lastIndexOf("\n", maxChars);
  if (newlineBreak > maxChars * 0.3) {
    return newlineBreak + 1;
  }

  const spaceBreak = text.lastIndexOf(" ", maxChars);
  if (spaceBreak > maxChars * 0.3) {
    return spaceBreak + 1;
  }

  return maxChars;
}

export function chunkText(
  text: string,
  options?: Partial<ChunkOptions>,
): string[] {
  const opts = { ...DEFAULT_CHUNK_OPTIONS, ...options };
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= opts.maxChars) {
      chunks.push(remaining);
      break;
    }

    const breakPoint = findBreakPoint(remaining, opts.maxChars);
    chunks.push(remaining.slice(0, breakPoint));
    remaining = remaining.slice(breakPoint - opts.overlap);
  }

  return chunks;
}

export function chunkContent(
  scraped: ScrapedContent,
  sourceId: string,
  options?: Partial<ChunkOptions>,
): Chunk[] {
  const textChunks = chunkText(scraped.content, options);
  return textChunks.map((content, index) => ({
    id: generateId(),
    content,
    metadata: {
      sourceId,
      url: scraped.url,
      title: scraped.title,
      chunkIndex: index,
      totalChunks: textChunks.length,
    },
  }));
}
