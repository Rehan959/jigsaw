import { Router } from "express";
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
    // TODO: Implement when @jigsaw/ingestion package is built
    res.status(501).json({
      error: "Search not yet implemented — ingestion package missing",
      code: "NOT_IMPLEMENTED",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request", details: error.errors });
      return;
    }
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
