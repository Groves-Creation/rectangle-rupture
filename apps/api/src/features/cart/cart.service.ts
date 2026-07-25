import { and, eq, sql } from "drizzle-orm";
import {
  type Database,
  cartLines,
  carts,
  casePacks,
  inventoryBalances,
  priceBookItems,
  priceBooks,
  productVariants,
  products,
  stores,
} from "@lit/database";
import { ApiError } from "../../lib/errors.js";
import { addMoney, compareMoney, multiplyMoney, ZERO_MONEY } from "../../lib/money.js";
import { resolveStoreWarehouse } from "../catalog/catalog.service.js";

/** Finds or creates the active cart for a (store, user) pair. */
export async function getOrCreateCart(db: Database, storeId: string, userId: string) {
  const [existing] = await db
    .select()
    .from(carts)
    .where(and(eq(carts.storeId, storeId), eq(carts.userId, userId), eq(carts.status, "active")))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(carts)
    .values({ storeId, userId, status: "active" })
    .returning();

  return created!;
}

/**
 * Builds the full cart view. Prices here are LIVE catalog prices — they are
 * only snapshotted at submit time, so a cart reflects current pricing right up
 * until the order is placed.
 */
export async function buildCartResponse(db: Database, storeId: string, userId: string) {
  const cart = await getOrCreateCart(db, storeId, userId);
  const warehouseId = await resolveStoreWarehouse(db, storeId);

  const [priceBook] = await db
    .select({ id: priceBooks.id })
    .from(priceBooks)
    .where(eq(priceBooks.isDefault, true))
    .limit(1);

  const rows = await db
    .select({
      id: cartLines.id,
      variantId: cartLines.productVariantId,
      unitType: cartLines.unitType,
      quantity: cartLines.quantity,
      name: products.name,
      variantName: productVariants.variantName,
      sku: productVariants.sku,
      imageUrl: productVariants.imageUrl,
      unitPrice: priceBookItems.unitPrice,
      casePrice: priceBookItems.casePrice,
      unitsPerPack: casePacks.unitsPerPack,
      available: inventoryBalances.available,
    })
    .from(cartLines)
    .innerJoin(productVariants, eq(productVariants.id, cartLines.productVariantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(
      priceBookItems,
      and(
        eq(priceBookItems.productVariantId, cartLines.productVariantId),
        eq(priceBookItems.priceBookId, priceBook?.id ?? sql`NULL`),
      ),
    )
    .leftJoin(
      casePacks,
      and(
        eq(casePacks.productVariantId, cartLines.productVariantId),
        eq(casePacks.unitType, cartLines.unitType),
      ),
    )
    .leftJoin(
      inventoryBalances,
      and(
        eq(inventoryBalances.productVariantId, cartLines.productVariantId),
        eq(inventoryBalances.locationId, warehouseId),
      ),
    )
    .where(eq(cartLines.cartId, cart.id));

  const lines = rows.map((r) => {
    const unitsPerPack = r.unitsPerPack ?? 1;
    const unitPrice = r.unitPrice ?? ZERO_MONEY;
    // A pack price is authoritative when present; otherwise derive it from the
    // unit price so a missing case price never silently prices at zero.
    const packPrice =
      r.unitType === "unit"
        ? unitPrice
        : (r.casePrice ?? multiplyMoney(unitPrice, unitsPerPack));

    const lineTotal = multiplyMoney(packPrice, r.quantity);
    const baseUnitsRequested = r.quantity * unitsPerPack;
    const available = r.available ?? 0;

    return {
      id: r.id,
      variantId: r.variantId,
      name: r.name,
      variantName: r.variantName,
      sku: r.sku,
      imageUrl: r.imageUrl,
      unitType: r.unitType,
      unitsPerPack,
      quantity: r.quantity,
      unitPrice,
      packPrice,
      lineTotal,
      availableAtWarehouse: available,
      exceedsAvailable: baseUnitsRequested > available,
    };
  });

  const subtotal = lines.length
    ? addMoney(...lines.map((l) => l.lineTotal))
    : ZERO_MONEY;

  const [store] = await db
    .select({ orderMinimum: stores.orderMinimum })
    .from(stores)
    .where(eq(stores.locationId, storeId))
    .limit(1);

  const orderMinimum = store?.orderMinimum ?? ZERO_MONEY;

  return {
    cartId: cart.id,
    storeId,
    lines,
    subtotal,
    orderMinimum,
    meetsMinimum: compareMoney(subtotal, orderMinimum) >= 0,
  };
}

export async function addLine(
  db: Database,
  storeId: string,
  userId: string,
  input: { variantId: string; unitType: "unit" | "box" | "case" | "display"; quantity: number },
) {
  const cart = await getOrCreateCart(db, storeId, userId);

  const [variant] = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, input.variantId))
    .limit(1);

  if (!variant || !variant.isActive) {
    throw ApiError.notFound("Product not found or inactive");
  }

  const [pack] = await db
    .select()
    .from(casePacks)
    .where(
      and(
        eq(casePacks.productVariantId, input.variantId),
        eq(casePacks.unitType, input.unitType),
      ),
    )
    .limit(1);

  if (!pack) {
    throw ApiError.validation(
      `This product cannot be ordered by ${input.unitType}. Choose a different pack size.`,
    );
  }

  if (input.quantity < variant.minimumOrderQuantity) {
    throw ApiError.validation(
      `Minimum order quantity for ${variant.sku} is ${variant.minimumOrderQuantity}`,
    );
  }

  await db
    .insert(cartLines)
    .values({
      cartId: cart.id,
      productVariantId: input.variantId,
      unitType: input.unitType,
      quantity: input.quantity,
    })
    .onConflictDoUpdate({
      target: [cartLines.cartId, cartLines.productVariantId, cartLines.unitType],
      set: { quantity: sql`${cartLines.quantity} + ${input.quantity}`, updatedAt: new Date() },
    });

  return buildCartResponse(db, storeId, userId);
}

export async function updateLine(
  db: Database,
  userId: string,
  lineId: string,
  quantity: number,
) {
  const [line] = await db
    .select({ cartId: cartLines.cartId, storeId: carts.storeId, ownerId: carts.userId })
    .from(cartLines)
    .innerJoin(carts, eq(carts.id, cartLines.cartId))
    .where(eq(cartLines.id, lineId))
    .limit(1);

  if (!line) throw ApiError.notFound("Cart line not found");
  if (line.ownerId !== userId) throw ApiError.forbidden("This cart belongs to another user");

  await db
    .update(cartLines)
    .set({ quantity, updatedAt: new Date() })
    .where(eq(cartLines.id, lineId));

  return buildCartResponse(db, line.storeId, userId);
}

export async function removeLine(db: Database, userId: string, lineId: string) {
  const [line] = await db
    .select({ storeId: carts.storeId, ownerId: carts.userId })
    .from(cartLines)
    .innerJoin(carts, eq(carts.id, cartLines.cartId))
    .where(eq(cartLines.id, lineId))
    .limit(1);

  if (!line) throw ApiError.notFound("Cart line not found");
  if (line.ownerId !== userId) throw ApiError.forbidden("This cart belongs to another user");

  await db.delete(cartLines).where(eq(cartLines.id, lineId));
}

export async function clearCart(db: Database, storeId: string, userId: string) {
  const cart = await getOrCreateCart(db, storeId, userId);
  await db.delete(cartLines).where(eq(cartLines.cartId, cart.id));
}
