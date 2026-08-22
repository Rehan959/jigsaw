import { Router } from "express";
import { db, sources } from "@jigsaw/db";
import { eq, and, sql, SQL } from "drizzle-orm";
import { z } from "zod";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const sourcesRouter = Router();

function validateCrawlUrl(urlString: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlString);

    if (!["http:", "https:"].includes(url.protocol)) {
      return { valid: false, error: "Only HTTP and HTTPS URLs are allowed" };
    }

    const hostname = url.hostname.toLowerCase();

    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "[::1]"
    ) {
      return { valid: false, error: "Localhost URLs are not allowed" };
    }

    if (/^10\./.test(hostname)) {
      return { valid: false, error: "Private network URLs are not allowed" };
    }
    if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname)) {
      return { valid: false, error: "Private network URLs are not allowed" };
    }
    if (/^192\.168\./.test(hostname)) {
      return { valid: false, error: "Private network URLs are not allowed" };
    }
    if (/^169\.254\./.test(hostname)) {
      return { valid: false, error: "Link-local URLs are not allowed" };
    }

    const blockedHosts = [
      "metadata.google.internal",
      "metadata.aws.internal",
      "169.254.169.254",
    ];
    if (blockedHosts.includes(hostname)) {
      return { valid: false, error: "Cloud metadata URLs are not allowed" };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

const createSourceSchema = z.object({
  url: z.string().url().max(2048).refine(
    (url) => validateCrawlUrl(url).valid,
    (url) => ({ message: validateCrawlUrl(url).error || "Invalid URL" })
  ),
  name: z.string().min(1).max(255),
  crawlFrequency: z.string().optional(),
  visibility: z.enum(["public", "private"]).optional(),
});

sourcesRouter.get("/", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;
    const visibility = req.query.visibility as string | undefined;

    const conditions: SQL[] = [eq(sources.userId, userId)];
    if (visibility === "public" || visibility === "private") {
      conditions.push(eq(sources.visibility, visibility));
    }

    const where = and(...conditions);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sources)
      .where(where);

    const allSources = await db
      .select()
      .from(sources)
      .where(where)
      .orderBy(sql`${sources.createdAt} desc`)
      .limit(limit)
      .offset(offset);

    res.json({
      sources: allSources,
      total: countResult?.count ?? 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

sourcesRouter.get("/stats", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const [total] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sources)
      .where(eq(sources.userId, userId));

    const [publicCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sources)
      .where(and(eq(sources.userId, userId), eq(sources.visibility, "public")));

    const [privateCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sources)
      .where(and(eq(sources.userId, userId), eq(sources.visibility, "private")));

    res.json({
      total: total?.count ?? 0,
      public: publicCount?.count ?? 0,
      private: privateCount?.count ?? 0,
    });
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

sourcesRouter.get("/recent", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const limit = Math.min(Number(req.query.limit) || 5, 20);

    const recent = await db
      .select()
      .from(sources)
      .where(eq(sources.userId, userId))
      .orderBy(sql`${sources.createdAt} desc`)
      .limit(limit);

    res.json({ sources: recent });
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

sourcesRouter.post("/", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const body = createSourceSchema.parse(req.body);
    const [source] = await db
      .insert(sources)
      .values({
        userId,
        url: body.url,
        name: body.name,
        crawlFrequency: body.crawlFrequency,
        visibility: body.visibility || "private",
      })
      .returning();
    res.status(201).json({ source });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request", details: error.errors });
      return;
    }
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const updateSourceSchema = z.object({
  visibility: z.enum(["public", "private"]).optional(),
  name: z.string().min(1).max(255).optional(),
});

sourcesRouter.patch("/:id", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      res.status(400).json({ error: "Invalid ID format", code: "INVALID_ID" });
      return;
    }
    const body = updateSourceSchema.parse(req.body);

    const updates: Record<string, unknown> = {};
    if (body.visibility) updates.visibility = body.visibility;
    if (body.name) updates.name = body.name;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    const [updated] = await db
      .update(sources)
      .set(updates)
      .where(and(eq(sources.id, id), eq(sources.userId, userId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Source not found" });
      return;
    }

    res.json({ source: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request", details: error.errors });
      return;
    }
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

sourcesRouter.delete("/:id", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      res.status(400).json({ error: "Invalid ID format", code: "INVALID_ID" });
      return;
    }
    await db
      .delete(sources)
      .where(and(eq(sources.id, id), eq(sources.userId, userId)));
    res.status(204).send();
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
