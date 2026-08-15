import { McpServer } from "@modelcontextprotocol/server";
import { registerSearchTool } from "./tools/search.js";
import { registerListSourcesTool } from "./tools/list-sources.js";
import { registerAddSourceTool } from "./tools/add-source.js";
import { registerCrawlStatusTool } from "./tools/crawl-status.js";

export function createJigsawServer(): McpServer {
  const server = new McpServer({
    name: "jigsaw",
    version: "0.1.0",
  });

  registerSearchTool(server);
  registerListSourcesTool(server);
  registerAddSourceTool(server);
  registerCrawlStatusTool(server);

  return server;
}
