import "server-only";

import { redirect } from "next/navigation";

import {
  clearAuthCookies,
  persistAuthResponse,
  readAccessToken,
  readRefreshToken,
} from "@/lib/auth/cookies";

import { ApiError, ApiUnreachableError } from "./errors";
import type { ApiErrorBody, AuthResponse } from "./types";

/**
 * The one place auth-aware HTTP happens.
 *
 * Everything else in the app — pages, server actions, mutations — goes through
 * `apiFetch`. It attaches the bearer token, understands the contract's error
 * envelope, and owns the 401 -> refresh -> retry-once -> /login dance. Auth
 * logic deliberately lives nowhere else.
 *
 * This module is `server-only`: importing it from a Client Component is a
 * build error, which is what prevents the refresh token reaching the browser.
 */

/** Base URL always comes from configuration, never hardcoded (contract §Base URL). */
export function getApiBaseUrl(): string {
  const configured =
    process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";
  const base = configured.trim() === "" ? "http://localhost:3000" : configured;
  return base.replace(/\/+$/, "");
}

export type QueryValue = string | number | boolean | null | undefined;

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  /** Serialised as JSON. Omitted entirely when undefined. */
  body?: unknown;
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  /** Defaults to "no-store": every response here is per-user and authenticated. */
  cache?: RequestCache;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function send(
  path: string,
  options: ApiRequestOptions,
  accessToken: string | null,
): Promise<Response> {
  const headers: Record<string, string> = {
    accept: "application/json",
    ...options.headers,
  };
  if (options.body !== undefined) {
    headers["content-type"] = "application/json";
  }
  if (accessToken) {
    headers["authorization"] = `Bearer ${accessToken}`;
  }

  try {
    return await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: options.cache ?? "no-store",
    });
  } catch (cause) {
    throw new ApiUnreachableError(
      `Could not reach the LIT API at ${getApiBaseUrl()}. Is it running?`,
      cause,
    );
  }
}

/** Parse a response into `T`, or throw `ApiError` built from the error envelope. */
async function parse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let payload: unknown;
  if (text.length > 0) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = undefined;
    }
  }

  if (!response.ok) {
    const envelope = payload as Partial<ApiErrorBody> | undefined;
    const code = envelope?.error?.code ?? "UNKNOWN_ERROR";
    const message =
      envelope?.error?.message ??
      (text.length > 0 && text.length < 300 ? text : "") ??
      "";
    throw new ApiError(
      response.status,
      code,
      message || `Request failed with status ${response.status}.`,
    );
  }

  return payload as T;
}

/* -------------------------------------------------------------------------- */
/* Refresh-token rotation                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Refresh tokens rotate: presenting a consumed one "revokes the entire session
 * family" (contract §POST /api/auth/refresh). Two things could cause that here,
 * and both are guarded:
 *
 *  1. Concurrent 401s in one render each firing their own refresh — deduped by
 *     `inflightRefreshes`, keyed on the token being spent.
 *  2. A refresh that succeeded during a Server Component render, where Next
 *     forbids cookie writes, leaving the dead token in the browser's cookie —
 *     `recentRefreshes` remembers the rotation in-process for a short window so
 *     the follow-up request reuses the new token instead of replaying the dead
 *     one.
 */
const inflightRefreshes = new Map<string, Promise<AuthResponse | null>>();
const recentRefreshes = new Map<string, { at: number; auth: AuthResponse }>();
const RECENT_REFRESH_TTL_MS = 60_000;

function readRecentRefresh(refreshToken: string): AuthResponse | null {
  const hit = recentRefreshes.get(refreshToken);
  if (!hit) return null;
  if (Date.now() - hit.at > RECENT_REFRESH_TTL_MS) {
    recentRefreshes.delete(refreshToken);
    return null;
  }
  return hit.auth;
}

async function performRefresh(
  refreshToken: string,
): Promise<AuthResponse | null> {
  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  let auth: AuthResponse;
  try {
    auth = (await response.json()) as AuthResponse;
  } catch {
    return null;
  }
  if (!auth?.accessToken || !auth?.refreshToken) return null;

  recentRefreshes.set(refreshToken, { at: Date.now(), auth });
  // Best-effort: succeeds in a Server Action / Route Handler, no-ops in render.
  await persistAuthResponse(auth);
  return auth;
}

async function refreshSession(): Promise<AuthResponse | null> {
  const refreshToken = await readRefreshToken();
  if (!refreshToken) return null;

  const cached = readRecentRefresh(refreshToken);
  if (cached) return cached;

  const existing = inflightRefreshes.get(refreshToken);
  if (existing) return existing;

  const pending = performRefresh(refreshToken).finally(() => {
    inflightRefreshes.delete(refreshToken);
  });
  inflightRefreshes.set(refreshToken, pending);
  return pending;
}

/* -------------------------------------------------------------------------- */
/* Public surface                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Authenticated request against the LIT API.
 *
 * On 401 it refreshes once and retries. A second 401 clears the cookies and
 * redirects to `/login` (which throws `NEXT_REDIRECT` — callers that catch
 * errors must rethrow it, see `isNextControlFlowError`).
 */
export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const accessToken = await readAccessToken();
  let response = await send(path, options, accessToken);

  if (response.status !== 401) {
    return parse<T>(response);
  }

  const refreshed = await refreshSession();
  if (!refreshed) {
    await clearAuthCookies();
    redirect("/login");
  }

  response = await send(path, options, refreshed.accessToken);
  if (response.status === 401) {
    await clearAuthCookies();
    redirect("/login");
  }

  return parse<T>(response);
}

/**
 * Unauthenticated request — used only by login, which has no token yet and
 * must not trigger the refresh/redirect path.
 */
export async function publicApiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await send(path, options, null);
  return parse<T>(response);
}
