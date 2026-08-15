# How to Add a New MCP Tool

Extend the JigSaw MCP server with custom tools for AI assistants.

## Prerequisites

- Familiarity with the existing tools in `packages/mcp-server/src/tools/`
- Understanding of the MCP SDK v2 (`@modelcontextprotocol/server`) tool interface

## Steps

### 1. Define the input schema

Add a Zod schema to `packages/mcp-server/src/tools/search.ts`:

```typescript
export const MyNewToolSchema = z.object({
  param1: z.string().describe("Description of param1"),
  param2: z.number().optional().default(10).describe("Description of param2"),
});

export type MyNewToolInput = z.infer<typeof MyNewToolSchema>;
```

Rules:
- Use `.describe()` on every field — this is what the AI sees
- Mark optional params with `.optional()` and provide defaults
- Use `z.enum()` for constrained values
- Use `z.boolean()` for flags

### 2. Implement the tool

Add the tool to the appropriate file in `packages/mcp-server/src/tools/`:

```typescript
server.registerTool("my_new_tool", {
  description: "Human-readable description of what this tool does. The AI reads this to decide when to call it.",
  inputSchema: MyNewToolSchema,
}, async ({ param1, param2 }) => {
    try {
      // Your logic here
      const result = await doSomething(param1, param2);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text" as const,
            text: `Error in my_new_tool: ${message}`,
          },
        ],
        isError: true,
      };
    }
  }
);
```

Rules:
- Tool name: `snake_case`, descriptive
- Description: explain what it does AND when to use it (the AI reads this)
- Always wrap in try/catch — return `isError: true` on failure
- Return text content (MCP standard format)
- Use `as const` on `type: "text"` to satisfy TypeScript

### 3. Import the schema

In the tool file where you register it, import your new schema:

```typescript
import { MyNewToolSchema } from "./search.js";
```

### 4. Build and test

```bash
cd packages/mcp-server
bun run build
```

Test manually by running the server and connecting with an MCP client:

```bash
node dist/index.js
```

### 5. Verify with your AI assistant

Restart your AI assistant, then ask it to use the new tool. Check:
- The tool appears in the tool list
- The AI can call it with correct parameters
- Responses are formatted correctly
- Errors are handled gracefully

## Tool design guidelines

### Naming

- Use `snake_case` for tool names
- Be specific: `search_by_tag` not `search`
- Prefix related tools: `source_list`, `source_add`, `source_delete`

### Descriptions

The description is the AI's only guide for when to call your tool. Write it like instructions:

```
Good: "Search the knowledge base by exact URL. Use this when the user provides a specific URL to look up."
Bad: "URL search"
```

### Error messages

Error messages go to the AI, which may show them to the user. Make them actionable:

```
Good: "Source not found: no crawled content for URL 'https://example.com'. Crawl it first with the crawler tool."
Bad: "Error"
```

### Response format

Return structured data as JSON. The AI can parse it and present it to the user:

```typescript
return {
  content: [
    {
      type: "text" as const,
      text: JSON.stringify({
        status: "success",
        count: results.length,
        results: results,
      }, null, 2),
    },
  ],
};
```

## Related

- [API Reference](./reference.md)
- [Architecture explanation](./explanation-architecture.md)
