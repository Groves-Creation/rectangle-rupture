import fp from "fastify-plugin";
import { createDatabase, type Database } from "@lit/database";
import { env } from "../env.js";

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
  }
}

export const databasePlugin = fp(async (app) => {
  const db = createDatabase(env.DATABASE_URL);
  app.decorate("db", db);
});
