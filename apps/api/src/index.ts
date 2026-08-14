import express from "express";
import cors from "cors";
import helmet from "helmet";
import { searchRouter } from "./routes/search.js";
import { sourcesRouter } from "./routes/sources.js";
import { jobsRouter } from "./routes/jobs.js";

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/search", searchRouter);
app.use("/api/sources", sourcesRouter);
app.use("/api/jobs", jobsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`JigSaw API running on port ${PORT}`);
});

export default app;
