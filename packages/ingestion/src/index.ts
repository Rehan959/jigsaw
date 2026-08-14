export { chunkText } from "./chunker.js";
export { generateEmbedding, generateEmbeddings, EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from "./embedder.js";
export { upsertChunks, searchKnowledgeBase, deleteBySource } from "./pipeline.js";
export type { IngestionConfig } from "./types.js";
export { DEFAULT_INGESTION_CONFIG } from "./types.js";
