import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/server";
import { logToolCall, generateRequestId } from "./logger.js";

const inputSchema = z.object({
  url: z
    .string()
    .max(2048)
    .describe("The website URL to track and crawl."),
  name: z
    .string()
    .optional()
    .describe(
      "Optional. A friendly name for this source. Defaults to the domain name.",
    ),
}) as any;

type AddSourceArgs = { url: string; name?: string };

export function registerAddSourceTool(server: McpServer): void {
  server.registerTool(
    "add_source",
    {
      description:
        "Add a new website URL to track in JigSaw. Creates a source entry in the database that can be crawled and indexed for semantic search.",
      inputSchema,
    },
    async ({ url, name }: AddSourceArgs) => {
      const requestId = generateRequestId();
      const startTime = Date.now();
      console.error(
        `[jigsaw] add_source: url="${url}" request_id=${requestId}`,
      );

      try {
        const { db, sources } = await import("@jigsaw/db");
        const defaultUserId = "00000000-0000-0000-0000-000000000001";
        const displayName =
          name || new URL(url).hostname.replace("www.", "");

        const result = await db
          .insert(sources)
          .values({
            userId: defaultUserId,
            url,
            name: displayName,
          })
          .returning({
            id: sources.id,
            url: sources.url,
            name: sources.name,
            createdAt: sources.createdAt,
          });

        const source = result[0];

        logToolCall("add_source", { url }, startTime);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  status: "success",
                  source: {
                    id: source.id,
                    url: source.url,
                    name: source.name,
                    createdAt: source.createdAt.toISOString(),
                  },
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        logToolCall("add_source", { url }, startTime, undefined, true);
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            {
              type: "text" as const,
              text: `Error adding source: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
