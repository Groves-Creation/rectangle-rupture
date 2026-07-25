import { hash, verify } from "@node-rs/argon2";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, inArray, isNull } from "drizzle-orm";
import {
  type Database,
  locations,
  sessions,
  userDevices,
  userLocationAccess,
  users,
} from "@lit/database";
import { ApiError } from "../../lib/errors.js";
import { loadUserAuthorization } from "../../plugins/auth.js";
import { env } from "../../env.js";

/** OWASP baseline for Argon2id (spec 15). */
export const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(plain: string) {
  return hash(plain, ARGON2_OPTIONS);
}

export function verifyPassword(hashed: string, plain: string) {
  return verify(hashed, plain, ARGON2_OPTIONS);
}

/**
 * Refresh tokens are opaque random strings. Only their SHA-256 hash is stored,
 * so a database leak does not hand out live sessions.
 */
function generateRefreshToken() {
  const token = randomBytes(48).toString("base64url");
  return { token, tokenHash: createHash("sha256").update(token).digest("hex") };
}

function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function accessibleStores(db: Database, userId: string) {
  return db
    .select({
      id: locations.id,
      code: locations.code,
      name: locations.name,
      type: locations.type,
    })
    .from(userLocationAccess)
    .innerJoin(locations, eq(locations.id, userLocationAccess.locationId))
    .where(and(eq(userLocationAccess.userId, userId), eq(locations.type, "store")));
}

export interface IssueSessionResult {
  refreshToken: string;
  sessionId: string;
}

async function issueSession(
  db: Database,
  userId: string,
  deviceId: string | null,
  meta: { ipAddress?: string; userAgent?: string },
): Promise<IssueSessionResult> {
  const { token, tokenHash } = generateRefreshToken();
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      deviceId,
      tokenHash,
      expiresAt,
      ipAddress: meta.ipAddress ?? null,
      userAgent: meta.userAgent ?? null,
    })
    .returning();

  return { refreshToken: token, sessionId: session!.id };
}

export async function login(
  db: Database,
  input: { email: string; password: string; deviceIdentifier?: string },
  meta: { ipAddress?: string; userAgent?: string },
) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  // Always run a verification so a missing account and a wrong password take
  // comparable time. Prevents trivial account enumeration by timing.
  const storedHash =
    user?.passwordHash ??
    "$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHRzb21lc2FsdA$0000000000000000000000000000000000000000000";

  let passwordValid = false;
  try {
    passwordValid = await verifyPassword(storedHash, input.password);
  } catch {
    passwordValid = false;
  }

  if (!user || !passwordValid) {
    throw ApiError.unauthenticated("Invalid email or password");
  }
  if (!user.isActive) {
    throw ApiError.forbidden("This account is disabled");
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw ApiError.forbidden("This account is temporarily locked");
  }

  let deviceId: string | null = null;
  if (input.deviceIdentifier) {
    const [device] = await db
      .insert(userDevices)
      .values({
        userId: user.id,
        deviceIdentifier: input.deviceIdentifier,
        platform: "android",
        lastSeenAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userDevices.userId, userDevices.deviceIdentifier],
        set: { lastSeenAt: new Date(), revokedAt: null },
      })
      .returning();
    deviceId = device?.id ?? null;
  }

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  const { refreshToken } = await issueSession(db, user.id, deviceId, meta);
  const authz = await loadUserAuthorization(db, user.id);
  const stores = await accessibleStores(db, user.id);

  return { user, authz, stores, refreshToken };
}

/**
 * Rotates a refresh token.
 *
 * Reuse detection: a token that has already been consumed means either the
 * client replayed it or it was stolen. Either way the safe response is to
 * revoke the entire session family and force a fresh login.
 */
export async function rotateRefreshToken(
  db: Database,
  presentedToken: string,
  meta: { ipAddress?: string; userAgent?: string },
) {
  const presentedHash = hashRefreshToken(presentedToken);

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.tokenHash, presentedHash))
    .limit(1);

  if (!session) {
    throw ApiError.unauthenticated("Invalid refresh token");
  }

  if (session.consumedAt || session.revokedAt) {
    // Reuse or replay of a dead token: burn every live session for this user.
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.userId, session.userId), isNull(sessions.revokedAt)));

    throw ApiError.unauthenticated(
      "Refresh token has already been used; all sessions have been revoked",
    );
  }

  if (session.expiresAt <= new Date()) {
    throw ApiError.unauthenticated("Refresh token has expired");
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user || !user.isActive) {
    throw ApiError.unauthenticated("Account is no longer active");
  }

  await db
    .update(sessions)
    .set({ consumedAt: new Date() })
    .where(eq(sessions.id, session.id));

  const { refreshToken } = await issueSession(db, user.id, session.deviceId, meta);
  const authz = await loadUserAuthorization(db, user.id);
  const stores = await accessibleStores(db, user.id);

  return { user, authz, stores, refreshToken };
}

export async function logout(db: Database, presentedToken: string) {
  const presentedHash = hashRefreshToken(presentedToken);
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(eq(sessions.tokenHash, presentedHash));
}

export async function revokeAllSessions(db: Database, userId: string) {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
}

export { accessibleStores };
