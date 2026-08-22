import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/server";
import { logToolCall, generateRequestId } from "./logger.js";
import { getApiClient, type ApiError } from "../api-client.js";

const inputSchema = z.object({
  sourceId: z
    .string()
    .uuid()
    .optional()
    .describe("Optional. Filter jobs to a specific source by its ID."),
  limit: z
    .number()
    .optional()
    .default(10)
    .describe("Optional. Maximum number of jobs to return. Default: 10."),
}) as any;

type CrawlStatusArgs = { sourceId?: string; limit: number };

type Job = {
  id: string;
  sourceId: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  createdAt: string;
};

type JobsResponse = {
  jobs: Job[];
};

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

export function registerCrawlStatusTool(server: McpServer): void {
  server.registerTool(
    "crawl_status",
    {
      description:
        "Check the status of crawl jobs in JigSaw. Returns recent job statuses with source information. Use this to monitor crawling progress.",
      inputSchema,
    },
    async ({ sourceId, limit }: CrawlStatusArgs) => {
      const requestId = generateRequestId();
      const startTime = Date.now();
      console.error(
        `[jigsaw] crawl_status: sourceId=${sourceId ?? "all"} request_id=${requestId}`,
      );

      try {
        const client = getApiClient();
        const params: Record<string, string> = {};
        if (sourceId) params.sourceId = sourceId;

        const { data } = await client.get<JobsResponse>("/api/jobs", params);

        let jobs = data.jobs;
        if (sourceId) {
          jobs = jobs.filter((j) => j.sourceId === sourceId);
        }
        jobs = jobs.slice(0, limit);

        logToolCall(
          "crawl_status",
          { sourceId, limit },
          startTime,
          jobs.length,
        );

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  jobCount: jobs.length,
                  jobs,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        logToolCall(
          "crawl_status",
          { sourceId, limit },
          startTime,
          undefined,
          true,
        );
        return {
          content: [
            {
              type: "text" as const,
              text: `Error checking crawl status: ${formatApiError(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
