export interface IngestionConfig {
  chunkSize: number;
  overlapSize: number;
  embeddingModel: string;
}

export const DEFAULT_INGESTION_CONFIG: IngestionConfig = {
  chunkSize: 1000,
  overlapSize: 200,
  embeddingModel: "text-embedding-3-small",
};
