import type { IsoDateTime } from "@/lib/api/types";

/**
 * Timestamps arrive as ISO 8601 **UTC** strings. They are rendered in UTC on
 * purpose: the same markup is produced on the server and in the browser, so
 * there is no hydration mismatch and no ambiguity about which day a cutoff
 * fell on. The "UTC" suffix makes that explicit to the operator.
 */
const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  timeZone: "UTC",
});

export function formatDateTime(
  value: IsoDateTime | null | undefined,
  fallback = "—",
): string {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return `${DATE_TIME_FORMAT.format(parsed)} UTC`;
}

export function formatDate(
  value: IsoDateTime | null | undefined,
  fallback = "—",
): string {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return DATE_FORMAT.format(parsed);
}

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

/** Quantities are integers in base units — safe to format as plain numbers. */
export function formatQuantity(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  return NUMBER_FORMAT.format(value);
}

/** `case` -> `Case`, `each` -> `Each`. Unit types are free-form in the contract. */
export function formatUnitType(value: string): string {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}
