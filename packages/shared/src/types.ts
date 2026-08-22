export type CrawlStatus = "queued" | "running" | "completed" | "failed";

export interface Source {
  id: string;
  url: string;
  name: string;
  crawlFrequency: string | null;
  lastCrawledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrawlJob {
  id: string;
  sourceId: string;
  status: CrawlStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  error: string | null;
  createdAt: Date;
}

export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  html: string;
  crawledAt: Date;
}

export interface Chunk {
  id: string;
  content: string;
  metadata: ChunkMetadata;
}

export interface ChunkMetadata {
  sourceId: string;
  url: string;
  title: string;
  chunkIndex: number;
  totalChunks: number;
}

export interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: ChunkMetadata;
}

export interface SearchQuery {
  query: string;
  sourceId?: string;
  limit?: number;
  threshold?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
}
