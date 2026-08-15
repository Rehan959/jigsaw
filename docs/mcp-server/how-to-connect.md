# How to Connect an AI Assistant to JigSaw

Connect Claude, ChatGPT, or any MCP-compatible AI assistant to search your JigSaw knowledge base.

## Prerequisites

- JigSaw MCP server built (`bun run build` in `packages/mcp-server`)
- OpenAI API key set in `.env`
- Pinecone API key and index set in `.env`
- An AI assistant that supports MCP (Claude Desktop, Cursor, Windsurf, etc.)

## Steps

### 1. Build the MCP server

```bash
cd /path/to/jigsaw
bun run build --filter=@jigsaw/mcp-server
```

### 2. Find the MCP server binary

After building, the binary is at:

```
packages/mcp-server/dist/index.js
```

### 3. Configure your AI assistant

Add the JigSaw server to your MCP client configuration.

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "jigsaw": {
      "command": "node",
      "args": ["/path/to/jigsaw/packages/mcp-server/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-...",
        "PINECONE_API_KEY": "...",
        "PINECONE_INDEX": "jigsaw"
      }
    }
  }
}
```

**Cursor** (`.cursor/mcp.json` in your project):

```json
{
  "mcpServers": {
    "jigsaw": {
      "command": "node",
      "args": ["/path/to/jigsaw/packages/mcp-server/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-...",
        "PINECONE_API_KEY": "...",
        "PINECONE_INDEX": "jigsaw"
      }
    }
  }
}
```

**Windsurf** (`~/.windsurf/mcp.json`):

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

> If env vars are already set in your shell, you can omit the `env` block.

### 4. Restart your AI assistant

MCP servers are loaded when the AI assistant starts. Restart it to pick up the new configuration.

### 5. Verify the connection

Ask the AI:

> What tools do you have available?

You should see `search_knowledge_base` and `list_sources` in the tool list.

### 6. Test a search

Ask the AI:

> Search the knowledge base for "web scraping best practices"

If content has been ingested, you'll get relevant results with source URLs.

## Troubleshooting

### "Server failed to start"

- Check that the path to `dist/index.js` is correct
- Verify Node.js is installed: `node --version`
- Run the server manually to see errors: `node packages/mcp-server/dist/index.js`

### "OPENAI_API_KEY not set"

- Ensure the env var is set in your shell or in the MCP config's `env` block
- Check `.env` in the project root has `OPENAI_API_KEY=sk-...`

### "Pinecone connection failed"

- Verify `PINECONE_API_KEY` is set
- Check that the index name matches (`PINECONE_INDEX` defaults to `jigsaw`)
- Ensure the index exists in your Pinecone dashboard

### Tool not showing up

- Restart the AI assistant after config changes
- Check the MCP server logs (stderr output)
- Verify the config file is valid JSON

## Related

- [API Reference](./reference.md)
- [Architecture explanation](./explanation-architecture.md)
