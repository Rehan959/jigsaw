import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/server";
import { logToolCall, generateRequestId } from "./logger.js";
import { getApiClient, type ApiError } from "../api-client.js";

function validateCrawlUrl(urlString: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlString);

    if (!["http:", "https:"].includes(url.protocol)) {
      return { valid: false, error: "Only HTTP and HTTPS URLs are allowed" };
    }

    const hostname = url.hostname.toLowerCase();

    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "[::1]"
    ) {
      return { valid: false, error: "Localhost URLs are not allowed" };
    }

    if (/^10\./.test(hostname)) {
      return { valid: false, error: "Private network URLs are not allowed" };
    }
    if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname)) {
      return { valid: false, error: "Private network URLs are not allowed" };
    }
    if (/^192\.168\./.test(hostname)) {
      return { valid: false, error: "Private network URLs are not allowed" };
    }
    if (/^169\.254\./.test(hostname)) {
      return { valid: false, error: "Link-local URLs are not allowed" };
    }

    const blockedHosts = [
      "metadata.google.internal",
      "metadata.aws.internal",
      "169.254.169.254",
    ];
    if (blockedHosts.includes(hostname)) {
      return { valid: false, error: "Cloud metadata URLs are not allowed" };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

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

function formatApiError(error: unknown): string {
  if (error && typeof error === "object" && "status" in error) {
    const apiErr = error as ApiError;
    if (apiErr.status === 401) return "Authentication failed. API key is not configured on the server.";
    if (apiErr.status === 403) return "Access denied. Invalid API key.";
    if (apiErr.status === 429) return "Rate limited. Try again later.";
    return `API error (${apiErr.status}): ${apiErr.message}`;
  }
  return error instanceof Error ? error.message : "Unknown error";
}

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

      const urlCheck = validateCrawlUrl(url);
      if (!urlCheck.valid) {
        logToolCall("add_source", { url }, startTime, undefined, true);
        return {
          content: [
            {
              type: "text" as const,
              text: `Invalid URL: ${urlCheck.error}`,
            },
          ],
          isError: true,
        };
      }

      try {
        const client = getApiClient();
        const { data } = await client.post<{ source: { id: string; url: string; name: string; createdAt: string } }>(
          "/api/sources",
          { url, name },
        );

        logToolCall("add_source", { url }, startTime);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  status: "success",
                  source: data.source,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        logToolCall("add_source", { url }, startTime, undefined, true);
        return {
          content: [
            {
              type: "text" as const,
              text: `Error adding source: ${formatApiError(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
