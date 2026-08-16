import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { processJob } from "./scheduler.js";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

const worker = new Worker(
  "crawls",
  async (job) => {
    await processJob(job.data);
  },
  {
    connection,
    concurrency: 2,
    lockDuration: 60000,
  },
);

worker.on("failed", (job, err) => {
  console.error(`[crawler] Job ${job?.id} failed:`, err.message);
});

worker.on("completed", (job) => {
  console.log(`[crawler] Job ${job.id} completed`);
});

worker.on("ready", () => {
  console.log("[crawler] Worker ready, listening for jobs");
});

process.on("SIGTERM", async () => {
  await worker.close();
  await connection.quit();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await worker.close();
  await connection.quit();
  process.exit(0);
});
