import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

const connectionString = process.env.DATABASE_URL;

let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (!dbInstance) {
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL environment variable is not set. " +
        "Set it in your .env file or export it in your shell. " +
        "See .env.example for the required format."
      );
    }
    client = postgres(connectionString);
    dbInstance = drizzle(client, { schema });
  }
  return dbInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    const instance = getDb();
    // @ts-expect-error proxy access
    return typeof instance[prop] === "function" ? instance[prop].bind(instance) : instance[prop];
  },
});

export * from "./schema/index.js";
