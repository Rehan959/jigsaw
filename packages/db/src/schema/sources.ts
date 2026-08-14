import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  crawlFrequency: varchar("crawl_frequency", { length: 50 }),
  lastCrawledAt: timestamp("last_crawled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
