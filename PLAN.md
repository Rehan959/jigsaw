# JigSaw Project Setup Plan

## Overview

Set up a monorepo for JigSaw — a web-scraping and AI-powered knowledge retrieval platform — with OpenCode-compatible architecture docs for each component.

## Tech Decisions (Locked)

| Decision | Choice | Rationale |
|---|---|---|
| ORM | **Drizzle** | TypeScript-first, lighter than Prisma, better raw SQL control |
| Queue | **BullMQ + Redis** | Robust job scheduling for crawls, retry logic, concurrency control |
| Embeddings | **OpenAI (text-embedding-3-small)** | Cost-effective, good quality, 1536 dimensions |
| Package Manager | **bun** | Fast, native TypeScript, workspace support |
| Monorepo Tool | **Turborepo** | Build caching, parallel execution, task pipeline |
| Vector DB | **Pinecone** | As specified in requirements |
| Relational DB | **PostgreSQL** | As specified in requirements |
| Frontend | **Next.js 14+** | As specified, App Router |
| Backend | **Express + TypeScript** | As specified |

## Monorepo Structure

```
jigsaw/
├── AGENTS.md                          # OpenCode project rules
├── opencode.json                      # OpenCode config
├── package.json                       # Root workspace config
├── turbo.json                         # Turborepo pipeline
├── tsconfig.base.json                 # Shared TypeScript config
├── .env.example                       # Environment variable template
├── .gitignore
│
├── apps/
│   ├── web/                           # Next.js frontend
│   │   ├── AGENTS.md                  # App-specific agent rules
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── app/                   # App Router pages
│   │       ├── components/            # React components
│   │       └── lib/                   # Utilities, API client
│   │
│   └── api/                           # Express backend
│       ├── AGENTS.md
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts               # Entry point
│           ├── routes/                # Express routes
│           ├── middleware/             # Auth, validation
│           └── services/              # Business logic
│
├── packages/
│   ├── crawler/                       # Playwright web scraper
│   │   ├── AGENTS.md
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts               # Main crawler exports
│   │       ├── scraper.ts             # Core scraping logic
│   │       ├── cleaner.ts             # HTML content extraction
│   │       ├── scheduler.ts           # Crawl job scheduling
│   │       └── types.ts               # Crawler-specific types
│   │
│   ├── ingestion/                     # Content processing pipeline
│   │   ├── AGENTS.md
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── chunker.ts             # Text chunking logic
│   │       ├── embedder.ts            # OpenAI embedding generation
│   │       ├── pipeline.ts            # Orchestration
│   │       └── types.ts
│   │
│   ├── mcp-server/                    # MCP server (forked from playwright-mcp)
│   │   ├── AGENTS.md
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts               # MCP server entry
│   │       ├── tools/                 # MCP tool definitions
│   │       │   ├── search.ts          # Knowledge base search
│   │       │   └── query.ts           # Query tools
│   │       └── types.ts
│   │
│   ├── db/                            # Database schema & migrations
│   │   ├── AGENTS.md
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── drizzle.config.ts
│   │   └── src/
│   │       ├── index.ts               # DB connection exports
│   │       ├── schema/                # Drizzle schema definitions
│   │       │   ├── users.ts
│   │       │   ├── sources.ts
│   │       │   └── crawl-jobs.ts
│   │       └── migrations/            # Generated migrations
│   │
│   └── shared/                        # Shared types & utilities
│       ├── AGENTS.md
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── types.ts               # Shared type definitions
│           └── utils.ts               # Common utilities
│
└── .opencode/
    └── agents/                        # OpenCode custom agents
        ├── crawler.md                 # Crawler specialist agent
        ├── ingestion.md               # Ingestion pipeline agent
        ├── mcp.md                     # MCP server agent
        └── fullstack.md               # Full-stack integration agent
```

## Files to Create

### Phase 1: Root Configuration

1. **`package.json`** — Root workspace with bun workspaces
2. **`turbo.json`** — Turborepo pipeline config
3. **`tsconfig.base.json`** — Shared TypeScript config
4. **`.env.example`** — All required env vars
5. **`.gitignore`** — Standard Node.js + project-specific ignores
6. **`AGENTS.md`** — OpenCode project-level rules
7. **`opencode.json`** — OpenCode configuration

### Phase 2: Database Package (`packages/db`)

8. **`packages/db/package.json`**
9. **`packages/db/tsconfig.json`**
10. **`packages/db/drizzle.config.ts`**
11. **`packages/db/src/schema/users.ts`** — User model
12. **`packages/db/src/schema/sources.ts`** — Crawl sources model
13. **`packages/db/src/schema/crawl-jobs.ts`** — Job tracking model
14. **`packages/db/src/index.ts`** — DB connection + exports
15. **`packages/db/AGENTS.md`** — Architecture doc

### Phase 3: Shared Package (`packages/shared`)

16. **`packages/shared/package.json`**
17. **`packages/shared/tsconfig.json`**
18. **`packages/shared/src/types.ts`** — Shared types
19. **`packages/shared/src/utils.ts`** — Common utilities
20. **`packages/shared/src/index.ts`** — Exports
21. **`packages/shared/AGENTS.md`**

### Phase 4: Crawler Package (`packages/crawler`)

22. **`packages/crawler/package.json`**
23. **`packages/crawler/tsconfig.json`**
24. **`packages/crawler/src/scraper.ts`** — Core Playwright scraping
25. **`packages/crawler/src/cleaner.ts`** — HTML content extraction
26. **`packages/crawler/src/scheduler.ts`** — BullMQ job scheduling
27. **`packages/crawler/src/types.ts`**
28. **`packages/crawler/src/index.ts`**
29. **`packages/crawler/AGENTS.md`**

### Phase 5: Ingestion Package (`packages/ingestion`)

30. **`packages/ingestion/package.json`**
31. **`packages/ingestion/tsconfig.json`**
32. **`packages/ingestion/src/chunker.ts`** — Text chunking
33. **`packages/ingestion/src/embedder.ts`** — OpenAI embeddings
34. **`packages/ingestion/src/pipeline.ts`** — Orchestration
35. **`packages/ingestion/src/types.ts`**
36. **`packages/ingestion/src/index.ts`**
37. **`packages/ingestion/AGENTS.md`**

### Phase 6: MCP Server Package (`packages/mcp-server`)

38. **`packages/mcp-server/package.json`**
39. **`packages/mcp-server/tsconfig.json`**
40. **`packages/mcp-server/src/tools/search.ts`**
41. **`packages/mcp-server/src/tools/query.ts`**
42. **`packages/mcp-server/src/index.ts`**
43. **`packages/mcp-server/AGENTS.md`**

### Phase 7: API Package (`apps/api`)

44. **`apps/api/package.json`**
45. **`apps/api/tsconfig.json`**
46. **`apps/api/src/index.ts`** — Express entry point
47. **`apps/api/src/routes/search.ts`** — Search endpoints
48. **`apps/api/src/routes/sources.ts`** — Source management
49. **`apps/api/src/routes/jobs.ts`** — Crawl job endpoints
50. **`apps/api/src/middleware/auth.ts`**
51. **`apps/api/AGENTS.md`**

### Phase 8: Web App (`apps/web`)

52. **`apps/web/package.json`**
53. **`apps/web/tsconfig.json`**
54. **`apps/web/next.config.ts`**
55. **`apps/web/src/app/layout.tsx`**
56. **`apps/web/src/app/page.tsx`**
57. **`apps/web/src/app/search/page.tsx`**
58. **`apps/web/AGENTS.md`**

### Phase 9: OpenCode Agents

59. **`.opencode/agents/crawler.md`**
60. **`.opencode/agents/ingestion.md`**
61. **`.opencode/agents/mcp.md`**
62. **`.opencode/agents/fullstack.md`**

## AGENTS.md Content Strategy

Each `AGENTS.md` will contain:
- **Purpose**: What this component does
- **Architecture**: Key modules and data flow
- **API surface**: Exports and interfaces
- **Conventions**: Code style, naming patterns
- **Dependencies**: Internal and external
- **Environment**: Required env vars
- **Common tasks**: How to extend, debug, test

## Execution Order

### Step 1: Scaffold with create-turbo

```bash
cd /home/rehan/Projects/jigsaw
bunx create-turbo@latest .
```

This generates the base monorepo structure:
- Root `package.json` with workspaces
- Root `turbo.json` with task config
- `apps/web` (Next.js starter)
- `apps/docs` (Next.js docs starter — we'll delete and replace with `apps/api`)
- `packages/ui` (shared UI lib — we'll repurpose as `packages/shared`)
- `packages/eslint-config`, `packages/typescript-config` (tooling — keep)

### Step 2: Clean up scaffolded defaults

1. Remove `apps/docs/` (replace with `apps/api/`)
2. Remove `packages/ui/` (replace with our packages)
3. Keep `packages/eslint-config/` and `packages/typescript-config/`
4. Update root `package.json` scripts

### Step 3: Create JigSaw packages

Create these in order (dependency chain):

1. `packages/shared/` — no deps
2. `packages/db/` — depends on shared
3. `packages/crawler/` — depends on shared, db
4. `packages/ingestion/` — depends on shared, db
5. `packages/mcp-server/` — depends on shared, db, ingestion
6. `apps/api/` — depends on all packages
7. `apps/web/` — update existing Next.js app

### Step 4: Configure OpenCode

1. Create root `AGENTS.md`
2. Create `opencode.json`
3. Create `.opencode/agents/*.md` files
4. Create per-package `AGENTS.md` files

### Step 5: Verify

```bash
bun install
bun run build
bun run dev
```

## Key Configuration Files (Turborepo-Accurate)

### Root `package.json` (bun workspaces)

```json
{
  "name": "jigsaw",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "check-types": "turbo run check-types",
    "db:generate": "turbo run db:generate",
    "db:migrate": "turbo run db:migrate"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5.5.0"
  }
}
```

### Root `turbo.json` (v2 tasks format)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    }
  }
}
```

### Root `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "exclude": ["node_modules", "dist"]
}
```

### `.env.example`

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/jigsaw

# Redis (BullMQ)
REDIS_URL=redis://localhost:6379

# OpenAI (Embeddings)
OPENAI_API_KEY=sk-...

# Pinecone (Vector DB)
PINECONE_API_KEY=...
PINECONE_INDEX=jigsaw

# API
API_PORT=3001
API_SECRET=your-jwt-secret

# Web
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### `.gitignore`

```gitignore
# Dependencies
node_modules/
.pnp.*

# Build outputs
dist/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Turbo
.turbo/

# Bun
bun.lock

# Logs
*.log
npm-debug.log*

# Testing
coverage/

# Drizzle
packages/db/migrations/*.sql
```

## Verification

After setup:
```bash
bun install
bun run build      # Should compile all packages
bun run dev        # Should start api + web in dev mode
bun run check-types # TypeScript validation across all packages
```

<!-- AUTONOMOUS DECISION LOG -->
## Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|-------|----------|-----------|-----------|----------|----------|
| 1 | CEO | Defer demand validation | Mechanical | P6 | User is primary user, self-validating for demo | No |
| 2 | CEO | Focus on crawler + ingestion stubs first | Taste | P1 | Two empty packages block the entire pipeline | No |
| 3 | CEO | Keep locked tech stack | Mechanical | P3 | Stack already partially built, changing adds friction | No |
| 4 | CEO | Defer competition analysis | Mechanical | P3 | Demo context, not building to compete | No |
| 5 | CEO | Treat web as admin dashboard | Taste | P5 | MCP server is the product, web is secondary | No |
| 6 | CEO | Prioritize working end-to-end pipeline | Mechanical | P1 | 6-month regret is architecture without demo | No |
| 7 | CEO | Add quality validation steps | Mechanical | P1 | Completeness principle — verify data quality | No |
| 8 | CEO | Laptop demo (no auth/deployment) | Mechanical | P6 | Fastest path to sponsor showing | No |
| 9 | Design | Add toast system | Mechanical | P1 | Every page needs success/error feedback | No |
| 10 | Design | Fix Get Started routing | Mechanical | P1 | New users hit empty search page | No |
| 11 | Design | Fix CSS primary token to purple | Mechanical | P1 | Design system inconsistency | No |
| 12 | Design | Add error state for search | Mechanical | P1 | Users can't distinguish "no data" from "broken" | No |
| 13 | Design | Add first-use onboarding | Mechanical | P1 | Zero guidance for first-time users | No |
| 14 | Eng | Implement stub packages | Mechanical | P1 | Core task — blocks entire pipeline | No |
| 15 | Eng | Add DB migrations | Mechanical | P1 | Schema defined but never migrated | No |
| 16 | Eng | Add ingestion idempotency design | Mechanical | P1 | Prevents duplicate chunks on re-run | No |
| 17 | Eng | Add browser pool + resource limits | Mechanical | P1 | Crawler needs resource management | No |
| 18 | Eng | Defer auth middleware | Mechanical | P3 | Demo on localhost, no external exposure | No |
| 19 | Eng | Defer SSRF protection | Mechanical | P3 | Demo on localhost only | No |
| 20 | Eng | Fix jobs polling death | Mechanical | P5 | Explicit fix for broken behavior | No |
| 21 | Eng | Add React error boundaries | Mechanical | P1 | White screen on render errors | No |
| 22 | Eng | Add CORS allowlist | Mechanical | P1 | Security best practice even for demo | No |
| 23 | Eng | Use lazy singletons for MCP clients | Mechanical | P5 | Connection churn on every call | No |
| 24 | Eng | Add Zod validation for search results | Mechanical | P1 | Prevent crashes on malformed responses | No |
| 25 | DX | Add docker-compose.yml | Mechanical | P1 | 5 external services required, no one-command start | No |
| 26 | DX | Add shared error handler | Mechanical | P1 | Raw exceptions exposed to clients | No |
| 27 | DX | Add API integration tests | Mechanical | P1 | Zero test coverage for API | No |
| 28 | DX | Fix shared package types exports | Mechanical | P1 | TypeScript consumers may not resolve types | No |
| 29 | DX | Pin turbo version | Mechanical | P1 | "latest" is risky for CI reproducibility | No |
| 30 | DX | Defer vector DB abstraction | Mechanical | P3 | Pinecone-only for demo | No |
| 31 | DX | Defer changelog/versioning | Mechanical | P3 | Post-demo improvement | No |

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/autoplan` | Strategy & scope | 1 | COMPLETE | 8 findings (3 critical, 3 high, 2 medium) |
| Design Review | `/autoplan` | UI/UX design | 1 | COMPLETE | 21 findings (3 critical, 7 high, 9 medium, 2 low) |
| Eng Review | `/autoplan` | Architecture & code quality | 1 | COMPLETE | 19 findings (2 critical, 7 high, 8 medium, 1 low) |
| DX Review | `/autoplan` | Developer experience | 1 | COMPLETE | 24 findings (1 critical, 7 high, 10 medium, 6 low) |

- **VERDICT:** ALL 4 PHASES COMPLETE — 72 findings total, all auto-decided using the 6 principles.
- **SINGLE-MODEL:** Codex unavailable (npm/bun conflict). All reviews via Claude subagent only.
- **DECISIONS:** 31 auto-decided, 0 taste decisions surfaced, 0 user challenges.
- **NEXT STEP:** Implement the two stub packages (crawler + ingestion), then wire the API.
