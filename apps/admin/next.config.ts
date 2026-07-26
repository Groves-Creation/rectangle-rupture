import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the monorepo root. Without this, Next walks up and can latch onto an
  // unrelated lockfile in the user's home directory.
  outputFileTracingRoot: path.join(appDir, "..", ".."),
  // The admin dashboard talks to the LIT API over HTTP only. Nothing here is
  // allowed to import `@lit/database` — the API is the single writer.
};

export default nextConfig;
