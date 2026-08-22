import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { searchRouter } from "./routes/search.js";
import { sourcesRouter } from "./routes/sources.js";
import { jobsRouter } from "./routes/jobs.js";
import { authRouter, authProtectedRouter } from "./routes/auth.js";
import { authMiddleware } from "./middleware/auth.js";
import {
  authRateLimit,
  apiRateLimit,
  mcpRateLimit,
} from "./middleware/rateLimit.js";
import { apiKeyMiddleware } from "./middleware/apiKey.js";

const app = express();
const PORT = process.env.API_PORT || 3001;

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use("/api/auth", authRateLimit, authRouter);
app.use("/api/auth", authRateLimit, authMiddleware, authProtectedRouter);

app.use("/api/search", apiRateLimit, apiKeyMiddleware, authMiddleware, searchRouter);
app.use("/api/sources", apiRateLimit, apiKeyMiddleware, authMiddleware, sourcesRouter);
app.use("/api/jobs", apiRateLimit, apiKeyMiddleware, authMiddleware, jobsRouter);

app.use("/api/mcp", mcpRateLimit, apiKeyMiddleware, authMiddleware, (_req, res) => {
  res.status(404).json({ error: "MCP endpoints not yet implemented" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(
      JSON.stringify({
        event: "unhandled_error",
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
        timestamp: new Date().toISOString(),
      })
    );
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
);

app.listen(PORT, () => {
  console.log(`JigSaw API running on port ${PORT}`);
});

export default app;
