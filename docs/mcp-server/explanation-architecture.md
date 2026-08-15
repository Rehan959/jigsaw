# MCP Server — Architecture & Design

Why the JigSaw MCP server is built the way it is.

## What is MCP?

The Model Context Protocol (MCP) is a standard for AI assistants to connect to external tools and data. Instead of each AI building custom integrations, MCP defines a single protocol:

```
AI Assistant (Claude, ChatGPT, etc.)
    ↓ MCP protocol
MCP Client (built into the AI host)
    ↓ stdio / HTTP
MCP Server (your code)
    ↓
External tools, databases, APIs
```

The AI calls tools by name. The server executes them and returns results. The AI never sees your implementation — only the tool schema and response.

## Why stdio transport?

MCP supports two transports:

| Transport | Use case | Trade-off |
|-----------|----------|-----------|
| **stdio** | Local, process-spawned | Simplest setup. No HTTP server. Client manages process lifecycle. |
| **Streamable HTTP** | Remote, multi-client | Requires HTTP server, CORS, auth. Better for shared deployments. |

JigSaw uses stdio because:

1. **Single-user local dev** — the MCP server runs alongside the AI assistant on the same machine
2. **No network config** — no ports, no CORS, no TLS certificates
3. **Process isolation** — each AI session gets its own server instance
4. **Simplicity** — the server reads from stdin, writes to stdout, done

When JigSaw needs multi-user or remote access, the HTTP transport can be added without changing tool implementations.

## Tool design pattern

Each MCP tool follows a three-layer pattern:

```
tools/search.ts     →  Zod schema (input validation)
tools/query.ts      →  Tool implementation (business logic)
@jigsaw/ingestion   →  Core pipeline (Pinecone, OpenAI)
```

This separation means:

- **Schemas are reusable** — the web API can reuse the same Zod schemas
- **Tool logic is thin** — just validation, delegation, and error formatting
- **Pipeline is independent** — can be tested without MCP

### Error handling

Tools catch errors and return them as `isError: true` responses instead of throwing. This is MCP's convention — the AI sees the error text and can decide what to do (retry, rephrase, give up).

```typescript
try {
  const results = await searchKnowledgeBase({ query, limit });
  return { content: [{ type: "text", text: JSON.stringify(results) }] };
} catch (error) {
  return {
    content: [{ type: "text", text: `Error: ${error.message}` }],
    isError: true,
  };
}
```

The AI gets a readable error message. The server stays healthy.

## Semantic search pipeline

When the AI calls `search_knowledge_base`, this is what happens:

```
1. Input validation (Zod)
       ↓
2. Generate embedding for query
   OpenAI text-embedding-3-small → 1536-dim vector
       ↓
3. Query Pinecone
   Vector similarity search (cosine distance)
   Optional: filter by sourceId, threshold
       ↓
4. Format results
   Match[] → SearchResult[] with content + metadata
       ↓
5. Return to AI
   JSON serialized as MCP text content
```

### Why embeddings?

Traditional keyword search misses meaning. "How to deploy a web app" won't match "deploying applications to production." Embeddings capture semantic meaning — both queries map to similar vectors, so the right content surfaces.

The `text-embedding-3-small` model produces 1536-dimensional vectors. Pinecone stores them and finds the nearest neighbors to any query vector.

### Why chunking?

Web pages are too long to embed as a single vector. The ingestion pipeline splits content into ~1000-character chunks with 200-character overlap (see `@jigsaw/ingestion`). Each chunk becomes a separate vector in Pinecone. Search returns the most relevant chunks, not entire pages.

The overlap ensures context isn't lost at chunk boundaries.

## Data flow

```
                    ┌─────────────────┐
                    │  Web Crawler     │
                    │  (Playwright)    │
                    └────────┬────────┘
                             │ ScrapedContent
                             ▼
                    ┌─────────────────┐
                    │  Ingestion      │
                    │  Pipeline       │
                    │  chunkText()    │
                    │  generateEmbed()│
                    │  upsertChunks() │
                    └────────┬────────┘
                             │ Chunks + Vectors
                             ▼
                    ┌─────────────────┐
                    │  Pinecone       │
                    │  (Vector DB)    │
                    └────────┬────────┘
                             │ Query results
                             ▼
                    ┌─────────────────┐
                    │  MCP Server     │
                    │  search_knowledge_base()
                    └────────┬────────┘
                             │ SearchResult[]
                             ▼
                    ┌─────────────────┐
                    │  AI Assistant   │
                    │  (Claude, etc.) │
                    └─────────────────┘
```

## Design decisions

### Dynamic import of embedder

In `pipeline.ts`, the embedder is imported dynamically:

```typescript
const { generateEmbedding } = await import("./embedder.js");
```

This defers the OpenAI client initialization until a search is actually performed. If the server starts without `OPENAI_API_KEY` set, it won't crash on import — only when someone tries to search.

### Zod schemas over manual validation

Tool inputs are validated with Zod, not manual `if` checks. Benefits:

- **Declarative** — schemas describe what's valid, not how to check
- **Error messages** — Zod produces human-readable validation errors
- **Type inference** — `z.infer<typeof schema>` gives TypeScript types for free
- **MCP integration** — the SDK accepts Zod schemas directly for tool definitions

### JSON response format

Search results are returned as pretty-printed JSON in a text content block. This is because:

- MCP text content is the most universal format (works with all AI models)
- JSON preserves the full structure (score, metadata, content)
- Pretty-printing makes it readable if the AI displays it to the user

## Future: platform capabilities

The MCP server can expose more than tools:

| Capability | What it does | JigSaw use case |
|-----------|--------------|-----------------|
| **Resources** | Read-only data exposure | List all crawled URLs, show ingestion stats |
| **Prompts** | Reusable AI templates | "Summarize this source", "Compare two pages" |
| **Sampling** | Server requests AI completions | Auto-summarize search results |
| **Tasks** | Long-running operations | "Crawl this URL and notify when done" |

These are defined in the MCP SDK and can be added to the existing server without changing the transport or tool architecture.

## Related

- [API Reference](./reference.md)
- [How to connect an AI assistant](./how-to-connect.md)
- [How to add new tools](./how-to-add-tools.md)
