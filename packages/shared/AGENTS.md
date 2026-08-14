# @jigsaw/shared

Shared types and utilities for the JigSaw platform.

## Purpose

Common type definitions, interfaces, and utility functions used across all JigSaw packages.

## Architecture

- `types.ts` — Core domain types (Source, CrawlJob, Chunk, SearchResult)
- `utils.ts` — Helper functions (ID generation, chunking, slugify)
- `index.ts` — Re-exports everything

## Dependencies

None. This is a leaf package with no internal dependencies.

## Common Tasks

- Adding a new domain type: add to `types.ts`, export from `index.ts`
- Adding a utility: add to `utils.ts`, export from `index.ts`
