import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db, users, apiKeys } from "@jigsaw/db";
import { eq, and, sql } from "drizzle-orm";
import { generateToken } from "../middleware/auth.js";
import { createHash } from "node:crypto";

export const authRouter = Router();
export const authProtectedRouter = Router();

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  name: z.string().min(1, "Name is required").max(255).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Failed login attempt tracking (in-memory, resets on server restart)
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function checkAccountLockout(identifier: string): boolean {
  const record = failedAttempts.get(identifier);
  if (!record) return false;
  if (Date.now() - record.lastAttempt > LOCKOUT_DURATION_MS) {
    failedAttempts.delete(identifier);
    return false;
  }
  return record.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailedAttempt(identifier: string): void {
  const record = failedAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
  record.count++;
  record.lastAttempt = Date.now();
  failedAttempts.set(identifier, record);
}

function clearFailedAttempts(identifier: string): void {
  failedAttempts.delete(identifier);
}

// --- Public routes (no auth required) ---

authRouter.post("/register", async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    if (existingUser.length > 0) {
      res.status(409).json({
        error: "Email already registered",
        code: "EMAIL_EXISTS",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(body.password, 12);

    const [newUser] = await db
      .insert(users)
      .values({
        email: body.email,
        passwordHash,
        name: body.name || null,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      });

    const token = generateToken(newUser.id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: error.errors,
      });
      return;
    }
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error", code: "INTERNAL_ERROR" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);

    if (checkAccountLockout(body.email)) {
      res.status(429).json({ 
        error: "Too many failed login attempts. Please try again later.", 
        code: "ACCOUNT_LOCKED" 
      });
      return;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    if (!user) {
      recordFailedAttempt(body.email);
      console.warn(
        JSON.stringify({
          event: "login_failed",
          email: body.email,
          ip: req.ip || req.socket.remoteAddress,
          timestamp: new Date().toISOString(),
        })
      );
      res.status(401).json({
        error: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      });
      return;
    }

    const validPassword = await bcrypt.compare(body.password, user.passwordHash);

    if (!validPassword) {
      recordFailedAttempt(body.email);
      console.warn(
        JSON.stringify({
          event: "login_failed",
          email: body.email,
          ip: req.ip || req.socket.remoteAddress,
          timestamp: new Date().toISOString(),
        })
      );
      res.status(401).json({
        error: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      });
      return;
    }

    clearFailedAttempts(body.email);
    const token = generateToken(user.id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    console.log(
      JSON.stringify({
        event: "login_success",
        userId: user.id,
        ip: req.ip || req.socket.remoteAddress,
        timestamp: new Date().toISOString(),
      })
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: error.errors,
      });
      return;
    }
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error", code: "INTERNAL_ERROR" });
  }
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ message: "Logged out successfully" });
});

// --- Protected routes (authMiddleware applied via index.ts) ---

authProtectedRouter.get("/me", (req, res) => {
  if (!req.user) {
    res.status(401).json({
      error: "Not authenticated",
      code: "NOT_AUTHENTICATED",
    });
    return;
  }

  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    },
  });
});

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
});

authProtectedRouter.post("/profile", async (req, res) => {
  try {
    const body = profileSchema.parse(req.body);
    const [updated] = await db
      .update(users)
      .set({ name: body.name, updatedAt: new Date() })
      .where(eq(users.id, req.user!.id))
      .returning({ id: users.id, email: users.email, name: users.name });

    res.json({ user: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

authProtectedRouter.post("/change-password", async (req, res) => {
  try {
    const body = changePasswordSchema.parse(req.body);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const validPassword = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 12);
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, req.user!.id));

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

authProtectedRouter.delete("/account", async (req, res) => {
  try {
    await db.delete(users).where(eq(users.id, req.user!.id));
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- API Key management ---

async function hashApiKey(key: string): Promise<string> {
  return createHash("sha256").update(key).digest("hex");
}

function generateApiKey(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

authProtectedRouter.get("/api-keys", async (req, res) => {
  try {
    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        lastUsedAt: apiKeys.lastUsedAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, req.user!.id));

    res.json({ keys });
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const createApiKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
});

authProtectedRouter.post("/api-keys", async (req, res) => {
  try {
    const body = createApiKeySchema.parse(req.body);
    const rawKey = generateApiKey();
    const keyHash = await hashApiKey(rawKey);

    const [apiKey] = await db
      .insert(apiKeys)
      .values({
        userId: req.user!.id,
        name: body.name,
        keyHash,
      })
      .returning({ id: apiKeys.id, name: apiKeys.name, createdAt: apiKeys.createdAt });

    res.status(201).json({
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey,
      keyPreview: rawKey.slice(0, 8) + "..." + rawKey.slice(-4),
      createdAt: apiKey.createdAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

authProtectedRouter.delete("/api-keys/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, req.user!.id)));
    res.status(204).send();
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
