import { and, eq } from "drizzle-orm";
import {
  type Database,
  cartLines,
  carts,
  casePacks,
  orderLines,
  orderStatusHistory,
  orders,
  priceBookItems,
  productVariants,
  products,
  stores,
  users,
} from "@lit/database";
import { ApiError } from "../../lib/errors.js";
import { addMoney, compareMoney, multiplyMoney, ZERO_MONEY } from "../../lib/money.js";
import { writeAuditLog } from "../../lib/audit.js";
import { sendOrderStatusEmail } from "../../lib/email/index.js";
import { getOrderDetail } from "./orders.queries.js";
import {
  resolveStorePriceBook,
  resolveStoreWarehouse,
} from "../catalog/catalog.service.js";

/**
 * Submits the active cart as an order.
 *
 * Note what does NOT happen here: no inventory is allocated. Spec 6.3 puts
 * allocation after warehouse approval, so submit only captures intent and
 * freezes prices. Allocation is approveOrder's job.
 *
 * The whole thing runs in one transaction — a half-written order with no lines
 * would be worse than no order at all.
 */
export async function submitOrder(
  db: Database,
  userId: string,
  input: { storeId: string; notes?: string | undefined },
  meta: { ipAddress?: string },
) {
  const warehouseId = await resolveStoreWarehouse(db, input.storeId);
  const priceBookId = await resolveStorePriceBook(db, input.storeId);

  const orderId = await db.transaction(async (tx) => {
    const [cart] = await tx
      .select()
      .from(carts)
      .where(
        and(
          eq(carts.storeId, input.storeId),
          eq(carts.userId, userId),
          eq(carts.status, "active"),
        ),
      )
      .limit(1);

    if (!cart) throw ApiError.validation("No active cart for this store");

    const lines = await tx
      .select({
        variantId: cartLines.productVariantId,
        unitType: cartLines.unitType,
        quantity: cartLines.quantity,
        sku: productVariants.sku,
        variantName: productVariants.variantName,
        minimumOrderQuantity: productVariants.minimumOrderQuantity,
        productName: products.name,
        unitPrice: priceBookItems.unitPrice,
        casePrice: priceBookItems.casePrice,
        priceBookItemId: priceBookItems.id,
        unitsPerPack: casePacks.unitsPerPack,
      })
      .from(cartLines)
      .innerJoin(productVariants, eq(productVariants.id, cartLines.productVariantId))
      .innerJoin(products, eq(products.id, productVariants.productId))
      .leftJoin(
        priceBookItems,
        and(
          eq(priceBookItems.productVariantId, cartLines.productVariantId),
          eq(priceBookItems.priceBookId, priceBookId),
        ),
      )
      .leftJoin(
        casePacks,
        and(
          eq(casePacks.productVariantId, cartLines.productVariantId),
          eq(casePacks.unitType, cartLines.unitType),
        ),
      )
      .where(eq(cartLines.cartId, cart.id));

    if (lines.length === 0) {
      throw ApiError.validation("Cannot submit an empty cart");
    }

    // --- validate and snapshot ------------------------------------------------
    const prepared = lines.map((line) => {
      if (!line.unitPrice) {
        throw ApiError.validation(`No price configured for ${line.sku}`);
      }
      if (line.quantity < line.minimumOrderQuantity) {
        throw ApiError.validation(
          `Minimum order quantity for ${line.sku} is ${line.minimumOrderQuantity}`,
        );
      }

      const unitsPerPack = line.unitsPerPack ?? 1;
      const packPrice =
        line.unitType === "unit"
          ? line.unitPrice
          : (line.casePrice ?? multiplyMoney(line.unitPrice, unitsPerPack));

      return {
        variantId: line.variantId,
        skuSnapshot: line.sku,
        nameSnapshot: line.variantName
          ? `${line.productName} — ${line.variantName}`
          : line.productName,
        unitType: line.unitType,
        unitsPerPackSnapshot: unitsPerPack,
        unitPriceSnapshot: line.unitPrice,
        casePriceSnapshot: line.casePrice,
        priceBookItemId: line.priceBookItemId,
        quantityOrdered: line.quantity,
        lineTotal: multiplyMoney(packPrice, line.quantity),
      };
    });

    const orderTotal = addMoney(...prepared.map((p) => p.lineTotal));

    const [store] = await tx
      .select({ orderMinimum: stores.orderMinimum })
      .from(stores)
      .where(eq(stores.locationId, input.storeId))
      .limit(1);

    const orderMinimum = store?.orderMinimum ?? ZERO_MONEY;
    if (compareMoney(orderTotal, orderMinimum) < 0) {
      throw ApiError.unprocessable(
        "ORDER_BELOW_MINIMUM",
        `Order total ${orderTotal} is below this store's minimum of ${orderMinimum}`,
      );
    }

    // --- persist --------------------------------------------------------------
    const [order] = await tx
      .insert(orders)
      .values({
        storeId: input.storeId,
        warehouseId,
        submittedByUserId: userId,
        status: "submitted",
        orderTotal,
        notes: input.notes ?? null,
      })
      .returning();

    await tx.insert(orderLines).values(
      prepared.map((p) => ({
        orderId: order!.id,
        productVariantId: p.variantId,
        skuSnapshot: p.skuSnapshot,
        nameSnapshot: p.nameSnapshot,
        unitType: p.unitType,
        unitsPerPackSnapshot: p.unitsPerPackSnapshot,
        unitPriceSnapshot: p.unitPriceSnapshot,
        casePriceSnapshot: p.casePriceSnapshot,
        priceBookItemId: p.priceBookItemId,
        quantityOrdered: p.quantityOrdered,
        lineTotal: p.lineTotal,
      })),
    );

    await tx.insert(orderStatusHistory).values({
      orderId: order!.id,
      fromStatus: null,
      toStatus: "submitted",
      changedByUserId: userId,
    });

    await writeAuditLog(tx, {
      userId,
      action: "order.submit",
      entityType: "order",
      entityId: order!.id,
      changes: { orderTotal, lineCount: prepared.length, storeId: input.storeId },
      ipAddress: meta.ipAddress ?? null,
    });

    // Retire the cart. A fresh one is created lazily on the next cart request,
    // which keeps the submitted cart intact for forensics.
    await tx.update(carts).set({ status: "submitted" }).where(eq(carts.id, cart.id));

    return order!.id;
  });

  const detail = await getOrderDetail(db, orderId);

  // Send order confirmation email to the submitter
  db.select({ email: users.email, fullName: users.fullName })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .then(([subUser]) => {
      if (subUser?.email) {
        sendOrderStatusEmail(subUser.email, {
          customerName: subUser.fullName,
          orderNumber: detail.orderNumber,
          status: detail.status,
          items: detail.lines.map((l) => ({
            name: l.name,
            quantity: l.quantityOrdered,
            price: `$${(Number(l.lineTotal) / 100).toFixed(2)}`,
          })),
          totalAmount: `$${(Number(detail.orderTotal) / 100).toFixed(2)}`,
        }).catch((err) => console.error("Failed to send order status email:", err));
      }
    });

  return detail;
}
