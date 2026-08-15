# @jigsaw/mcp-server

JigSaw MCP server — knowledge base search for AI assistants. Forked from Playwright MCP.

## Purpose

Lets AI assistants (Claude, ChatGPT, etc.) connect via MCP and search the knowledge base, manage sources, and monitor crawl jobs.

## Architecture

- `src/index.ts` — MCP server entry point (stdio transport, McpServer)
- `src/tools/jigsaw.ts` — JigSaw tool implementations + Zod schemas

## MCP Tools

| Tool | Description |
|------|-------------|
| `jigsaw_search` | Semantic search across ingested content |
| `jigsaw_list_sources` | List all crawled sources (PostgreSQL) |
| `jigsaw_add_source` | Add a URL to crawl + ingest |
| `jigsaw_crawl_status` | Check crawl job status |

## Transport

**stdio** — runs as a subprocess, not HTTP. The MCP client spawns this process and communicates via stdin/stdout.

## Dependencies

- `@jigsaw/shared` — Types (SearchQuery, SearchResult)
- `@jigsaw/ingestion` — Search pipeline (`searchKnowledgeBase`)
- `@jigsaw/db` — Database access (Drizzle ORM, sources + crawlJobs tables)
- `@modelcontextprotocol/sdk@^1.30.0` — MCP protocol
- `drizzle-orm@^0.33.0` — DB queries (must match @jigsaw/db version)
- `zod` — Input validation

## Running

```bash
npx jigsaw-mcp
```

Or configure in your MCP client:
```json
{
  "mcpServers": {
    "jigsaw": {
      "command": "npx",
      "args": ["@jigsaw/mcp-server"]
    }
  }
}
```

## Adding a new tool

1. Add Zod schema to `src/tools/jigsaw.ts`
2. Add `server.tool()` call in `registerJigsawTools()`
3. Build: `bun run build`
4. Test: run `npx jigsaw-mcp` and connect via MCP inspector

## Fork notes

Forked from `microsoft/playwright-mcp` (Apache 2.0). The Playwright MCP source code is preserved in the repo for reference. The current entry point uses a standalone McpServer (not Playwright's createConnection) to give full control over tool registration.
