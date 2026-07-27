import { eq } from "drizzle-orm";
import {
  type Database,
  inventoryAllocations,
  inventoryBalances,
  orderLines,
  orderStatusHistory,
  orders,
  recordMovement,
  users,
} from "@lit/database";
import { and } from "drizzle-orm";
import { ApiError } from "../../lib/errors.js";
import { writeAuditLog } from "../../lib/audit.js";
import { sendOrderStatusEmail } from "../../lib/email/index.js";
import { getOrderDetail } from "./orders.queries.js";

/** Statuses from which approval or rejection is still meaningful. */
const ACTIONABLE = new Set(["submitted", "under_review", "approved"]);

/**
 * Approves an order and allocates inventory against it.
 *
 * Allocation moves stock from "available" into "allocated" — it does NOT
 * reduce on-hand. Physical stock only drops at picking/shipment (Phase 2).
 *
 * Partial allocation is allowed: if the warehouse is short, we reserve what is
 * there and record the shortfall on the line. The skeleton does not create
 * backorders — that is Phase 2 — but the data needed to create them is here.
 */
export async function approveOrder(
  db: Database,
  approverId: string,
  orderId: string,
  input: { notes?: string | undefined },
  meta: { ipAddress?: string },
) {
  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!order) throw ApiError.notFound("Order not found");
    if (!ACTIONABLE.has(order.status)) {
      throw ApiError.unprocessable(
        "ORDER_NOT_ACTIONABLE",
        `An order with status "${order.status}" can no longer be approved`,
      );
    }

    const lines = await tx.select().from(orderLines).where(eq(orderLines.orderId, orderId));

    let anyShortfall = false;

    for (const line of lines) {
      // Base units, not packs. A 2-case order of a 12-pack reserves 24 units.
      const requestedUnits = line.quantityOrdered * line.unitsPerPackSnapshot;

      const [balance] = await tx
        .select()
        .from(inventoryBalances)
        .where(
          and(
            eq(inventoryBalances.productVariantId, line.productVariantId),
            eq(inventoryBalances.locationId, order.warehouseId),
          ),
        )
        .limit(1);

      const available = balance?.available ?? 0;
      const toAllocate = Math.min(requestedUnits, Math.max(available, 0));

      if (toAllocate < requestedUnits) anyShortfall = true;

      if (toAllocate > 0) {
        // Every quantity change goes through the ledger. No exceptions.
        await recordMovement(tx, {
          productVariantId: line.productVariantId,
          locationId: order.warehouseId,
          movementType: "order_allocation",
          quantity: toAllocate,
          balanceColumn: "allocated",
          relatedOrderId: order.id,
          userId: approverId,
          reason: "Order approved; inventory reserved",
        });

        await tx.insert(inventoryAllocations).values({
          orderId: order.id,
          orderLineId: line.id,
          productVariantId: line.productVariantId,
          locationId: order.warehouseId,
          quantity: toAllocate,
          status: "allocated",
        });

        await tx
          .update(orderLines)
          .set({ quantityAllocated: toAllocate, updatedAt: new Date() })
          .where(eq(orderLines.id, line.id));
      }
    }

    await tx
      .update(orders)
      .set({
        status: "inventory_allocated",
        approvedAt: new Date(),
        approvedByUserId: approverId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    // Timestamps are left to the database. Display order comes from the
    // sequence column, so these two rows sharing a transaction timestamp is
    // fine and no longer ambiguous.
    await tx.insert(orderStatusHistory).values([
      {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: "approved",
        changedByUserId: approverId,
        notes: input.notes ?? null,
      },
      {
        orderId: order.id,
        fromStatus: "approved",
        toStatus: "inventory_allocated",
        changedByUserId: approverId,
        notes: anyShortfall
          ? "Partially allocated — warehouse stock was short on one or more lines"
          : null,
      },
    ]);

    await writeAuditLog(tx, {
      userId: approverId,
      action: "order.approve",
      entityType: "order",
      entityId: order.id,
      changes: { anyShortfall, notes: input.notes ?? null },
      ipAddress: meta.ipAddress ?? null,
    });
  });

  const detail = await getOrderDetail(db, orderId);

  db.select({ email: users.email, fullName: users.fullName })
    .from(users)
    .innerJoin(orders, eq(orders.submittedByUserId, users.id))
    .where(eq(orders.id, orderId))
    .limit(1)
    .then(([subUser]) => {
      if (subUser?.email) {
        sendOrderStatusEmail(subUser.email, {
          customerName: subUser.fullName,
          orderNumber: detail.orderNumber,
          status: detail.status,
          totalAmount: `$${(Number(detail.orderTotal) / 100).toFixed(2)}`,
        }).catch((err) => console.error("Failed to send order approval status email:", err));
      }
    });

  return detail;
}

export async function rejectOrder(
  db: Database,
  approverId: string,
  orderId: string,
  reason: string,
  meta: { ipAddress?: string },
) {
  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!order) throw ApiError.notFound("Order not found");
    if (!ACTIONABLE.has(order.status)) {
      throw ApiError.unprocessable(
        "ORDER_NOT_ACTIONABLE",
        `An order with status "${order.status}" can no longer be rejected`,
      );
    }

    await tx
      .update(orders)
      .set({ status: "rejected", rejectionReason: reason, updatedAt: new Date() })
      .where(eq(orders.id, order.id));

    await tx.insert(orderStatusHistory).values({
      orderId: order.id,
      fromStatus: order.status,
      toStatus: "rejected",
      changedByUserId: approverId,
      notes: reason,
    });

    await writeAuditLog(tx, {
      userId: approverId,
      action: "order.reject",
      entityType: "order",
      entityId: order.id,
      changes: { reason },
      ipAddress: meta.ipAddress ?? null,
    });
  });

  const detail = await getOrderDetail(db, orderId);

  db.select({ email: users.email, fullName: users.fullName })
    .from(users)
    .innerJoin(orders, eq(orders.submittedByUserId, users.id))
    .where(eq(orders.id, orderId))
    .limit(1)
    .then(([subUser]) => {
      if (subUser?.email) {
        sendOrderStatusEmail(subUser.email, {
          customerName: subUser.fullName,
          orderNumber: detail.orderNumber,
          status: detail.status,
          totalAmount: `$${(Number(detail.orderTotal) / 100).toFixed(2)}`,
        }).catch((err) => console.error("Failed to send order rejection status email:", err));
      }
    });

  return detail;
}
