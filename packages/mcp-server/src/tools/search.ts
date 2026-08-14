import { z } from "zod";

export const SearchToolSchema = z.object({
  query: z.string().describe("The search query to find relevant content"),
  sourceId: z
    .string()
    .optional()
    .describe("Optional: filter results to a specific source"),
  limit: z
    .number()
    .optional()
    .default(5)
    .describe("Maximum number of results to return (default: 5)"),
  threshold: z
    .number()
    .optional()
    .describe("Minimum similarity score (0-1)"),
});

export type SearchToolInput = z.infer<typeof SearchToolSchema>;

export const ListSourcesToolSchema = z.object({
  limit: z.number().optional().default(10).describe("Max sources to list"),
});

export type ListSourcesToolInput = z.infer<typeof ListSourcesToolSchema>;
