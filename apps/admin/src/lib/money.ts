import type { Money } from "@/lib/api/types";

/**
 * Money handling.
 *
 * The API sends money as decimal **strings** with 4 places (`"12.5000"`).
 * Those strings are the value; a JS `number` is only ever an ephemeral
 * argument to `Intl.NumberFormat`. Nothing in this app stores, sums, compares
 * or round-trips money through a float — binary floating point cannot
 * represent most decimal fractions exactly, so doing so silently corrupts
 * totals on an order that may be legally binding.
 *
 * Rounding to display precision therefore happens on the *string*, and the
 * `Number()` conversion is the very last step before formatting.
 */

const DECIMAL_PATTERN = /^([+-])?(\d+)(?:\.(\d*))?$/;

interface ParsedDecimal {
  negative: boolean;
  integer: string;
  fraction: string;
}

function parseDecimal(value: string): ParsedDecimal | null {
  const match = DECIMAL_PATTERN.exec(value.trim());
  if (!match) return null;
  return {
    negative: match[1] === "-",
    integer: match[2] ?? "0",
    fraction: match[3] ?? "",
  };
}

/** Add one to a string of digits, carrying left. `"199"` -> `"200"`. */
function incrementDigits(digits: string): string {
  const out = digits.split("");
  for (let i = out.length - 1; i >= 0; i -= 1) {
    const digit = out[i];
    if (digit === undefined) break;
    if (digit === "9") {
      out[i] = "0";
      continue;
    }
    out[i] = String(Number(digit) + 1);
    return out.join("");
  }
  return `1${out.join("")}`;
}

/**
 * Round a decimal string to `decimals` places, half-away-from-zero, entirely
 * in string space. `"12.5000"` -> `"12.50"`, `"0.005"` -> `"0.01"`.
 *
 * Returns `null` when the input is not a decimal literal, so callers can decide
 * how to degrade rather than silently showing a wrong number.
 */
export function roundMoneyString(value: string, decimals = 2): string | null {
  const parsed = parseDecimal(value);
  if (!parsed) return null;

  const sign = parsed.negative ? "-" : "";

  if (parsed.fraction.length <= decimals) {
    const padded = parsed.fraction.padEnd(decimals, "0");
    return decimals === 0
      ? `${sign}${parsed.integer}`
      : `${sign}${parsed.integer}.${padded}`;
  }

  const kept = parsed.fraction.slice(0, decimals);
  const nextDigit = parsed.fraction.charCodeAt(decimals) - 48;
  let digits = `${parsed.integer}${kept}`;
  if (nextDigit >= 5) {
    digits = incrementDigits(digits);
  }

  const splitAt = digits.length - decimals;
  const integerPart = digits.slice(0, splitAt).replace(/^0+(?=\d)/, "") || "0";
  const fractionPart = digits.slice(splitAt);
  return decimals === 0
    ? `${sign}${integerPart}`
    : `${sign}${integerPart}.${fractionPart}`;
}

export interface FormatMoneyOptions {
  currency?: string;
  locale?: string;
  /** Rendered when the value is missing. */
  fallback?: string;
}

/**
 * Format an API money string for display.
 *
 * The only `Number()` call on money in this codebase lives here, one
 * expression before `Intl.NumberFormat.format` — by then the value has already
 * been rounded to two decimal places as a string, so the float round-trip
 * cannot change what the user sees.
 */
export function formatMoney(
  value: Money | null | undefined,
  options: FormatMoneyOptions = {},
): string {
  const { currency = "USD", locale = "en-US", fallback = "—" } = options;

  if (value === null || value === undefined || value.trim() === "") {
    return fallback;
  }

  const rounded = roundMoneyString(value, 2);
  if (rounded === null) {
    // Not a decimal literal — show the raw value rather than inventing one.
    return value;
  }

  const numeric = Number(rounded);
  if (!Number.isFinite(numeric)) return value;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

/**
 * Compare two money strings without converting to a number — useful for
 * sorting a table column. Returns -1 / 0 / 1.
 */
export function compareMoney(a: Money, b: Money): number {
  const left = parseDecimal(a);
  const right = parseDecimal(b);
  if (!left || !right) return a.localeCompare(b);

  if (left.negative !== right.negative) return left.negative ? -1 : 1;

  const width = Math.max(left.integer.length, right.integer.length);
  const leftInt = left.integer.padStart(width, "0");
  const rightInt = right.integer.padStart(width, "0");

  const fractionWidth = Math.max(left.fraction.length, right.fraction.length);
  const leftKey = `${leftInt}.${left.fraction.padEnd(fractionWidth, "0")}`;
  const rightKey = `${rightInt}.${right.fraction.padEnd(fractionWidth, "0")}`;

  const raw = leftKey === rightKey ? 0 : leftKey < rightKey ? -1 : 1;
  return left.negative ? -raw : raw;
}
