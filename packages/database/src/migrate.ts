import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { resolve } from "node:path";
import { requireDatabaseUrl } from "./env.js";

const url = requireDatabaseUrl();
const sql = postgres(url, { max: 1 });
const db = drizzle(sql);

console.log("Running migrations...");
await migrate(db, { migrationsFolder: resolve(import.meta.dirname, "../migrations") });
console.log("Migrations complete.");

await sql.end();
