/**
 * Exact decimal arithmetic for money, backed by BigInt at scale 4.
 *
 * Money never becomes a JavaScript number anywhere in this codebase. Floats
 * cannot represent 0.1 exactly, and an order total that is off by a cent is a
 * correctness bug that shows up as an unexplainable variance months later.
 */

const SCALE = 4n;
const SCALE_FACTOR = 10_000n;

/** Parses "12.5000" into scaled BigInt units (125000). */
export function parseMoney(value: string): bigint {
  const match = /^(-?)(\d+)(?:\.(\d{1,4}))?$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid money value: ${value}`);
  }
  const [, sign, whole, fraction = ""] = match;
  const padded = fraction.padEnd(Number(SCALE), "0");
  const scaled = BigInt(whole!) * SCALE_FACTOR + BigInt(padded);
  return sign === "-" ? -scaled : scaled;
}

/** Formats scaled BigInt units back into the wire format "12.5000". */
export function formatMoney(scaled: bigint): string {
  const negative = scaled < 0n;
  const abs = negative ? -scaled : scaled;
  const whole = abs / SCALE_FACTOR;
  const fraction = (abs % SCALE_FACTOR).toString().padStart(Number(SCALE), "0");
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}

/** Multiplies a money string by an integer quantity, exactly. */
export function multiplyMoney(value: string, quantity: number): string {
  if (!Number.isInteger(quantity)) {
    throw new Error(`Quantity must be an integer, got ${quantity}`);
  }
  return formatMoney(parseMoney(value) * BigInt(quantity));
}

export function addMoney(...values: string[]): string {
  return formatMoney(values.reduce((sum, v) => sum + parseMoney(v), 0n));
}

export function compareMoney(a: string, b: string): -1 | 0 | 1 {
  const left = parseMoney(a);
  const right = parseMoney(b);
  return left < right ? -1 : left > right ? 1 : 0;
}

export const ZERO_MONEY = "0.0000";
