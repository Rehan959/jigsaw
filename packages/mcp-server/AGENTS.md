# @jigsaw/mcp-server

Model Context Protocol server exposing the JigSaw knowledge base to AI assistants.

## Purpose

Lets AI assistants (Claude, ChatGPT, etc.) connect via MCP and search the knowledge base using structured tools.

## Architecture

- `tools/search.ts` — Zod schemas for search/list tool inputs
- `tools/query.ts` — MCP server setup + tool implementations
- `index.ts` — Entry point (stdio transport)

## MCP Tools

- `search_knowledge_base` — Semantic search across ingested content. Params: `query` (string), `limit` (number, optional, default 10), `sourceId` (string, optional)
- `list_sources` — List available data sources. Params: `limit` (number, optional, default 10). **Stub** — logs message but does not query DB yet.

## Transport

**stdio** — runs as a subprocess, not HTTP. The MCP client spawns this process and communicates via stdin/stdout.

## Dependencies

- `@jigsaw/shared` — Types
- `@jigsaw/ingestion` — Search pipeline (`searchKnowledgeBase`)
- `@modelcontextprotocol/sdk@^1.30.0` — MCP protocol
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

## Common Tasks

- Add a new tool: define Zod schema in `tools/search.ts`, implement handler in `tools/query.ts`, register in `server.setRequestHandler()`
- Test locally: run `npx jigsaw-mcp` and connect via MCP inspector
