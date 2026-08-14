import { Router } from "express";
import { db, crawlJobs, sources } from "@jigsaw/db";
import { scheduleCrawl } from "@jigsaw/crawler";
import { eq } from "drizzle-orm";

export const jobsRouter = Router();

jobsRouter.get("/", async (_req, res) => {
  try {
    const jobs = await db.select().from(crawlJobs);
    res.json({ jobs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

jobsRouter.post("/crawl/:sourceId", async (req, res) => {
  try {
    const { sourceId } = req.params;
    const [source] = await db
      .select()
      .from(sources)
      .where(eq(sources.id, sourceId))
      .limit(1);

    if (!source) {
      res.status(404).json({ error: "Source not found" });
      return;
    }

    const [job] = await db
      .insert(crawlJobs)
      .values({ sourceId, status: "queued" })
      .returning();

    await scheduleCrawl(source.id, source.url, job.id);

    res.status(201).json({ job });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

jobsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [job] = await db
      .select()
      .from(crawlJobs)
      .where(eq(crawlJobs.id, id))
      .limit(1);

    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    res.json({ job });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});
