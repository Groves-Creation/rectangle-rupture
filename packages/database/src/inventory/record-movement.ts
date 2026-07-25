import { and, eq, sql } from "drizzle-orm";
import type { Transaction } from "../client.js";
import { InsufficientInventoryError, InvalidMovementError } from "../errors.js";
import { inventoryBalances, inventoryMovements } from "../schema/inventory.js";

export type BalanceColumn = "on_hand" | "allocated" | "damaged" | "quarantined";

export interface RecordMovementInput {
  productVariantId: string;
  locationId: string;
  movementType: (typeof inventoryMovements.$inferInsert)["movementType"];
  /** Signed, in base units. Negative removes. Zero is rejected. */
  quantity: number;
  /** Which bucket moves. Defaults to physical stock. */
  balanceColumn?: BalanceColumn;
  relatedOrderId?: string | null;
  relatedCloverTransactionId?: string | null;
  sourceLocationId?: string | null;
  destinationLocationId?: string | null;
  userId?: string | null;
  reason?: string | null;
  notes?: string | null;
}

const COLUMN_MAP = {
  on_hand: inventoryBalances.onHand,
  allocated: inventoryBalances.allocated,
  damaged: inventoryBalances.damaged,
  quarantined: inventoryBalances.quarantined,
} as const;

/**
 * THE ONLY WAY INVENTORY EVER CHANGES.
 *
 * Nothing else in this codebase may write to `inventory_balances` or
 * `inventory_movements`. Routing every quantity change through one function is
 * what makes spec section 23 answerable: for any change we can say what moved,
 * who moved it, why, under which order, at which location, and the balance
 * before and after.
 *
 * Concurrency: the balance row is locked FOR UPDATE before it is read, so two
 * simultaneous allocations of the last case serialize instead of both
 * succeeding. Callers MUST already be inside a transaction.
 */
export async function recordMovement(tx: Transaction, input: RecordMovementInput) {
  const balanceColumn: BalanceColumn = input.balanceColumn ?? "on_hand";

  if (!Number.isInteger(input.quantity)) {
    throw new InvalidMovementError(`Quantity must be an integer, got ${input.quantity}`);
  }
  if (input.quantity === 0) {
    throw new InvalidMovementError("A movement of zero carries no information and is rejected");
  }

  // Ensure a balance row exists so there is something to lock. Concurrent
  // callers race here harmlessly; the unique constraint picks one winner.
  await tx
    .insert(inventoryBalances)
    .values({
      productVariantId: input.productVariantId,
      locationId: input.locationId,
      onHand: 0,
      allocated: 0,
      damaged: 0,
      quarantined: 0,
    })
    .onConflictDoNothing({
      target: [inventoryBalances.productVariantId, inventoryBalances.locationId],
    });

  // Serialize concurrent movements against this variant/location pair.
  const [balance] = await tx
    .select()
    .from(inventoryBalances)
    .where(
      and(
        eq(inventoryBalances.productVariantId, input.productVariantId),
        eq(inventoryBalances.locationId, input.locationId),
      ),
    )
    .for("update");

  if (!balance) {
    throw new InvalidMovementError(
      `Balance row vanished for variant ${input.productVariantId} at ${input.locationId}`,
    );
  }

  const previousBalance = balance[
    balanceColumn === "on_hand"
      ? "onHand"
      : balanceColumn === "allocated"
        ? "allocated"
        : balanceColumn === "damaged"
          ? "damaged"
          : "quarantined"
  ] as number;

  const resultingBalance = previousBalance + input.quantity;

  if (resultingBalance < 0) {
    throw new InsufficientInventoryError(
      input.productVariantId,
      input.locationId,
      Math.abs(input.quantity),
      previousBalance,
    );
  }

  // Allocating more than is physically free would violate the
  // available >= 0 CHECK. Fail with a domain error rather than a raw 23514.
  if (balanceColumn === "allocated" && input.quantity > 0) {
    const availableNow =
      balance.onHand - balance.allocated - balance.damaged - balance.quarantined;
    if (input.quantity > availableNow) {
      throw new InsufficientInventoryError(
        input.productVariantId,
        input.locationId,
        input.quantity,
        availableNow,
      );
    }
  }

  const column = COLUMN_MAP[balanceColumn];
  await tx
    .update(inventoryBalances)
    .set({
      [balanceColumn === "on_hand"
        ? "onHand"
        : balanceColumn]: resultingBalance,
      updatedAt: new Date(),
    })
    .where(eq(inventoryBalances.id, balance.id));

  const [movement] = await tx
    .insert(inventoryMovements)
    .values({
      productVariantId: input.productVariantId,
      locationId: input.locationId,
      movementType: input.movementType,
      quantity: input.quantity,
      balanceColumn,
      previousBalance,
      resultingBalance,
      sourceLocationId: input.sourceLocationId ?? null,
      destinationLocationId: input.destinationLocationId ?? null,
      relatedOrderId: input.relatedOrderId ?? null,
      relatedCloverTransactionId: input.relatedCloverTransactionId ?? null,
      userId: input.userId ?? null,
      reason: input.reason ?? null,
      notes: input.notes ?? null,
    })
    .returning();

  void column; // COLUMN_MAP documents the mapping; the set() above applies it.

  return { movement: movement!, previousBalance, resultingBalance };
}

/**
 * Recomputes a balance directly from the ledger. Used by tests and the
 * reconciliation report to prove the cache has not drifted.
 */
export async function computeBalanceFromLedger(
  tx: Transaction,
  productVariantId: string,
  locationId: string,
  balanceColumn: BalanceColumn = "on_hand",
) {
  const [row] = await tx
    .select({ total: sql<string>`coalesce(sum(${inventoryMovements.quantity}), 0)` })
    .from(inventoryMovements)
    .where(
      and(
        eq(inventoryMovements.productVariantId, productVariantId),
        eq(inventoryMovements.locationId, locationId),
        eq(inventoryMovements.balanceColumn, balanceColumn),
      ),
    );
  return Number(row?.total ?? 0);
}
