# CLAUDE.md

## Project

JigSaw is a monorepo (bun + Turborepo) for AI-powered web scraping and semantic knowledge retrieval.

**Pipeline:** Web → Playwright Crawler → Content Cleaner → Chunker → OpenAI Embeddings → Pinecone Vector DB → MCP Server / REST API → Next.js Frontend

**Key files:**
- `packages/shared/src/types.ts` — all shared types (Source, CrawlJob, Chunk, SearchQuery, SearchResult, ChunkMetadata)
- `packages/db/src/schema/sources.ts` — Drizzle schema (sources + crawlJobs tables)
- `packages/ingestion/src/pipeline.ts` — core search + upsert logic
- `packages/mcp-server/src/tools/query.ts` — MCP server setup + tool implementations
- `apps/api/src/index.ts` — Express app with routes
- `apps/web/src/app/` — Next.js App Router pages

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec

## Known bugs

- `packages/ingestion/src/pipeline.ts:18` — `upsertChunks()` casts `chunk.metadata` as `unknown as number[]` (should be the embeddings array). Metadata is being passed as the `values` field to Pinecone, which expects float vectors.

## Architecture notes

- MCP server uses **stdio** transport (not HTTP) — runs as a subprocess
- `list_sources` MCP tool is a **stub** — logs a message but doesn't query the DB yet
- `searchKnowledgeBase()` dynamically imports the embedder to avoid loading OpenAI at module init
- Frontend pages use **inline `fetch()`** — the typed `ApiClient` in `src/lib/api.ts` exists but is not yet used by page components
- BullMQ + Redis handles async crawl job scheduling (in `packages/crawler/`, not yet implemented)
