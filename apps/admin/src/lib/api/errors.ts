import type { ApiErrorCode } from "./types";

/**
 * A failure carrying the contract's `{ error: { code, message } }` payload.
 * `message` is always safe to surface in the UI — the contract specifies it as
 * "human readable".
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;

  constructor(status: number, code: ApiErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** Thrown when the API cannot be reached at all (DNS, connection refused, ...). */
export class ApiUnreachableError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "ApiUnreachableError";
  }
}

export interface SerializedError {
  code: ApiErrorCode;
  message: string;
}

/**
 * `redirect()` and `notFound()` signal control flow by throwing. Server actions
 * wrap their bodies in try/catch to convert failures into a serialisable
 * result, so those framework errors must be rethrown rather than swallowed.
 */
export function isNextControlFlowError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const digest = (error as { digest?: unknown }).digest;
  return (
    typeof digest === "string" &&
    (digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND")
  );
}

/** Normalise anything thrown into the contract's error shape. */
export function serializeError(error: unknown): SerializedError {
  if (error instanceof ApiError) {
    return { code: error.code, message: error.message };
  }
  if (error instanceof ApiUnreachableError) {
    return { code: "NETWORK_ERROR", message: error.message };
  }
  if (error instanceof Error && error.message) {
    return { code: "UNKNOWN_ERROR", message: error.message };
  }
  return { code: "UNKNOWN_ERROR", message: "Something went wrong." };
}
