# Plan: Complete MCP Server Implementation

## Current State

The MCP server is in a **broken transitional state**:

| What | Status |
|------|--------|
| `dist/` (compiled JS) | Complete — 4 tools, MCP SDK v2, stdio transport |
| `src/` (TypeScript source) | **Missing** — directory exists but is empty |
| `package.json` | **Missing** — no package manifest at mcp-server root |
| `tsconfig.json` | **Missing** — no TypeScript config |
| `playwright-mcp/` fork | Still present — dead code, never wired in |
| Documentation | Partially updated, contains contradictions |

**The compiled `dist/` works but cannot be rebuilt from source because source files don't exist.**

---

## Phase 1: Scaffold Package Files

### 1.1 Create `packages/mcp-server/package.json`

```json
{
  "name": "@jigsaw/mcp-server",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "bin": {
    "jigsaw-mcp": "./dist/index.js"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node dist/index.js",
    "lint": "eslint src/",
    "check-types": "tsc --noEmit"
  },
  "dependencies": {
    "@modelcontextprotocol/server": "^2.0.0",
    "@jigsaw/shared": "workspace:*",
    "@jigsaw/db": "workspace:*",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/node": "^22.0.0"
  },
  "peerDependencies": {
    "openai": "^4.0.0",
    "@pinecone-database/pinecone": "^3.0.0"
  },
  "peerDependenciesMeta": {
    "openai": { "optional": true },
    "@pinecone-database/pinecone": { "optional": true }
  }
}
```

### 1.2 Create `packages/mcp-server/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "types": ["node"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.3 Run `bun install` to wire workspace dependencies

---

## Phase 2: Create TypeScript Source Files

Reverse-engineer source from compiled `dist/` output. Each file maps 1:1.

### 2.1 `src/index.ts` — Entry point

```typescript
#!/usr/bin/env node
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createJigsawServer } from "./server.js";

serveStdio(() => createJigsawServer());
```

### 2.2 `src/server.ts` — McpServer factory

```typescript
import { McpServer } from "@modelcontextprotocol/server";
import { registerSearchTool } from "./tools/search.js";
import { registerListSourcesTool } from "./tools/list-sources.js";
import { registerAddSourceTool } from "./tools/add-source.js";
import { registerCrawlStatusTool } from "./tools/crawl-status.js";

export function createJigsawServer(): McpServer {
  const server = new McpServer({
    name: "jigsaw",
    version: "0.1.0",
  });

  registerSearchTool(server);
  registerListSourcesTool(server);
  registerAddSourceTool(server);
  registerCrawlStatusTool(server);

  return server;
}
```

### 2.3 `src/tools/search.ts` — Semantic search via OpenAI + Pinecone

- Generates embedding via `openai.embeddings.create()` (model: `text-embedding-3-small`)
- Queries Pinecone index with vector + optional source filter + threshold
- Returns formatted results with score, content, metadata
- Dynamic imports for `openai` and `@pinecone-database/pinecone` (peer deps)

### 2.4 `src/tools/list-sources.ts` — DB query for sources

- Uses `@jigsaw/db` to query `sources` table
- Returns id, url, name, crawlFrequency, lastCrawledAt, createdAt
- Optional `limit` parameter (default 20)

### 2.5 `src/tools/add-source.ts` — Insert new source

- Uses `@jigsaw/db` to insert into `sources` table
- Derives display name from URL hostname if not provided
- Uses hardcoded default userId (`00000000-0000-0000-0000-000000000001`)

### 2.6 `src/tools/crawl-status.ts` — Crawl job status

- Joins `crawlJobs` + `sources` tables via Drizzle
- Filters by sourceId if provided
- Orders by createdAt descending
- Optional `limit` parameter (default 10)

### 2.7 `src/tools/types.ts` — Shared types

```typescript
export interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: {
    sourceId: string;
    url: string;
    title: string;
    chunkIndex: number;
    totalChunks: number;
  };
}

export interface ToolResponse {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}
```

---

## Phase 3: Verify Build

```bash
cd packages/mcp-server
bun run build        # tsc should compile src/ → dist/
bun run check-types  # TypeScript validation
```

Verify `dist/` output matches or improves on current compiled files.

---

## Phase 4: Remove Playwright Fork

### 4.1 Delete `packages/mcp-server/playwright-mcp/`

All JigSaw tool code has been migrated to `src/`. The fork is dead code.

### 4.2 Update `.gitignore` if needed

Ensure `node_modules/` under mcp-server is gitignored.

### 4.3 Regenerate lockfile

```bash
bun install  # regenerates bun.lock without the fork reference
```

---

## Phase 5: Fix Documentation

### 5.1 Update `docs/mcp-server/README.md`
- Correct tool count: 4 tools, not 2
- Update paths to standalone package
- Update SDK version reference

### 5.2 Update `docs/mcp-server/reference.md`
- Remove "stub" status for `list_sources` (it's fully implemented)
- Update source file paths to `src/tools/`
- Add `add_source` and `crawl_status` to the reference

### 5.3 Update `docs/mcp-server/how-to-add-tools.md`
- Change v1 `server.tool()` examples to v2 `server.registerTool()` with Zod schemas
- Update import paths from `@modelcontextprotocol/sdk` to `@modelcontextprotocol/server`

### 5.4 Update `.opencode/agents/mcp.md`
- Fix stale file paths (`src/tools/query.ts` doesn't exist)
- Reference correct tool files

### 5.5 Update `CLAUDE.md`
- Remove "stub" status for `list_sources`
- Update mcp-server description

### 5.6 Update `AGENTS.md`
- Update mcp-server package description (no longer "forked from Playwright MCP")

---

## Phase 6: Test

### 6.1 Build verification
```bash
bun run build --filter=@jigsaw/mcp-server
```

### 6.2 Server startup
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | node packages/mcp-server/dist/index.js
```

### 6.3 Tool discovery
```bash
# After initialize, send tools/list
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | node packages/mcp-server/dist/index.js
```

### 6.4 MCP Inspector (if available)
```bash
npx @modelcontextprotocol/inspector node packages/mcp-server/dist/index.js
```

---

## Files to Create/Modify

| Action | File |
|--------|------|
| Create | `packages/mcp-server/package.json` |
| Create | `packages/mcp-server/tsconfig.json` |
| Create | `packages/mcp-server/src/index.ts` |
| Create | `packages/mcp-server/src/server.ts` |
| Create | `packages/mcp-server/src/tools/search.ts` |
| Create | `packages/mcp-server/src/tools/list-sources.ts` |
| Create | `packages/mcp-server/src/tools/add-source.ts` |
| Create | `packages/mcp-server/src/tools/crawl-status.ts` |
| Create | `packages/mcp-server/src/tools/types.ts` |
| Delete | `packages/mcp-server/playwright-mcp/` (entire directory) |
| Update | `docs/mcp-server/README.md` |
| Update | `docs/mcp-server/reference.md` |
| Update | `docs/mcp-server/how-to-add-tools.md` |
| Update | `.opencode/agents/mcp.md` |
| Update | `CLAUDE.md` |
| Update | `AGENTS.md` |

---

## What's NOT in Scope

- **HTTP transport** — stdio only (HTTP via `streamableHttp` can be added later)
- **Authentication** — relies on process-level isolation
- **Playwright browser tools** — users run Playwright MCP separately
- **New tools** — only migrating existing 4 tools; new tools are a separate task
- **@jigsaw/crawler integration** — crawler package is still a stub

---

## Review Findings (CEO Review)

### Architecture Improvements

**1.1 Graceful shutdown handling** — Add SIGINT/SIGTERM handler to clean up DB connections when the parent process terminates. `serveStdio()` may handle stdio closure, but explicit signal handling ensures clean shutdown.

**1.2 Remove hardcoded userId** — Replace `00000000-0000-0000-0000-000000000001` in `add_source` with a configurable value or derive from context. For the intrapreneurship demo, keep the default but add a TODO comment.

**1.3 Health check endpoint** — Add a `ping` tool that returns server status (DB connection, OpenAI key availability). Useful for verifying the server is functional, not just running.

### Error Handling Improvements

**2.1 Error type distinction** — Differentiate between rate limit (429), auth failure (401), DB connection error, and validation error. Return specific guidance: "Rate limited — retry in 30s" vs "Invalid API key — check OPENAI_API_KEY".

**2.2 Retry logic for transient errors** — Add exponential backoff retry (2 attempts, 1s/2s) for OpenAI timeouts and Pinecone transient failures. The AI assistant can also retry, but server-side retry reduces round-trips.

**2.3 Better error fallback** — When `error` is not an `Error` instance, log the raw value and return a useful message instead of "Unknown error".

### Security Improvements

**3.1 Input length validation** — Add `.max(10000)` to search query Zod schema. Add `.max(2048)` to URL in add_source. Prevents abuse via oversized inputs.

**3.2 sourceId format validation** — Validate sourceId is a UUID format before passing to Pinecone filter. Prevents injection via malformed filter values.

**3.3 Error message sanitization** — Ensure catch blocks don't expose stack traces or env var values in error responses. Use `error.message` only, not `error.stack`.

### Testing

**6.1 Unit tests for tool handlers** — Mock OpenAI, Pinecone, and @jigsaw/db. Test each tool's happy path, error path, and edge cases (empty results, invalid input, API failures).

**6.2 Integration test** — Start the server, send `initialize` + `tools/list`, verify all4 tools are registered with correct schemas.

**6.3 Zod schema tests** — Verify that invalid inputs are rejected by Zod validation before reaching tool handlers.

### Observability

**8.1 stderr logging** — Add structured logging to stderr for each tool call: tool name, parameters (sanitized), latency, result count, error status. Use a simple format: `[jigsaw] search: query="..." latency=342ms results=5`.

**8.2 Request tracing** — Add a request ID to each tool call for correlating logs. Generate a short random ID (8 chars) per invocation.

**8.3 Slow query logging** — Log warnings for tool calls exceeding 2s latency. Helps identify performance issues.

### Engineering Review Findings

**E1.1 Tool registration validation** — Add startup check that verifies all4 tools are registered after `createJigsawServer()`. Log a warning if any are missing.

**E2.2 UUID format validation** — Add `.uuid()` or regex validation to `sourceId` Zod schema in `crawl-status` tool. Validates format before DB call.

**E3.1 MCP protocol handshake test** — Add integration test that validates MCP spec compliance: `initialize` response shape, `tools/list` response shape, tool schema structure.

### Developer Experience (DX) Findings

**DX1.1 Getting started friction** — Add `.env.example` for MCP server with all required vars. Use relative paths in config examples. Document `npx` or global install option for easier onboarding.

**DX2.1 Actionable error messages** — Replace raw API errors with actionable guidance: "Check OPENAI_API_KEY env var" instead of leaking the raw error. Add error code mapping for common failures.

**DX5.1 Update tool creation docs** — Update `docs/mcp-server/how-to-add-tools.md` to use MCP SDK v2 API (`server.registerTool()` with Zod schemas). Add a template file showing the pattern.

---

## Success Criteria

1. `bun run build --filter=@jigsaw/mcp-server` compiles without errors
2. `bun run check-types` passes
3. `bun run test` passes (new unit + integration tests)
4. Server starts and responds to `initialize` + `tools/list`
5. All 4 tools appear in the tool list with correct schemas
6. `playwright-mcp/` directory is removed
7. Documentation is consistent and accurate
8. No stale references to old file paths or SDK v1 API
9. stderr shows structured logs for tool calls
10. Input validation rejects oversized/malformed inputs

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | ISSUES_FOUND | 10 findings across 6 sections |
| Eng Review | `/plan-eng-review` | Architecture & code quality | 1 | ISSUES_FOUND | 3 findings (registration, UUID, protocol test) |
| DX Review | `/plan-devex-review` | Developer experience | 1 | ISSUES_FOUND | 3 findings (getting started, errors, docs) |

- **VERDICT:** CEO + ENG + DX COMPLETE — 23 findings total, all accepted for implementation. Plan updated with all review improvements.

NO UNRESOLVED DECISIONS
