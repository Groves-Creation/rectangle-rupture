import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { type Database, idempotencyKeys } from "@lit/database";
import { ApiError } from "./errors.js";

export function hashRequest(body: unknown): string {
  return createHash("sha256").update(JSON.stringify(body ?? null)).digest("hex");
}

/**
 * Spec 13: order submission must be idempotent.
 *
 * A phone on a flaky warehouse connection will retry a submit it never saw
 * succeed. Without this, that retry becomes a second real order with a second
 * real inventory allocation. The client sends a stable Idempotency-Key and a
 * replay returns the original response instead of doing the work twice.
 */
export async function withIdempotency<T>(
  db: Database,
  params: { userId: string; key: string; endpoint: string; body: unknown },
  handler: () => Promise<T>,
): Promise<T> {
  const requestHash = hashRequest(params.body);

  const inserted = await db
    .insert(idempotencyKeys)
    .values({
      userId: params.userId,
      key: params.key,
      endpoint: params.endpoint,
      requestHash,
    })
    .onConflictDoNothing({ target: [idempotencyKeys.userId, idempotencyKeys.key] })
    .returning();

  if (inserted.length === 0) {
    const [existing] = await db
      .select()
      .from(idempotencyKeys)
      .where(
        and(eq(idempotencyKeys.userId, params.userId), eq(idempotencyKeys.key, params.key)),
      )
      .limit(1);

    if (!existing) {
      throw ApiError.conflict("IDEMPOTENCY_CONFLICT", "Idempotency record disappeared; retry");
    }

    // Same key, different payload: the client has a bug. Refuse rather than
    // returning a response that does not match what was asked for.
    if (existing.requestHash !== requestHash) {
      throw ApiError.conflict(
        "IDEMPOTENCY_KEY_REUSED",
        "This Idempotency-Key was already used with a different request body",
      );
    }

    if (existing.responseBody !== null && existing.responseBody !== undefined) {
      return existing.responseBody as T;
    }

    throw ApiError.conflict(
      "IDEMPOTENCY_IN_PROGRESS",
      "An identical request is still being processed; retry shortly",
    );
  }

  const result = await handler();

  await db
    .update(idempotencyKeys)
    .set({ responseStatus: 201, responseBody: result as object, updatedAt: new Date() })
    .where(and(eq(idempotencyKeys.userId, params.userId), eq(idempotencyKeys.key, params.key)));

  return result;
}
