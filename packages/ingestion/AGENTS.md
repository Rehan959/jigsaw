# @jigsaw/ingestion

Content processing pipeline: chunking, embedding generation, and Pinecone storage.

## Purpose

Takes scraped content, splits it into chunks, generates vector embeddings via OpenAI, and stores them in Pinecone for semantic search.

## Architecture

- `chunker.ts` — Splits text into overlapping chunks with metadata
- `embedder.ts` — OpenAI embedding generation (text-embedding-3-small, 1536 dims)
- `pipeline.ts` — Pinecone operations (upsert, search, delete)
- `types.ts` — Ingestion config

## Data Flow

1. Scraped content enters via `chunkText(text, metadata)`
2. Chunks are embedded via `generateEmbeddings(texts)`
3. Embedded chunks stored in Pinecone via `upsertChunks(chunks)`
4. Queries resolved via `searchKnowledgeBase(query)`

## Dependencies

- `@jigsaw/shared` — Types + utils
- `@jigsaw/db` — DB access
- `openai` — Embedding generation
- `@pinecone-database/pinecone` — Vector storage

## Environment Variables

- `OPENAI_API_KEY` — For embedding generation
- `PINECONE_API_KEY` — For vector DB access
- `PINECONE_INDEX` — Index name (default: `jigsaw`)

## Known bugs

- `pipeline.ts:18` — `upsertChunks()` has `values: chunk.metadata as unknown as number[]`. This casts metadata as the embedding vector. Should be `values: chunk.embedding`.

## Common Tasks

- Ingest a document: `chunkText()` → `generateEmbeddings()` → `upsertChunks()`
- Search: `searchKnowledgeBase({ query: "..." })`
- Delete source data: `deleteBySource(sourceId)`
