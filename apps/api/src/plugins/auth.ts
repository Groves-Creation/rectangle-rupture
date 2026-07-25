import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { and, eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  type Database,
  permissions as permissionsTable,
  rolePermissions,
  roles,
  userLocationAccess,
  userRoles,
} from "@lit/database";
import { env } from "../env.js";
import { ApiError } from "../lib/errors.js";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
}

declare module "fastify" {
  interface FastifyInstance {
    /** Preflight handler: rejects the request unless a valid access token is present. */
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /** Preflight handler factory: rejects unless the caller holds this permission. */
    requirePermission: (
      permission: string,
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    currentUser: AccessTokenPayload | null;
  }
}

export const authPlugin = fp(async (app) => {
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.ACCESS_TOKEN_TTL },
  });

  app.decorateRequest("currentUser", null);

  app.decorate("authenticate", async function (request: FastifyRequest) {
    try {
      await request.jwtVerify();
    } catch {
      throw ApiError.unauthenticated("Invalid or expired access token");
    }
    request.currentUser = request.user as AccessTokenPayload;
  });

  app.decorate(
    "requirePermission",
    (permission: string) =>
      async function (request: FastifyRequest) {
        const user = request.currentUser;
        if (!user) throw ApiError.unauthenticated();
        if (!user.permissions.includes(permission)) {
          throw ApiError.forbidden(`Missing required permission: ${permission}`);
        }
      },
  );
});

/**
 * Spec 13 requires BOTH a role check and a location check on every endpoint
 * that touches a store or warehouse. Route handlers must call this with any
 * locationId that arrived from the client — never trust a storeId in a body.
 */
export async function assertLocationAccess(
  db: Database,
  userId: string,
  locationId: string,
): Promise<void> {
  const [row] = await db
    .select({ locationId: userLocationAccess.locationId })
    .from(userLocationAccess)
    .where(
      and(eq(userLocationAccess.userId, userId), eq(userLocationAccess.locationId, locationId)),
    )
    .limit(1);

  if (!row) {
    throw ApiError.forbidden("You do not have access to this location");
  }
}

/** Returns every location the user may act on. */
export async function listAccessibleLocations(db: Database, userId: string) {
  return db
    .select({ locationId: userLocationAccess.locationId })
    .from(userLocationAccess)
    .where(eq(userLocationAccess.userId, userId));
}

/** Loads a user's role codes and flattened permission codes for the JWT claims. */
export async function loadUserAuthorization(
  db: Database,
  userId: string,
): Promise<{ roles: string[]; permissions: string[] }> {
  const roleRows = await db
    .select({ code: roles.code })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(eq(userRoles.userId, userId));

  const permRows = await db
    .select({ code: permissionsTable.code })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
    .innerJoin(permissionsTable, eq(permissionsTable.id, rolePermissions.permissionId))
    .where(eq(userRoles.userId, userId));

  return {
    roles: [...new Set(roleRows.map((r) => r.code))],
    permissions: [...new Set(permRows.map((p) => p.code))],
  };
}
