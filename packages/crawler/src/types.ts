import { z } from "zod";

export const CrawlOptionsSchema = z.object({
  url: z.string().url(),
  maxPages: z.number().int().positive().default(1),
  timeout: z.number().int().positive().default(30000),
  userAgent: z.string().optional(),
  viewportWidth: z.number().int().positive().default(1280),
  viewportHeight: z.number().int().positive().default(720),
  waitForSelector: z.string().optional(),
  waitUntil: z.enum(["load", "domcontentloaded", "networkidle"]).default("networkidle"),
});

export type CrawlOptions = z.infer<typeof CrawlOptionsSchema>;

export interface ScrapedPage {
  url: string;
  title: string;
  content: string;
  html: string;
  links: string[];
  crawledAt: Date;
}

export interface CrawlResult {
  pages: ScrapedPage[];
  errors: { url: string; error: string }[];
  duration: number;
}
