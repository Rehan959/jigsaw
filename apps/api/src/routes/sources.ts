import { Router } from "express";
import { db, sources } from "@jigsaw/db";
import { DEFAULT_USER_ID } from "@jigsaw/shared";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const sourcesRouter = Router();

const createSourceSchema = z.object({
  url: z.string().url(),
  name: z.string().min(1).max(255),
  crawlFrequency: z.string().optional(),
});

sourcesRouter.get("/", async (_req, res) => {
  try {
    const allSources = await db.select().from(sources);
    res.json({ sources: allSources });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

sourcesRouter.post("/", async (req, res) => {
  try {
    const body = createSourceSchema.parse(req.body);
    const [source] = await db
      .insert(sources)
      .values({
        userId: DEFAULT_USER_ID,
        url: body.url,
        name: body.name,
        crawlFrequency: body.crawlFrequency,
      })
      .returning();
    res.status(201).json({ source });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request", details: error.errors });
      return;
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

sourcesRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(sources).where(eq(sources.id, id));
    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});
