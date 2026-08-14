# @jigsaw/web

Next.js frontend for the JigSaw knowledge retrieval platform.

## Purpose

User-facing web app for searching the knowledge base, managing sources, and viewing crawl job status.

## Architecture

- `src/app/layout.tsx` — Root layout with metadata
- `src/app/page.tsx` — Home page
- `src/app/search/page.tsx` — Search interface (client component)

## Pages

- `/` — Home with link to search
- `/search` — Semantic search with results display

## Dependencies

- `@jigsaw/shared` — Shared types
- `next` — React framework
- `react` — UI library

## Environment Variables

- `NEXT_PUBLIC_API_URL` — API backend URL (default: `http://localhost:3001`)

## Common Tasks

- Add a page: create `src/app/<route>/page.tsx`
- Add a component: create in `src/components/`
- API calls: use fetch to backend at `NEXT_PUBLIC_API_URL`
