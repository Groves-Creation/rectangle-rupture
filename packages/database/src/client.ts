import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

export type Database = ReturnType<typeof createDatabase>;

/** A transaction handle. Every ledger write requires one of these. */
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export function createDatabase(connectionString: string, options?: { max?: number }) {
  const sql = postgres(connectionString, {
    max: options?.max ?? 10,
    // Drizzle handles its own type parsing; keep numerics as strings so money
    // never round-trips through a float.
    types: {},
  });
  return drizzle(sql, { schema, casing: "snake_case" });
}

export function createRawClient(connectionString: string) {
  return postgres(connectionString, { max: 1 });
}

export { schema };
