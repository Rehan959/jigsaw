# JigSaw MCP Server

Model Context Protocol server that lets AI assistants search the JigSaw knowledge base.

## What it does

The MCP server exposes two tools to AI assistants like Claude, ChatGPT, and Cursor:

- **`search_knowledge_base`** — Semantic search across crawled web content. Returns relevant chunks with source URLs and similarity scores.
- **`list_sources`** — List available data sources (stub — DB integration pending).

## Quick start

```bash
# Build
bun run build --filter=@jigsaw/mcp-server

# The binary is at:
# packages/mcp-server/dist/index.js
```

Add to your AI assistant's MCP config:

```json
{
  "mcpServers": {
    "jigsaw": {
      "command": "node",
      "args": ["/path/to/jigsaw/packages/mcp-server/dist/index.js"]
    }
  }
}
```

## Documentation

| Document | Type | Description |
|----------|------|-------------|
| [Tutorial: Getting Started](./tutorial-getting-started.md) | Tutorial | Connect an AI assistant in 5 minutes |
| [How to Connect](./how-to-connect.md) | How-to | Step-by-step MCP client configuration |
| [How to Add Tools](./how-to-add-tools.md) | How-to | Extend with custom tools |
| [API Reference](./reference.md) | Reference | Complete tool schemas, types, and params |
| [Architecture](./explanation-architecture.md) | Explanation | Design decisions and data flow |

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | yes | — | For embedding generation |
| `PINECONE_API_KEY` | yes | — | For vector DB access |
| `PINECONE_INDEX` | no | `jigsaw` | Pinecone index name |

## How it works

```
AI Assistant → MCP Client → stdio → JigSaw MCP Server
  → searchKnowledgeBase(query)
    → OpenAI embedding → Pinecone similarity search
  ← SearchResult[] with content + metadata
```

See [Architecture](./explanation-architecture.md) for the full data flow.
