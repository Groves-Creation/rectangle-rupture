import { eq } from "drizzle-orm";
import { type Database, orderLines, orderStatusHistory, orders } from "@lit/database";
import { writeAuditLog } from "../../lib/audit.js";
import { ApiError } from "../../lib/errors.js";
import { addMoney, multiplyMoney } from "../../lib/money.js";
import { getOrderDetail } from "./orders.queries.js";

const ADJUSTABLE = new Set(["submitted", "under_review"]);

interface LineAdjustment {
  lineId: string;
  quantityOrdered: number;
}

interface AdjustOrderInput {
  reason: string;
  lines: LineAdjustment[];
}

/**
 * Lets HQ correct requested quantities before inventory is allocated.
 *
 * Snapshot prices remain immutable: only quantity and the totals derived from
 * that original snapshot change. A zero quantity removes the line.
 */
export async function adjustOrder(
  db: Database,
  actorId: string,
  orderId: string,
  input: AdjustOrderInput,
  meta: { ipAddress?: string },
) {
  await db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)
      .for("update");

    if (!order) throw ApiError.notFound("Order not found");
    if (!ADJUSTABLE.has(order.status)) {
      throw ApiError.unprocessable(
        "ORDER_NOT_ADJUSTABLE",
        `An order with status "${order.status}" can no longer be adjusted`,
      );
    }

    const currentLines = await tx
      .select()
      .from(orderLines)
      .where(eq(orderLines.orderId, orderId));
    const byId = new Map(currentLines.map((line) => [line.id, line]));

    for (const adjustment of input.lines) {
      if (!byId.has(adjustment.lineId)) {
        throw ApiError.validation(
          `Order line "${adjustment.lineId}" does not belong to this order`,
        );
      }
    }

    const requestedById = new Map(
      input.lines.map((line) => [line.lineId, line.quantityOrdered]),
    );
    const remaining = currentLines.filter(
      (line) => (requestedById.get(line.id) ?? line.quantityOrdered) > 0,
    );
    if (remaining.length === 0) {
      throw ApiError.validation("An adjusted order must retain at least one line");
    }

    const changes: Array<{
      lineId: string;
      sku: string;
      fromQuantity: number;
      toQuantity: number;
    }> = [];

    for (const adjustment of input.lines) {
      const line = byId.get(adjustment.lineId)!;
      if (adjustment.quantityOrdered === line.quantityOrdered) continue;

      changes.push({
        lineId: line.id,
        sku: line.skuSnapshot,
        fromQuantity: line.quantityOrdered,
        toQuantity: adjustment.quantityOrdered,
      });

      if (adjustment.quantityOrdered === 0) {
        await tx.delete(orderLines).where(eq(orderLines.id, line.id));
        continue;
      }

      const packPrice =
        line.unitType === "unit"
          ? line.unitPriceSnapshot
          : (line.casePriceSnapshot ??
            multiplyMoney(line.unitPriceSnapshot, line.unitsPerPackSnapshot));
      await tx
        .update(orderLines)
        .set({
          quantityOrdered: adjustment.quantityOrdered,
          lineTotal: multiplyMoney(packPrice, adjustment.quantityOrdered),
          updatedAt: new Date(),
        })
        .where(eq(orderLines.id, line.id));
    }

    if (changes.length === 0) {
      throw ApiError.validation("No order quantities were changed");
    }

    const adjustedLines = await tx
      .select({ lineTotal: orderLines.lineTotal })
      .from(orderLines)
      .where(eq(orderLines.orderId, orderId));
    const orderTotal = addMoney(...adjustedLines.map((line) => line.lineTotal));

    await tx
      .update(orders)
      .set({ orderTotal, updatedAt: new Date() })
      .where(eq(orders.id, order.id));

    await tx.insert(orderStatusHistory).values({
      orderId: order.id,
      fromStatus: order.status,
      toStatus: order.status,
      changedByUserId: actorId,
      notes: `Order adjusted: ${input.reason}`,
    });

    await writeAuditLog(tx, {
      userId: actorId,
      action: "order.adjust",
      entityType: "order",
      entityId: order.id,
      changes: {
        reason: input.reason,
        previousOrderTotal: order.orderTotal,
        orderTotal,
        lines: changes,
      },
      ipAddress: meta.ipAddress ?? null,
    });
  });

  return getOrderDetail(db, orderId);
}
