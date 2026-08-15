# Plan: Build Standalone @jigsaw/mcp-server

## Context

The JigSaw MCP server currently lives as dead code inside a vendored Playwright MCP fork (`packages/mcp-server/playwright-mcp/src/jigsaw/`). Four tools are implemented but never wired into the server. The package uses MCP SDK v1 and is tightly coupled to Playwright's codebase.

**Goal:** Build a standalone `@jigsaw/mcp-server` package using MCP SDK v2 with stdio transport, exposing JigSaw's knowledge base tools to AI assistants (Claude, Cursor, ChatGPT, etc.).

**Decisions made:**
- Architecture: Standalone package (not a Playwright fork extension)
- SDK: MCP TypeScript SDK v2 (`@modelcontextprotocol/server` v2.x)
- Transport: stdio only (can add HTTP later)

---

## Phase 1: Scaffold the Package

### 1.1 Create `packages/mcp-server/`

```
packages/mcp-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Entry point — serveStdio
│   ├── server.ts             # McpServer factory — createJigsawServer()
│   └── tools/
│       ├── search.ts         # search_knowledge_base tool
│       ├── list-sources.ts   # list_sources tool
│       ├── add-source.ts     # add_source tool
│       └── crawl-status.ts   # crawl_status tool
├── AGENTS.md
└── dist/                     # Build output
```

### 1.2 `package.json`

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

**Note:** `openai` and `pinecone` are peer deps because they're only needed for `search_knowledge_base`. The other tools work with just `@jigsaw/db`.

### 1.3 `tsconfig.json`

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

---

## Phase 2: Implement the MCP Server

### 2.1 Server Factory (`src/server.ts`)

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

### 2.2 Entry Point (`src/index.ts`)

```typescript
#!/usr/bin/env node
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createJigsawServer } from "./server.js";

serveStdio(() => createJigsawServer());
```

`serveStdio` handles the stdio transport setup — reads JSON-RPC from stdin, writes to stdout. No manual transport wiring needed in v2.

### 2.3 Tool Implementations

Each tool follows the MCP SDK v2 pattern:

```typescript
import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

export function registerSearchTool(server: McpServer): void {
  server.registerTool(
    "search_knowledge_base",
    {
      description: "Search the JigSaw knowledge base using semantic similarity. Returns relevant content chunks from crawled websites.",
      inputSchema: {
        query: z.string().describe("Natural language search query"),
        sourceId: z.string().optional().describe("Filter to a specific source UUID"),
        limit: z.number().optional().default(5).describe("Max results (1-100)"),
        threshold: z.number().optional().describe("Min similarity score (0-1)"),
      },
    },
    async ({ query, sourceId, limit, threshold }) => {
      // Implementation — call OpenAI + Pinecone
      // Return { content: [{ type: "text", text: JSON.stringify(results) }] }
    }
  );
}
```

**Key differences from v1:**
- `server.registerTool()` instead of `server.tool()`
- `inputSchema` is a plain object of Zod schemas (not `.shape` on a Zod object)
- `serveStdio()` wraps the server creation — no manual `StdioServerTransport`
- Import from `@modelcontextprotocol/server` (not `@modelcontextprotocol/sdk`)

### 2.4 Migrate Existing Tool Logic

The 4 tools already exist in the playwright-mcp fork. Migration:

| Old Location | New Location | Changes |
|---|---|---|
| `src/jigsaw/tools/search.ts` | `src/tools/search.ts` | Migrate from `server.tool()` to `server.registerTool()` with v2 schema format |
| `src/jigsaw/tools/list-sources.ts` | `src/tools/list-sources.ts` | Same migration + use `@jigsaw/db` workspace dep |
| `src/jigsaw/tools/add-source.ts` | `src/tools/add-source.ts` | Same migration |
| `src/jigsaw/tools/crawl-status.ts` | `src/tools/crawl-status.ts` | Same migration |
| `src/jigsaw/types.ts` | `src/tools/types.ts` | Move types, keep as-is |
| `src/jigsaw/index.ts` | `src/server.ts` | Rewrite as McpServer factory |

**No business logic changes needed** — the core logic (OpenAI embeddings, Pinecone queries, Drizzle DB calls) stays the same. Only the MCP registration API surface changes.

---

## Phase 3: Wire Dependencies

### 3.1 Workspace Dependencies

The server needs access to:
- `@jigsaw/shared` — Types (`SearchResult`, `SearchQuery`, etc.)
- `@jigsaw/db` — Drizzle schema + client (`db`, `sources`, `crawlJobs`)

Both already exist as workspace packages. Add `workspace:*` references in `package.json`.

### 3.2 Database Connection

The tools that use `@jigsaw/db` (`list_sources`, `add_source`, `crawl-status`) import the db client. This means the MCP server needs `DATABASE_URL` set in the environment.

For `search_knowledge_base`, it needs `OPENAI_API_KEY` and `PINECONE_API_KEY`.

### 3.3 Environment Variables

| Variable | Required | Used By |
|---|---|---|
| `DATABASE_URL` | Yes | `list_sources`, `add_source`, `crawl_status` |
| `OPENAI_API_KEY` | Yes | `search_knowledge_base` |
| `PINECONE_API_KEY` | Yes | `search_knowledge_base` |
| `PINECONE_INDEX` | No (default: `jigsaw`) | `search_knowledge_base` |

---

## Phase 4: Update Turborepo Config

### 4.1 Add to `turbo.json` tasks

The `build` task already covers all workspace packages via `^build` dependency. No changes needed if the package is correctly in the workspace.

### 4.2 Add build script

Ensure `turbo.json` has a `mcp-server` task or the generic `build` picks it up. Since `build` is generic and `packages/mcp-server` is in the workspace, `turbo run build` will build it automatically.

---

## Phase 5: Configuration & Client Integration

### 5.1 Claude Desktop Config

Users add this to `~/.config/Claude/claude_desktop_config.json` (Linux):

```json
{
  "mcpServers": {
    "jigsaw": {
      "command": "node",
      "args": ["/path/to/jigsaw/packages/mcp-server/dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://...",
        "OPENAI_API_KEY": "sk-...",
        "PINECONE_API_KEY": "..."
      }
    }
  }
}
```

### 5.2 Claude Code Config

Add to `.claude/settings.json` or project-level MCP config:

```json
{
  "mcpServers": {
    "jigsaw": {
      "command": "node",
      "args": ["packages/mcp-server/dist/index.js"]
    }
  }
}
```

### 5.3 Cursor Config

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "jigsaw": {
      "command": "node",
      "args": ["packages/mcp-server/dist/index.js"]
    }
  }
}
```

---

## Phase 6: Testing

### 6.1 Manual Testing

```bash
# Build the server
cd packages/mcp-server && bun run build

# Test with MCP Inspector (if available)
npx @modelcontextprotocol/inspector node packages/mcp-server/dist/index.js

# Or test by running the server directly
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | node packages/mcp-server/dist/index.js
```

### 6.2 Integration Testing

1. Build the server
2. Configure it in Claude Desktop / Claude Code
3. Ask Claude: "Search the JigSaw knowledge base for [query]"
4. Verify the tool is discovered and called
5. Verify results are returned correctly

### 6.3 Tool Verification Checklist

- [ ] `search_knowledge_base` — generates embedding, queries Pinecone, returns results
- [ ] `list_sources` — queries DB, returns source list
- [ ] `add_source` — inserts into DB, returns created source
- [ ] `crawl_status` — joins crawl_jobs + sources, returns job list
- [ ] Error handling — all tools return `isError: true` on failure (no crashes)
- [ ] Missing env vars — graceful error messages, not crashes

---

## Phase 7: Documentation Updates

### 7.1 Update `docs/mcp-server/`

- **README.md** — Update to reflect standalone package, correct paths, correct SDK version
- **reference.md** — Update API reference to match v2 SDK, correct source file paths
- **explanation-architecture.md** — Update architecture diagram, remove Playwright fork references
- **how-to-connect.md** — Update config examples for standalone server
- **tutorial-getting-started.md** — Update build/run instructions
- **how-to-add-tools.md** — Update to v2 `registerTool()` API

### 7.2 Update `AGENTS.md`

Add MCP server section to the root `AGENTS.md`:
- Package location: `packages/mcp-server/`
- Build: `bun run build --filter=@jigsaw/mcp-server`
- Test: `node packages/mcp-server/dist/index.js`

### 7.3 Remove Playwright Fork References

The old `packages/mcp-server/playwright-mcp/` directory should be:
- Removed from the workspace (or gitignored)
- Its `src/jigsaw/` code migrated to the new package
- References in docs/PLAN.md updated

---

## Phase 8: Cleanup

### 8.1 Remove Old Fork

```bash
# After verifying the new package works:
rm -rf packages/mcp-server/playwright-mcp
```

### 8.2 Update Root Config

- Remove any workspace references to the old fork path
- Ensure `bun.lock` is regenerated

---

## Success Criteria

1. `bun run build --filter=@jigsaw/mcp-server` compiles without errors
2. Running `node packages/mcp-server/dist/index.js` starts the server
3. The server responds to `tools/list` with all 4 JigSaw tools
4. AI assistants (Claude, Cursor) can discover and call the tools
5. `search_knowledge_base` returns real results from Pinecone
6. `list_sources` / `add_source` / `crawl_status` work against the DB
7. All tools handle errors gracefully (no server crashes)
8. Documentation is updated and accurate

---

## What's NOT in Scope

- **HTTP transport** — stdio only for now; HTTP can be added later via `@modelcontextprotocol/server`'s `streamableHttp`
- **@jigsaw/crawler package** — not yet implemented; crawl_status tool queries DB only
- **@jigsaw/ingestion package** — not yet implemented; search tool calls OpenAI/Pinecone directly
- **Authentication** — no auth on the MCP server; relies on process-level isolation
- **Playwright browser tools** — removed from scope; users can run Playwright MCP separately
