import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { resolve } from "node:path";

// drizzle-kit bundles this file, so import.meta.dirname is unavailable here.
// The CLI always runs with the package directory as cwd.
config({ path: resolve(process.cwd(), "../../.env") });

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
