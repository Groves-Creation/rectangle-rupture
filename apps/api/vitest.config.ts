import { defineConfig } from "vitest/config";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), "../../.env") });

/**
 * Tests run against a dedicated database so a test run never destroys the data
 * you are demoing on the phone.
 */
const TEST_DATABASE_URL = (process.env.DATABASE_URL ?? "").replace(
  /\/([^/?]+)(\?|$)/,
  "/lit_distribution_test$2",
);

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    globalSetup: ["./test/global-setup.ts"],
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      NODE_ENV: "test",
    },
    // The ledger tests deliberately contend on the same rows; running files in
    // parallel would produce misleading lock timeouts.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
