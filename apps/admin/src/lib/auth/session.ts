import "server-only";

import { redirect } from "next/navigation";

import { apiFetch } from "@/lib/api/server-client";
import type { MeResponse } from "@/lib/api/types";

import type { SessionSnapshot } from "./cookies";
import {
  readAccessToken,
  readRefreshToken,
  readSessionSnapshot,
  writeSessionSnapshot,
} from "./cookies";

export type { SessionSnapshot };

/**
 * Resolve who is signed in. Reads the cached snapshot cookie written at login,
 * and falls back to `GET /api/auth/me` when it is missing (for example after a
 * token refresh that happened during a render and could not write cookies).
 */
export async function getSession(): Promise<SessionSnapshot | null> {
  const cached = await readSessionSnapshot();
  if (cached) return cached;

  const hasCredentials =
    (await readAccessToken()) !== null || (await readRefreshToken()) !== null;
  if (!hasCredentials) return null;

  const me = await apiFetch<MeResponse>("/api/auth/me");
  const snapshot: SessionSnapshot = { user: me.user, stores: me.stores };
  await writeSessionSnapshot(snapshot);
  return snapshot;
}

/** Session or bust — redirects to `/login` when there is no usable session. */
export async function requireSession(): Promise<SessionSnapshot> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
