# MCP Server — API Reference

Complete technical reference for the `@jigsaw/mcp-server` package.

## Package

```
@jigsaw/mcp-server
```

Entry point: `src/index.ts` (stdio transport)
Binary: `jigsaw-mcp` (via `dist/index.js`)

## Exports

### `createMcpServer(): McpServer`

Factory function that creates and configures the MCP server with all registered tools.

```typescript
import { createMcpServer } from "@jigsaw/mcp-server";

const server = createMcpServer();
```

The server is created with:
- `name: "jigsaw"`
- `version: "1.0.0"`

## MCP Tools

### `search_knowledge_base`

Semantic search across the JigSaw knowledge base. Returns content chunks ranked by vector similarity.

**Parameters (Zod schema):**

| Parameter    | Type     | Required | Default | Description |
|-------------|----------|----------|---------|-------------|
| `query`     | `string` | yes      | —       | Natural language search query |
| `sourceId`  | `string` | no       | —       | Filter results to a specific source UUID |
| `limit`     | `number` | no       | `5`     | Maximum results to return (1-100) |
| `threshold` | `number` | no       | —       | Minimum similarity score (0-1) |

**Response format:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "[\n  {\n    \"id\": \"...\",\n    \"score\": 0.85,\n    \"content\": \"...\",\n    \"metadata\": {\n      \"sourceId\": \"...\",\n      \"url\": \"...\",\n      \"title\": \"...\",\n      \"chunkIndex\": 0,\n      \"totalChunks\": 5\n    }\n  }\n]"
    }
  ]
}
```

**Error response:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error searching knowledge base: <message>"
    }
  ],
  "isError": true
}
```

**Internal flow:**

1. Validates input against `SearchToolSchema` (Zod)
2. Calls `searchKnowledgeBase()` from `@jigsaw/ingestion`
3. Generates embedding for query via OpenAI `text-embedding-3-small`
4. Queries Pinecone index with vector similarity search
5. Filters by `threshold` if provided
6. Returns `SearchResult[]` serialized as JSON

### `list_sources`

Lists available data sources in the knowledge base.

**Parameters (Zod schema):**

| Parameter | Type     | Required | Default | Description |
|----------|----------|----------|---------|-------------|
| `limit`  | `number` | no       | `10`    | Maximum sources to return |

**Response format:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "List sources tool called with limit: 10. Implementation pending DB integration."
    }
  ]
}
```

> **Note:** This tool is currently a stub. Full implementation requires DB integration via `@jigsaw/db`.

## Transports

### StdioServerTransport

The server uses `StdioServerTransport` from `@modelcontextprotocol/sdk/server/stdio.js`. Communication happens over stdin/stdout — no HTTP server needed.

```
AI Assistant ←→ MCP Client ←→ stdio ←→ JigSaw MCP Server
```

## Types

### `SearchQuery` (from `@jigsaw/shared`)

```typescript
interface SearchQuery {
  query: string;
  sourceId?: string;
  limit?: number;
  threshold?: number;
}
```

### `SearchResult` (from `@jigsaw/shared`)

```typescript
interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: ChunkMetadata;
}
```

### `ChunkMetadata` (from `@jigsaw/shared`)

```typescript
interface ChunkMetadata {
  sourceId: string;
  url: string;
  title: string;
  chunkIndex: number;
  totalChunks: number;
}
```

## Environment Variables

| Variable          | Required | Default | Description |
|------------------|----------|---------|-------------|
| `OPENAI_API_KEY` | yes      | —       | OpenAI API key for embedding generation |
| `PINECONE_API_KEY` | yes    | —       | Pinecone API key for vector DB |
| `PINECONE_INDEX` | no       | `jigsaw` | Pinecone index name |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@jigsaw/shared` | Shared types (`SearchQuery`, `SearchResult`, `ChunkMetadata`) |
| `@jigsaw/ingestion` | Search pipeline (`searchKnowledgeBase()`) |
| `@modelcontextprotocol/sdk` | MCP protocol implementation |
| `zod` | Input validation schemas |

## Source Files

```
packages/mcp-server/
├── src/
│   ├── index.ts          # Entry point — creates server, connects stdio transport
│   └── tools/
│       ├── search.ts     # Zod schemas for tool inputs
│       └── query.ts      # MCP server setup + tool implementations
├── package.json
└── tsconfig.json
```

## Related

- [How to connect an AI assistant](./how-to-connect.md)
- [How to add new tools](./how-to-add-tools.md)
- [Architecture explanation](./explanation-architecture.md)
