import { Router } from "express";
import { searchKnowledgeBase } from "@jigsaw/ingestion";
import { z } from "zod";

export const searchRouter = Router();

const searchSchema = z.object({
  query: z.string().min(1),
  sourceId: z.string().optional(),
  limit: z.number().min(1).max(50).default(10),
  threshold: z.number().min(0).max(1).optional(),
});

searchRouter.post("/", async (req, res) => {
  try {
    const body = searchSchema.parse(req.body);
    const results = await searchKnowledgeBase(body);
    res.json({ results, count: results.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request", details: error.errors });
      return;
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});
