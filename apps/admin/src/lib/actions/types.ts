import type { SerializedError } from "@/lib/api/errors";

/**
 * Server actions never throw across the RSC boundary for expected failures —
 * they return this, so client components can render the API's own
 * `error.message` (e.g. INSUFFICIENT_INVENTORY) instead of a generic string.
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: SerializedError };

export interface LoginFormState {
  status: "idle" | "error";
  message?: string;
  code?: string;
}

export const INITIAL_LOGIN_STATE: LoginFormState = { status: "idle" };
