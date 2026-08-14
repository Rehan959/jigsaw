# @jigsaw/mcp-server

Model Context Protocol server exposing the JigSaw knowledge base to AI assistants.

## Purpose

Lets AI assistants (Claude, ChatGPT, etc.) connect via MCP and search the knowledge base using structured tools.

## Architecture

- `tools/search.ts` — Zod schemas for search/list tool inputs
- `tools/query.ts` — MCP server setup + tool implementations
- `index.ts` — Entry point (stdio transport)

## MCP Tools

- `search_knowledge_base` — Semantic search across ingested content
- `list_sources` — List available data sources

## Dependencies

- `@jigsaw/shared` — Types
- `@jigsaw/ingestion` — Search pipeline
- `@modelcontextprotocol/sdk` — MCP protocol
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

- Add a new tool: define schema in `tools/search.ts`, implement in `tools/query.ts`
- Test locally: run `npx jigsaw-mcp` and connect via MCP inspector
