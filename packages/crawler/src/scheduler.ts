import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { db, crawlJobs, sources } from "@jigsaw/db";
import { eq } from "drizzle-orm";
import { scrapePage, closeBrowser } from "./scraper.js";
import { cleanHtml } from "./cleaner.js";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

let connection: Redis | null = null;
let queue: Queue | null = null;

function getConnection(): Redis {
  if (!connection) {
    connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
  }
  return connection;
}

function getQueue(): Queue {
  if (!queue) {
    queue = new Queue("crawls", { connection: getConnection() });
  }
  return queue;
}

export async function scheduleCrawl(
  sourceId: string,
  url: string,
  jobId: string,
): Promise<void> {
  const q = getQueue();
  await q.add(
    "crawl",
    { sourceId, url, jobId },
    {
      jobId,
      attempts: 2,
      backoff: { type: "exponential", delay: 5000 },
    },
  );
}

export async function processJob(data: {
  sourceId: string;
  url: string;
  jobId: string;
}): Promise<void> {
  const { sourceId, url, jobId } = data;

  await db
    .update(crawlJobs)
    .set({ status: "running", startedAt: new Date() })
    .where(eq(crawlJobs.id, jobId));

  try {
    const scraped = await scrapePage(url);
    const cleaned = cleanHtml(scraped.html);
    const content = cleaned || scraped.content;

    await db
      .update(crawlJobs)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(crawlJobs.id, jobId));

    await db
      .update(sources)
      .set({ lastCrawledAt: new Date() })
      .where(eq(sources.id, sourceId));

    await closeBrowser();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await db
      .update(crawlJobs)
      .set({ status: "failed", error: message, completedAt: new Date() })
      .where(eq(crawlJobs.id, jobId));
  }
}
