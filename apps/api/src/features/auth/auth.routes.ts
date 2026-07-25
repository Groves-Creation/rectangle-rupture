import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  AuthResponseSchema,
  ErrorResponseSchema,
  LoginRequestSchema,
  MeResponseSchema,
  RefreshRequestSchema,
} from "@lit/api-contracts";
import { eq } from "drizzle-orm";
import { users } from "@lit/database";
import { accessibleStores, login, logout, rotateRefreshToken } from "./auth.service.js";
import { loadUserAuthorization } from "../../plugins/auth.js";
import { writeAuditLog } from "../../lib/audit.js";
import { ApiError } from "../../lib/errors.js";
import { env } from "../../env.js";

function accessTokenTtlSeconds(): number {
  const match = /^(\d+)([smhd])$/.exec(env.ACCESS_TOKEN_TTL);
  if (!match) return 900;
  const value = Number(match[1]);
  const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[match[2]!]!;
  return value * multiplier;
}

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/login",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      schema: {
        tags: ["auth"],
        body: LoginRequestSchema,
        response: { 200: AuthResponseSchema, 401: ErrorResponseSchema },
      },
    },
    async (request) => {
      const { user, authz, stores, refreshToken } = await login(
        app.db,
        request.body,
        { ipAddress: request.ip, userAgent: request.headers["user-agent"] },
      );

      const accessToken = app.jwt.sign({
        sub: user.id,
        email: user.email,
        roles: authz.roles,
        permissions: authz.permissions,
      });

      await writeAuditLog(app.db, {
        userId: user.id,
        action: "auth.login",
        entityType: "user",
        entityId: user.id,
        ipAddress: request.ip,
      });

      return {
        accessToken,
        refreshToken,
        expiresIn: accessTokenTtlSeconds(),
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          roles: authz.roles,
        },
        stores,
      };
    },
  );

  app.post(
    "/refresh",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        tags: ["auth"],
        body: RefreshRequestSchema,
        response: { 200: AuthResponseSchema, 401: ErrorResponseSchema },
      },
    },
    async (request) => {
      const { user, authz, stores, refreshToken } = await rotateRefreshToken(
        app.db,
        request.body.refreshToken,
        { ipAddress: request.ip, userAgent: request.headers["user-agent"] },
      );

      const accessToken = app.jwt.sign({
        sub: user.id,
        email: user.email,
        roles: authz.roles,
        permissions: authz.permissions,
      });

      return {
        accessToken,
        refreshToken,
        expiresIn: accessTokenTtlSeconds(),
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          roles: authz.roles,
        },
        stores,
      };
    },
  );

  app.post(
    "/logout",
    {
      schema: {
        tags: ["auth"],
        body: RefreshRequestSchema,
        response: { 204: z.null() },
      },
    },
    async (request, reply) => {
      await logout(app.db, request.body.refreshToken);
      return reply.status(204).send(null);
    },
  );

  app.get(
    "/me",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["auth"],
        response: { 200: MeResponseSchema, 401: ErrorResponseSchema },
      },
    },
    async (request) => {
      const userId = request.currentUser!.sub;
      const [user] = await app.db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) throw ApiError.unauthenticated("Account no longer exists");

      const authz = await loadUserAuthorization(app.db, userId);
      const stores = await accessibleStores(app.db, userId);

      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          roles: authz.roles,
        },
        stores,
      };
    },
  );
};
