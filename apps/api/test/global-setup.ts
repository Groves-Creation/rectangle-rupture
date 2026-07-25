import { resolve } from "node:path";
import postgres from "postgres";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { createDatabase, seedDatabase } from "@lit/database";

config({ path: resolve(process.cwd(), "../../.env") });

const ADMIN_URL = process.env.DATABASE_URL!;
const TEST_DB = "lit_distribution_test";
const TEST_URL = ADMIN_URL.replace(/\/([^/?]+)(\?|$)/, `/${TEST_DB}$2`);

/**
 * Every run starts from an identical, freshly migrated and seeded database.
 * Migrations and seeding are invoked in-process rather than as subprocesses:
 * Node 24 refuses to spawn .cmd shims, which makes the subprocess approach
 * fail on Windows.
 */
export async function setup() {
  const admin = postgres(ADMIN_URL, { max: 1 });
  try {
    await admin.unsafe(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity
       WHERE datname = '${TEST_DB}' AND pid <> pg_backend_pid()`,
    );
    await admin.unsafe(`DROP DATABASE IF EXISTS ${TEST_DB}`);
    await admin.unsafe(`CREATE DATABASE ${TEST_DB}`);
  } finally {
    await admin.end();
  }

  const migrationClient = postgres(TEST_URL, { max: 1 });
  try {
    await migrate(drizzle(migrationClient), {
      migrationsFolder: resolve(process.cwd(), "../../packages/database/migrations"),
    });
  } finally {
    await migrationClient.end();
  }

  const db = createDatabase(TEST_URL, { max: 1 });
  try {
    await seedDatabase(db, { quiet: true });
  } finally {
    // Leaving this open keeps Vite's server alive after the run finishes.
    await db.$client.end();
  }
}

export async function teardown() {
  // The test database is left in place so a failing run can be inspected
  // with: docker compose exec postgres psql -U lit -d lit_distribution_test
}
