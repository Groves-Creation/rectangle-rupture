import "server-only";

import { cookies } from "next/headers";

import type { AuthResponse, AuthStore, AuthUser } from "@/lib/api/types";

/**
 * Tokens live in httpOnly cookies and are only ever read on the server.
 * Nothing in `src/components` or any `"use client"` module may import this
 * file — that is what keeps the refresh token out of the client bundle.
 */
export const ACCESS_TOKEN_COOKIE = "lit_access_token";
export const REFRESH_TOKEN_COOKIE = "lit_refresh_token";
/** Non-secret identity + store list, cached so every render need not hit /me. */
export const SESSION_COOKIE = "lit_session";

const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days, matches REFRESH_TOKEN_TTL_DAYS
const ACCESS_TOKEN_FALLBACK_MAX_AGE_SECONDS = 15 * 60;

export interface SessionSnapshot {
  user: AuthUser;
  stores: AuthStore[];
}

function baseCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

/**
 * Cookie writes are only legal in a Server Action or Route Handler. During a
 * Server Component render Next throws, and that must not take down an
 * otherwise successful request — a token refresh that could not be persisted
 * still produced a usable access token for *this* request, and the next
 * mutation will persist a fresh one.
 */
async function trySetCookie(
  name: string,
  value: string,
  options: { maxAge?: number },
): Promise<boolean> {
  try {
    const jar = await cookies();
    jar.set(name, value, { ...baseCookieOptions(), ...options });
    return true;
  } catch {
    return false;
  }
}

export async function readAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function readRefreshToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

export async function readSessionSnapshot(): Promise<SessionSnapshot | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "user" in parsed &&
      "stores" in parsed
    ) {
      return parsed as SessionSnapshot;
    }
    return null;
  } catch {
    return null;
  }
}

export async function writeSessionSnapshot(
  snapshot: SessionSnapshot,
): Promise<void> {
  await trySetCookie(SESSION_COOKIE, JSON.stringify(snapshot), {
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
}

/**
 * Persist a login/refresh response. Returns false when the cookie jar was
 * read-only (Server Component render); the caller may still use the tokens
 * in-memory for the remainder of the request.
 */
export async function persistAuthResponse(auth: AuthResponse): Promise<boolean> {
  const accessMaxAge =
    Number.isFinite(auth.expiresIn) && auth.expiresIn > 0
      ? Math.floor(auth.expiresIn)
      : ACCESS_TOKEN_FALLBACK_MAX_AGE_SECONDS;

  const wrote = await trySetCookie(ACCESS_TOKEN_COOKIE, auth.accessToken, {
    maxAge: accessMaxAge,
  });
  if (!wrote) return false;

  await trySetCookie(REFRESH_TOKEN_COOKIE, auth.refreshToken, {
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
  await writeSessionSnapshot({ user: auth.user, stores: auth.stores });
  return true;
}

export async function clearAuthCookies(): Promise<void> {
  try {
    const jar = await cookies();
    for (const name of [
      ACCESS_TOKEN_COOKIE,
      REFRESH_TOKEN_COOKIE,
      SESSION_COOKIE,
    ]) {
      jar.set(name, "", { ...baseCookieOptions(), maxAge: 0 });
    }
  } catch {
    // Read-only cookie jar during render; the redirect to /login still happens.
  }
}
