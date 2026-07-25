import type { FastifyInstance } from "fastify";
import { buildServer } from "../src/server.js";

export async function makeApp(): Promise<FastifyInstance> {
  const app = await buildServer();
  await app.ready();
  return app;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  userId: string;
  storeIds: string[];
}

export async function loginAs(
  app: FastifyInstance,
  email: string,
  password = "Password123!",
): Promise<Session> {
  const res = await app.inject({
    method: "POST",
    url: "/api/auth/login",
    payload: { email, password },
  });

  if (res.statusCode !== 200) {
    throw new Error(`login failed for ${email}: ${res.statusCode} ${res.body}`);
  }

  const body = res.json();
  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    userId: body.user.id,
    storeIds: body.stores.map((s: { id: string }) => s.id),
  };
}

export function auth(session: Session) {
  return { authorization: `Bearer ${session.accessToken}` };
}

/** Deterministic idempotency key so a test can deliberately replay a request. */
export function idempotencyKey(name: string) {
  return `test-${name}-${"0".repeat(8)}`;
}
