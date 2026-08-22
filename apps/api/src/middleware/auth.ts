import { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";
import { db, users } from "@jigsaw/db";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.API_SECRET;
if (!JWT_SECRET) {
  throw new Error("API_SECRET environment variable is required");
}

const API_KEY = process.env.JIGSAW_API_KEY;

function safeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function authenticateWithApiKey(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const apiKey = Array.isArray(req.headers["x-api-key"])
    ? req.headers["x-api-key"][0]
    : req.headers["x-api-key"];

  if (!apiKey || !safeCompare(apiKey, API_KEY || "")) {
    res.status(401).json({
      error: "Invalid or missing API key",
      code: "INVALID_API_KEY",
    });
    return;
  }

  // Use a static API key identity for the legacy JIGSAW_API_KEY flow
  // The newer apiKeyMiddleware sets req.apiKeyUserId with the real user,
  // and authenticateWithJwt handles that path below.
  req.user = { id: "api-key-user", email: "api@jigsaw.local", name: "API" };
  next();
}

function authenticateWithJwt(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({
      error: "Authentication required",
      code: "AUTH_REQUIRED",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET!, { algorithms: ["HS256"] }) as { userId: string };
    req.user = { id: decoded.userId, email: "", name: null };

    db.select({
      id: users.id,
      email: users.email,
      name: users.name,
    })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .then((rows) => {
        if (rows.length === 0) {
          res.status(401).json({
            error: "User not found",
            code: "USER_NOT_FOUND",
          });
          return;
        }
        req.user = rows[0];
        next();
      })
      .catch(() => {
        res.status(500).json({
          error: "Internal server error",
          code: "INTERNAL_ERROR",
        });
      });
  } catch {
    res.status(401).json({
      error: "Invalid token",
      code: "INVALID_TOKEN",
    });
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // If apiKeyMiddleware already resolved a real user ID, look them up
  if (req.apiKeyUserId) {
    db.select({
      id: users.id,
      email: users.email,
      name: users.name,
    })
      .from(users)
      .where(eq(users.id, req.apiKeyUserId!))
      .then((rows) => {
        if (rows.length === 0) {
          res.status(401).json({
            error: "API key user not found",
            code: "USER_NOT_FOUND",
          });
          return;
        }
        req.user = rows[0];
        next();
      })
      .catch(() => {
        res.status(500).json({
          error: "Internal server error",
          code: "INTERNAL_ERROR",
        });
      });
    return;
  }

  // Legacy API key check (JIGSAW_API_KEY env var)
  if (req.headers["x-api-key"]) {
    return authenticateWithApiKey(req, res, next);
  }

  // JWT cookie auth
  return authenticateWithJwt(req, res, next);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET!, { expiresIn: "24h" });
}
