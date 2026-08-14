import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
} from "drizzle-orm/pg-core";
import { sources } from "./sources.js";

export const crawlJobs = pgTable("crawl_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceId: uuid("source_id")
    .notNull()
    .references(() => sources.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 })
    .notNull()
    .default("queued"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CrawlJob = typeof crawlJobs.$inferSelect;
export type NewCrawlJob = typeof crawlJobs.$inferInsert;
