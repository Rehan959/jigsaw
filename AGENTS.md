# JigSaw

AI-powered web scraping and knowledge retrieval platform.

## Project Structure

```
jigsaw/
├── apps/
│   ├── api/          # Express REST API
│   └── web/          # Next.js frontend
├── packages/
│   ├── shared/       # Shared types & utilities
│   ├── db/           # Drizzle ORM + PostgreSQL schema
│   ├── crawler/      # Playwright scraper + BullMQ jobs
│   ├── ingestion/    # Chunking, embeddings, Pinecone
│   └── mcp-server/   # MCP server for AI assistants
└── turbo.json        # Turborepo task config
```

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Package Manager**: bun
- **Monorepo**: Turborepo
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Express
- **ORM**: Drizzle
- **Database**: PostgreSQL
- **Queue**: BullMQ + Redis
- **Embeddings**: OpenAI text-embedding-3-small
- **Vector DB**: Pinecone
- **Browser Automation**: Playwright
- **MCP**: @modelcontextprotocol/sdk

## Commands

```bash
bun install              # Install all dependencies
bun run build            # Build all packages
bun run dev              # Start api + web in dev mode
bun run lint             # Lint all packages
bun run check-types      # TypeScript check all packages
bun run db:generate      # Generate Drizzle migrations
bun run db:migrate       # Run migrations
```

## Code Standards

- TypeScript strict mode
- ES modules (type: "module")
- Use `workspace:*` for internal package references
- Import types from `@jigsaw/shared`
- Validate inputs with Zod
- Use Drizzle for all DB queries (no raw SQL unless necessary)

## Environment Variables

Copy `.env.example` to `.env` and fill in:
- `DATABASE_URL` — PostgreSQL connection
- `REDIS_URL` — Redis for BullMQ
- `OPENAI_API_KEY` — For embeddings
- `PINECONE_API_KEY` — For vector DB
- `API_SECRET` — JWT secret for auth

## Architecture Notes

1. **Crawler** fetches pages via Playwright, cleans HTML *(stub — not yet implemented)*
2. **Ingestion** chunks content, generates embeddings, stores in Pinecone
3. **MCP Server** exposes search tools for AI assistants (stdio transport)
4. **API** provides REST endpoints for the web frontend
5. **Web** is the user-facing search and management interface

## Known Issues

- `packages/crawler/` — Stub package, no implementation yet
- `packages/mcp-server` — Forked from Playwright MCP, currently runs JigSaw tools only (Playwright browser tools available via @playwright/mcp dependency)

## Key Decisions

- **MCP transport:** stdio (subprocess), not HTTP — simpler for local AI assistant integration
- **Embedding model:** OpenAI `text-embedding-3-small` (1536 dimensions)
- **Chunk size:** 1000 chars with 200 char overlap
- **Frontend:** Dark-mode-first, glassmorphism accents, purple primary (#5519f7)
- **DB:** Drizzle ORM with PostgreSQL (sources + crawlJobs tables)
