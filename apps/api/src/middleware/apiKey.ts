import { Request, Response, NextFunction } from "express";
import { db, apiKeys } from "@jigsaw/db";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      apiKeyUserId?: string;
    }
  }
}

function sanitizeLogString(input: string): string {
  return input.replace(/[\r\n\t]/g, "_").slice(0, 100);
}

export async function apiKeyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const apiKey = req.headers["x-api-key"] as string | undefined;

  if (!apiKey) {
    next();
    return;
  }

  try {
    const keyHash = await hashApiKey(apiKey);

    const [apiKeyRecord] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, keyHash))
      .limit(1);

    if (!apiKeyRecord) {
      res.status(401).json({
        error: "Invalid API key",
        code: "INVALID_API_KEY",
      });
      return;
    }

    req.apiKeyUserId = apiKeyRecord.userId;

    db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKeyRecord.id))
      .then(() => {
        console.log(
          JSON.stringify({
            event: "api_key_used",
            keyName: sanitizeLogString(apiKeyRecord.name),
            userId: apiKeyRecord.userId,
            timestamp: new Date().toISOString(),
          })
        );
      })
      .catch((error) => {
        console.error("Failed to update API key usage:", error);
      });

    next();
  } catch (error) {
    console.error("API key validation error:", error);
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
}

async function hashApiKey(key: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(key).digest("hex");
}
