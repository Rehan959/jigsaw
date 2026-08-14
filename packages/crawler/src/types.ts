import type { ScrapedContent } from "@jigsaw/shared";

export interface ScrapeOptions {
  url: string;
  timeout?: number;
  waitForSelector?: string;
  javascriptEnabled?: boolean;
}

export interface CrawlerConfig {
  maxConcurrency: number;
  defaultTimeout: number;
  userAgent: string;
  respectRobotsTxt: boolean;
}

export const DEFAULT_CRAWLER_CONFIG: CrawlerConfig = {
  maxConcurrency: 5,
  defaultTimeout: 30000,
  userAgent:
    "JigSaw/1.0 (+https://github.com/jigsaw/jigsaw) Web Crawler",
  respectRobotsTxt: true,
};
