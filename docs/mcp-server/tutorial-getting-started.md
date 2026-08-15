# Tutorial: Search the JigSaw Knowledge Base via MCP

Build a working connection between an AI assistant and JigSaw's knowledge base in 5 minutes.

## What you'll build

An MCP server that lets an AI assistant (Claude, ChatGPT, etc.) search web content you've crawled and ingested into JigSaw. The AI can ask questions and get relevant content chunks with source URLs.

## What you'll need

- Node.js 18+ installed
- An OpenAI API key
- A Pinecone account with an index created
- Claude Desktop, Cursor, or another MCP-compatible AI assistant

## Step 1: Set up environment variables

Create a `.env` file in the project root:

```bash
OPENAI_API_KEY=sk-your-key-here
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX=jigsaw
```

## Step 2: Install dependencies

```bash
cd /path/to/jigsaw
bun install
```

## Step 3: Build the MCP server

```bash
bun run build --filter=@jigsaw/mcp-server
```

This compiles TypeScript to `packages/mcp-server/dist/`.

## Step 4: Configure your AI assistant

Add the JigSaw server to your MCP config.

**Claude Desktop** — edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "jigsaw": {
      "command": "node",
      "args": ["/absolute/path/to/jigsaw/packages/mcp-server/dist/index.js"]
    }
  }
}
```

Replace `/absolute/path/to/jigsaw` with your actual project path.

## Step 5: Restart and verify

1. Quit and restart Claude Desktop (or your AI assistant)
2. Start a new conversation
3. Ask: "What tools do you have?"

You should see `search_knowledge_base` listed.

## Step 6: Search the knowledge base

Ask the AI:

> Search the knowledge base for "how to handle authentication errors"

If you've crawled and ingested content, the AI will call `search_knowledge_base` and return relevant chunks with source URLs.

## How it works

When you ask a question:

1. The AI reads the tool description and decides to call `search_knowledge_base`
2. The MCP server receives the call over stdio
3. The server generates an embedding for your query via OpenAI
4. Pinecone finds the most similar content vectors
5. Results flow back: Pinecone → MCP server → AI assistant → you

```
You: "Search for authentication errors"
  ↓
AI: calls search_knowledge_base({ query: "authentication errors" })
  ↓
MCP Server: generates embedding, queries Pinecone
  ↓
Pinecone: returns top 5 similar chunks
  ↓
AI: "Here's what I found in the knowledge base..."
```

## What you built

You now have a working MCP server that exposes JigSaw's knowledge base to AI assistants. Any MCP-compatible AI can search your crawled content using natural language.

**Next steps:**
- [Add more tools](./how-to-add-tools.md) — extend with custom search filters
- [Architecture deep-dive](./explanation-architecture.md) — understand the design
- [API Reference](./reference.md) — full parameter docs
