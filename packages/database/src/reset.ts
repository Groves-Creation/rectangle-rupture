import postgres from "postgres";
import { requireDatabaseUrl } from "./env.js";

/**
 * Drops and recreates the public schema. Destructive by design and intended
 * only for local development and CI.
 */
if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to reset the database with NODE_ENV=production");
}

const sql = postgres(requireDatabaseUrl(), { max: 1 });

console.log("Dropping schema public...");
await sql.unsafe("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
console.log("Schema reset. Run `pnpm db:migrate` next.");

await sql.end();
