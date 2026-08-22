import { Router } from "express";
import { db, crawlJobs, sources } from "@jigsaw/db";
import { eq, and } from "drizzle-orm";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const jobsRouter = Router();

jobsRouter.get("/", async (req, res) => {
  try {
    const jobs = await db
      .select()
      .from(crawlJobs)
      .innerJoin(sources, eq(crawlJobs.sourceId, sources.id))
      .where(eq(sources.userId, req.user!.id));
    res.json({ jobs });
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

jobsRouter.post("/crawl/:sourceId", async (req, res) => {
  try {
    const { sourceId } = req.params;
    if (!UUID_REGEX.test(sourceId)) {
      res.status(400).json({ error: "Invalid source ID format", code: "INVALID_ID" });
      return;
    }
    const [source] = await db
      .select()
      .from(sources)
      .where(and(eq(sources.id, sourceId), eq(sources.userId, req.user!.id)))
      .limit(1);

    if (!source) {
      res.status(404).json({ error: "Source not found", code: "NOT_FOUND" });
      return;
    }

    const [job] = await db
      .insert(crawlJobs)
      .values({ sourceId, status: "queued" })
      .returning();

    // TODO: Implement when @jigsaw/crawler package is built
    // await scheduleCrawl(source.id, source.url, job.id);

    res.status(201).json({ job });
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

jobsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      res.status(400).json({ error: "Invalid ID format", code: "INVALID_ID" });
      return;
    }
    const [job] = await db
      .select()
      .from(crawlJobs)
      .innerJoin(sources, eq(crawlJobs.sourceId, sources.id))
      .where(and(eq(crawlJobs.id, id), eq(sources.userId, req.user!.id)))
      .limit(1);

    if (!job) {
      res.status(404).json({ error: "Job not found", code: "NOT_FOUND" });
      return;
    }

    res.json({ job });
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
