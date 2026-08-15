# @jigsaw/crawler

Playwright-based web scraper + BullMQ job scheduler.

## Status

**Stub package** — `package.json` and `tsconfig.json` exist but no source files have been implemented yet. The crawler agent config (`.opencode/agents/crawler.md`) defines the intended architecture.

## Planned Architecture

- `src/scraper.ts` — Core Playwright scraping logic (headless mode)
- `src/cleaner.ts` — HTML content extraction (strip nav, ads, boilerplate)
- `src/scheduler.ts` — BullMQ job queue for async crawl processing

## Data Flow (planned)

1. API receives crawl request → creates job in DB (status: `queued`)
2. Scheduler picks up job → updates status to `running`
3. Scraper fetches page via Playwright (headless)
4. Cleaner extracts meaningful content from HTML
5. Content passed to ingestion pipeline for chunking + embedding
6. Job status updated to `completed` (or `failed` on error)

## Dependencies (planned)

- `playwright` — Browser automation
- `bullmq` — Job queue
- `ioredis` — Redis connection for BullMQ
- `@jigsaw/shared` — Types
- `@jigsaw/db` — Job status updates

## Guidelines

- Always use headless mode for Playwright
- Respect robots.txt when scraping
- Handle timeouts gracefully
- Clean HTML by stripping nav, ads, boilerplate
- Use BullMQ for async job processing
- Update crawl job status in DB (queued → running → completed/failed)
