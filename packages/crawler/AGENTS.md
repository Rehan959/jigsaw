# @jigsaw/crawler

Playwright-based web scraper with BullMQ job scheduling.

## Purpose

Fetches and extracts clean content from target websites. Handles JavaScript-rendered pages, strips boilerplate, and manages crawl job state via Redis queues.

## Architecture

- `scraper.ts` — Core Playwright scraping (launches browser, navigates, extracts content)
- `cleaner.ts` — HTML cleaning (strips nav/ads/boilerplate, extracts main content)
- `scheduler.ts` — BullMQ queue + worker for async crawl jobs
- `types.ts` — Crawler-specific types and config

## Data Flow

1. `scheduleCrawl(sourceId, url)` adds job to BullMQ queue
2. Worker picks up job, updates DB status to "running"
3. `scrapeUrl()` fetches page via Playwright
4. `cleanHtml()` extracts readable content
5. Worker updates DB status to "completed" + sets `lastCrawledAt`

## Dependencies

- `@jigsaw/shared` — Types
- `@jigsaw/db` — DB schema + connection
- `playwright` — Browser automation
- `bullmq` + `ioredis` — Job queue

## Environment Variables

- `REDIS_URL` — Redis connection for BullMQ (default: `redis://localhost:6379`)

## Common Tasks

- Run a single scrape: `scrapeUrl({ url: "https://..." })`
- Schedule a crawl: `scheduleCrawl(sourceId, url)`
- Start the worker: create and export a worker with `createCrawlWorker()`
