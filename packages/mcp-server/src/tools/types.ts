export interface SearchResult {
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
}

export interface ToolResponse {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}
