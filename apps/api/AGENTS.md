# @jigsaw/api

Express REST API connecting the frontend to backend services.

## Purpose

Provides endpoints for search, source management, and crawl job operations.

## Architecture

- `index.ts` — Express app setup (CORS, Helmet, routes)
- `routes/search.ts` — POST `/api/search` — semantic search
- `routes/sources.ts` — CRUD `/api/sources` — manage crawl sources
- `routes/jobs.ts` — CRUD `/api/jobs` — crawl job management

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/search` | Search knowledge base — body: `{ query, limit?, sourceId? }` |
| GET | `/api/sources` | List all sources |
| POST | `/api/sources` | Create a source — body: `{ url, name? }` |
| DELETE | `/api/sources/:id` | Delete a source |
| GET | `/api/jobs` | List all jobs |
| POST | `/api/jobs/crawl/:sourceId` | Trigger crawl for a source |
| GET | `/api/jobs/:id` | Get job status |

## Dependencies

- `@jigsaw/shared` — Types
- `@jigsaw/db` — Database access (Drizzle ORM, PostgreSQL)
- `@jigsaw/crawler` — Crawl scheduling (BullMQ + Redis)
- `@jigsaw/ingestion` — Search pipeline (Pinecone + OpenAI)
- `express`, `cors`, `helmet` — HTTP server

## Environment Variables

- `API_PORT` — Server port (default: 3001)
- `DATABASE_URL` — PostgreSQL connection (via `@jigsaw/db`)
- `REDIS_URL` — Redis for BullMQ (via `@jigsaw/crawler`)

## Common Tasks

- Add a route: create in `routes/`, add to router in `index.ts`
- Add validation: use Zod schemas in route handlers
