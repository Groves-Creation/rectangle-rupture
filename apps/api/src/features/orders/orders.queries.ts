import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import {
  type Database,
  locations,
  orderLines,
  orderStatusHistory,
  orders,
  productVariants,
  userLocationAccess,
  users,
} from "@lit/database";
import { ApiError } from "../../lib/errors.js";

export function formatOrderNumber(n: number): string {
  return `LIT-${String(n).padStart(6, "0")}`;
}

const storeLocations = locations;

export async function listOrders(
  db: Database,
  userId: string,
  query: { storeId?: string | undefined; status?: string | undefined; limit: number; offset: number },
) {
  // Restrict to locations this user can see, so an omitted storeId cannot leak
  // another store's orders.
  const accessible = await db
    .select({ locationId: userLocationAccess.locationId })
    .from(userLocationAccess)
    .where(eq(userLocationAccess.userId, userId));

  const accessibleIds = accessible.map((a) => a.locationId);
  if (accessibleIds.length === 0) {
    return { items: [], total: 0 };
  }

  const filters = [inArray(orders.storeId, accessibleIds)];
  if (query.storeId) {
    if (!accessibleIds.includes(query.storeId)) {
      throw ApiError.forbidden("You do not have access to this location");
    }
    filters.push(eq(orders.storeId, query.storeId));
  }
  if (query.status) {
    filters.push(eq(orders.status, query.status as typeof orders.$inferSelect.status));
  }

  const where = and(...filters);

  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      storeId: orders.storeId,
      storeName: storeLocations.name,
      status: orders.status,
      orderTotal: orders.orderTotal,
      submittedAt: orders.submittedAt,
      submittedByName: users.fullName,
      lineCount: sql<number>`(SELECT COUNT(*)::int FROM order_lines WHERE order_lines.order_id = ${orders.id})`,
    })
    .from(orders)
    .innerJoin(storeLocations, eq(storeLocations.id, orders.storeId))
    .innerJoin(users, eq(users.id, orders.submittedByUserId))
    .where(where)
    .orderBy(desc(orders.submittedAt))
    .limit(query.limit)
    .offset(query.offset);

  const [totalRow] = await db.select({ value: count() }).from(orders).where(where);

  return {
    total: totalRow?.value ?? 0,
    items: rows.map((r) => ({
      id: r.id,
      orderNumber: formatOrderNumber(r.orderNumber),
      storeId: r.storeId,
      storeName: r.storeName,
      status: r.status,
      orderTotal: r.orderTotal,
      lineCount: Number(r.lineCount),
      submittedAt: r.submittedAt.toISOString(),
      submittedByName: r.submittedByName,
    })),
  };
}

export async function getOrderDetail(db: Database, orderId: string) {
  const submitter = users;

  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      storeId: orders.storeId,
      warehouseId: orders.warehouseId,
      status: orders.status,
      orderTotal: orders.orderTotal,
      notes: orders.notes,
      submittedAt: orders.submittedAt,
      submittedByName: submitter.fullName,
      approvedAt: orders.approvedAt,
      approvedByUserId: orders.approvedByUserId,
      rejectionReason: orders.rejectionReason,
    })
    .from(orders)
    .innerJoin(submitter, eq(submitter.id, orders.submittedByUserId))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) throw ApiError.notFound("Order not found");

  const [storeRow] = await db
    .select({ name: locations.name })
    .from(locations)
    .where(eq(locations.id, order.storeId))
    .limit(1);

  const [warehouseRow] = await db
    .select({ name: locations.name })
    .from(locations)
    .where(eq(locations.id, order.warehouseId))
    .limit(1);

  let approvedByName: string | null = null;
  if (order.approvedByUserId) {
    const [approver] = await db
      .select({ fullName: users.fullName })
      .from(users)
      .where(eq(users.id, order.approvedByUserId))
      .limit(1);
    approvedByName = approver?.fullName ?? null;
  }

  // Everything rendered here comes from the line snapshot, never from live
  // pricing. Changing a catalog price must not alter a placed order.
  const lineRows = await db
    .select({
      id: orderLines.id,
      variantId: orderLines.productVariantId,
      sku: orderLines.skuSnapshot,
      name: orderLines.nameSnapshot,
      unitType: orderLines.unitType,
      unitsPerPack: orderLines.unitsPerPackSnapshot,
      quantityOrdered: orderLines.quantityOrdered,
      quantityAllocated: orderLines.quantityAllocated,
      unitPrice: orderLines.unitPriceSnapshot,
      lineTotal: orderLines.lineTotal,
    })
    .from(orderLines)
    .where(eq(orderLines.orderId, orderId));

  const historyRows = await db
    .select({
      toStatus: orderStatusHistory.toStatus,
      fromStatus: orderStatusHistory.fromStatus,
      notes: orderStatusHistory.notes,
      createdAt: orderStatusHistory.createdAt,
      changedByName: users.fullName,
    })
    .from(orderStatusHistory)
    .leftJoin(users, eq(users.id, orderStatusHistory.changedByUserId))
    // Sequence, not created_at — see migration 0002 for why the wall clock is
    // not a safe sort key here.
    .where(eq(orderStatusHistory.orderId, orderId))
    .orderBy(orderStatusHistory.sequence);

  return {
    id: order.id,
    orderNumber: formatOrderNumber(order.orderNumber),
    storeId: order.storeId,
    storeName: storeRow?.name ?? "",
    warehouseId: order.warehouseId,
    warehouseName: warehouseRow?.name ?? "",
    status: order.status,
    orderTotal: order.orderTotal,
    notes: order.notes,
    submittedAt: order.submittedAt.toISOString(),
    submittedByName: order.submittedByName,
    approvedAt: order.approvedAt?.toISOString() ?? null,
    approvedByName,
    rejectionReason: order.rejectionReason,
    lines: lineRows.map((l) => ({
      ...l,
      fullyAllocated: l.quantityAllocated >= l.quantityOrdered * l.unitsPerPack,
    })),
    statusHistory: historyRows.map((h) => ({
      toStatus: h.toStatus,
      fromStatus: h.fromStatus,
      changedByName: h.changedByName,
      notes: h.notes,
      createdAt: h.createdAt.toISOString(),
    })),
  };
}

export { productVariants };
