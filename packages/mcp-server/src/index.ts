#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerJigsawTools } from "./tools/jigsaw.js";

async function main() {
  const server = new McpServer({
    name: "jigsaw",
    version: "0.1.0",
  });

  registerJigsawTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("JigSaw MCP server running on stdio");

  process.on("SIGINT", () => {
    server.close();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
