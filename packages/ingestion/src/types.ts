export interface ChunkOptions {
  maxChars: number;
  overlap: number;
}

export interface EmbedOptions {
  model: string;
  batchSize: number;
}

export interface PipelineOptions {
  chunk: ChunkOptions;
  embed: EmbedOptions;
}

export interface PipelineResult {
  chunksCreated: number;
  embeddingsGenerated: number;
  sourceId: string;
}
