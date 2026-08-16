import { chunkArray } from "@jigsaw/shared";
import type { EmbedOptions } from "./types.js";

const DEFAULT_EMBED_OPTIONS: EmbedOptions = {
  model: "text-embedding-3-small",
  batchSize: 20,
};

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

export async function generateEmbeddings(
  texts: string[],
  options?: Partial<EmbedOptions>,
): Promise<number[][]> {
  const opts = { ...DEFAULT_EMBED_OPTIONS, ...options };
  const openai = await getOpenAI();
  const batches = chunkArray(texts, opts.batchSize);
  const allEmbeddings: number[][] = [];

  for (const batch of batches) {
    const response: any = await withRetry(() =>
      openai.embeddings.create({
        model: opts.model,
        input: batch,
      }),
    );

    for (const item of response.data) {
      allEmbeddings.push(item.embedding);
    }
  }

  return allEmbeddings;
}
