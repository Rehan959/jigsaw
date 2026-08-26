import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const wantsSsl =
  process.env.NODE_ENV === "production" ||
  /sslmode=(require|verify-ca|verify-full)/.test(connectionString);

const client = postgres(connectionString, {
  ssl: wantsSsl ? "require" : false,
});
export const db = drizzle(client, { schema });

export * from "./schema/index.js";
