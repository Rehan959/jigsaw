import { Queue, Worker, type Job } from "bullmq";
import { Redis } from "ioredis";
import { scrapeUrl, closeBrowser } from "./scraper.js";
import { db, crawlJobs, sources } from "@jigsaw/db";
import { eq } from "drizzle-orm";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const crawlQueue = new Queue("crawl", { connection });

export function createCrawlWorker(
  processJob: (job: Job) => Promise<void>
): Worker {
  return new Worker(
    "crawl",
    async (job: Job) => {
      const { sourceId, url, crawlJobId } = job.data;

      await db
        .update(crawlJobs)
        .set({ status: "running", startedAt: new Date() })
        .where(eq(crawlJobs.id, crawlJobId));

      try {
        const content = await scrapeUrl({ url });

        await db
          .update(crawlJobs)
          .set({ status: "completed", completedAt: new Date() })
          .where(eq(crawlJobs.id, crawlJobId));

        await db
          .update(sources)
          .set({ lastCrawledAt: new Date() })
          .where(eq(sources.id, sourceId));

        await processJob(job);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        await db
          .update(crawlJobs)
          .set({ status: "failed", error: errorMessage })
          .where(eq(crawlJobs.id, crawlJobId));

        throw error;
      }
    },
    { connection, concurrency: 5 }
  );
}

export async function scheduleCrawl(
  sourceId: string,
  url: string,
  crawlJobId: string
): Promise<Job> {
  return crawlQueue.add(
    "crawl",
    { sourceId, url, crawlJobId },
    { attempts: 3 }
  );
}

export async function shutdown(): Promise<void> {
  await crawlQueue.close();
  await closeBrowser();
  await connection.quit();
}
