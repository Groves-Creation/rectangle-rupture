import { CircleAlert, TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { SerializedError } from "@/lib/api/errors";

/**
 * Renders the contract's `{ error: { code, message } }` payload. The API's own
 * `message` is always shown — that is what makes an approve failing with
 * INSUFFICIENT_INVENTORY actionable rather than mysterious.
 */
const TITLES: Record<string, string> = {
  VALIDATION_ERROR: "Check the details",
  UNAUTHENTICATED: "Session expired",
  FORBIDDEN: "Not permitted",
  NOT_FOUND: "Not found",
  IDEMPOTENCY_KEY_REUSED: "Duplicate request",
  INSUFFICIENT_INVENTORY: "Not enough inventory",
  CUTOFF_PASSED: "Cutoff has passed",
  RATE_LIMITED: "Too many requests",
  NETWORK_ERROR: "Cannot reach the API",
};

export interface ApiErrorNoticeProps {
  error: SerializedError;
  className?: string;
}

export function ApiErrorNotice({ error, className }: ApiErrorNoticeProps) {
  const title = TITLES[error.code] ?? "Something went wrong";
  const isWarning =
    error.code === "INSUFFICIENT_INVENTORY" || error.code === "CUTOFF_PASSED";

  return (
    <Alert
      variant={isWarning ? "warning" : "destructive"}
      className={className}
    >
      {isWarning ? (
        <TriangleAlert aria-hidden="true" />
      ) : (
        <CircleAlert aria-hidden="true" />
      )}
      <div className="flex flex-col gap-1">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
        <AlertDescription className="text-xs opacity-70">
          Code: {error.code}
        </AlertDescription>
      </div>
    </Alert>
  );
}
