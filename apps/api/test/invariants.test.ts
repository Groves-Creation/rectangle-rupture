import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { and, eq, sql } from "drizzle-orm";
import {
  InsufficientInventoryError,
  createDatabase,
  customerInvitations,
  customers,
  inventoryBalances,
  inventoryMovements,
  locations,
  priceBookItems,
  productVariants,
  recordMovement,
  stores,
  userLocationAccess,
  userRoles,
  users,
} from "@lit/database";
import { auth, loginAs, makeApp, type Session } from "./helpers.js";
import { addMoney, multiplyMoney, parseMoney } from "../src/lib/money.js";

/**
 * The gate. These tests cover the invariants the whole platform rests on.
 * If any of them fail, no amount of working UI makes the system trustworthy.
 */

let app: FastifyInstance;
let db: ReturnType<typeof createDatabase>;
let manager: Session;
let manager2: Session;
let hq: Session;

beforeAll(async () => {
  app = await makeApp();
  db = createDatabase(process.env.DATABASE_URL!);
  manager = await loginAs(app, "manager@lit.test");
  manager2 = await loginAs(app, "manager2@lit.test");
  hq = await loginAs(app, "hq@lit.test");
});

afterAll(async () => {
  await app.close();
  await db.$client.end();
});

/**
 * Drizzle wraps driver errors, so the Postgres message (and the trigger text
 * we care about) sits on `cause`, not on the wrapper. Assert against both.
 */
async function expectQueryToFail(promise: Promise<unknown>, pattern: RegExp) {
  let caught: unknown;
  try {
    await promise;
  } catch (error) {
    caught = error;
  }
  expect(caught, "expected the query to fail, but it succeeded").toBeDefined();
  const err = caught as { message?: string; cause?: { message?: string } };
  const combined = `${err.message ?? ""} ${err.cause?.message ?? ""}`;
  expect(combined).toMatch(pattern);
}

async function firstStoreId() {
  return manager.storeIds[0]!;
}

async function catalogItems(session: Session, storeId: string) {
  const res = await app.inject({
    method: "GET",
    url: `/api/catalog?storeId=${storeId}&limit=50`,
    headers: auth(session),
  });
  expect(res.statusCode).toBe(200);
  return res.json().items as Array<{
    variantId: string;
    sku: string;
    unitPrice: string;
    unitsPerCase: number;
    availableAtWarehouse: number;
  }>;
}

async function driftCount() {
  const rows = await db.execute(sql`SELECT COUNT(*)::int AS n FROM inventory_balance_drift`);
  return Number((rows as unknown as Array<{ n: number }>)[0]?.n ?? -1);
}

// ---------------------------------------------------------------------------

describe("money arithmetic", () => {
  it("multiplies without floating point error", () => {
    // 0.1 * 3 in float is 0.30000000000000004. Here it must be exact.
    expect(multiplyMoney("0.1000", 3)).toBe("0.3000");
    expect(multiplyMoney("3.5000", 12)).toBe("42.0000");
    expect(multiplyMoney("19.9900", 7)).toBe("139.9300");
  });

  it("adds a long list without drift", () => {
    const cents = Array.from({ length: 100 }, () => "0.0100");
    expect(addMoney(...cents)).toBe("1.0000");
  });

  it("rejects malformed money", () => {
    expect(() => parseMoney("12.5")).not.toThrow(); // 1-4 decimals allowed
    expect(() => parseMoney("abc")).toThrow();
    expect(() => parseMoney("1.234567")).toThrow();
  });
});

describe("ledger is append-only at the database level", () => {
  it("rejects UPDATE on inventory_movements", async () => {
    await expectQueryToFail(
      db.execute(sql`UPDATE inventory_movements SET quantity = 999
                     WHERE id = (SELECT id FROM inventory_movements LIMIT 1)`),
      /append-only/i,
    );
  });

  it("rejects DELETE on inventory_movements", async () => {
    await expectQueryToFail(
      db.execute(sql`DELETE FROM inventory_movements
                     WHERE id = (SELECT id FROM inventory_movements LIMIT 1)`),
      /append-only/i,
    );
  });

  it("rejects a movement whose arithmetic does not add up", async () => {
    await expectQueryToFail(
      db.execute(sql`
        INSERT INTO inventory_movements
          (product_variant_id, location_id, movement_type, quantity, previous_balance, resulting_balance)
        SELECT product_variant_id, location_id, 'manual_correction', 5, 10, 99
        FROM inventory_movements LIMIT 1`),
      /arithmetic_consistent/i,
    );
  });

  it("rejects a zero-quantity movement", async () => {
    const [variant] = await db.select().from(productVariants).limit(1);
    const [balance] = await db.select().from(inventoryBalances).limit(1);

    await expect(
      db.transaction(async (tx) =>
        recordMovement(tx, {
          productVariantId: variant!.id,
          locationId: balance!.locationId,
          movementType: "manual_correction",
          quantity: 0,
        }),
      ),
    ).rejects.toThrow(/zero/i);
  });
});

describe("inventory cannot go negative", () => {
  it("throws InsufficientInventoryError instead of clamping", async () => {
    const [balance] = await db.select().from(inventoryBalances).limit(1);
    const excessive = (balance!.available ?? 0) + 1_000_000;

    await expect(
      db.transaction(async (tx) =>
        recordMovement(tx, {
          productVariantId: balance!.productVariantId,
          locationId: balance!.locationId,
          movementType: "order_allocation",
          quantity: excessive,
          balanceColumn: "allocated",
        }),
      ),
    ).rejects.toThrow(InsufficientInventoryError);
  });

  it("leaves the balance untouched after a rejected movement", async () => {
    const [before] = await db.select().from(inventoryBalances).limit(1);

    await db
      .transaction(async (tx) =>
        recordMovement(tx, {
          productVariantId: before!.productVariantId,
          locationId: before!.locationId,
          movementType: "shrink",
          quantity: -(before!.onHand + 500),
        }),
      )
      .catch(() => undefined);

    const [after] = await db
      .select()
      .from(inventoryBalances)
      .where(eq(inventoryBalances.id, before!.id));

    expect(after!.onHand).toBe(before!.onHand);
    expect(await driftCount()).toBe(0);
  });
});

describe("authentication", () => {
  it("rotates the refresh token and invalidates the old one", async () => {
    const session = await loginAs(app, "manager@lit.test");

    const first = await app.inject({
      method: "POST",
      url: "/api/auth/refresh",
      payload: { refreshToken: session.refreshToken },
    });
    expect(first.statusCode).toBe(200);
    expect(first.json().refreshToken).not.toBe(session.refreshToken);

    // Replaying the original token must fail.
    const replay = await app.inject({
      method: "POST",
      url: "/api/auth/refresh",
      payload: { refreshToken: session.refreshToken },
    });
    expect(replay.statusCode).toBe(401);
  });

  it("revokes the whole session family when a consumed token is replayed", async () => {
    const session = await loginAs(app, "manager2@lit.test");

    const rotated = await app.inject({
      method: "POST",
      url: "/api/auth/refresh",
      payload: { refreshToken: session.refreshToken },
    });
    const freshToken = rotated.json().refreshToken as string;

    // Replay the dead token — this should burn everything, including the
    // perfectly valid token issued a moment ago.
    await app.inject({
      method: "POST",
      url: "/api/auth/refresh",
      payload: { refreshToken: session.refreshToken },
    });

    const afterBreach = await app.inject({
      method: "POST",
      url: "/api/auth/refresh",
      payload: { refreshToken: freshToken },
    });
    expect(afterBreach.statusCode).toBe(401);
  });

  it("rejects a request with no token", async () => {
    const res = await app.inject({ method: "GET", url: "/api/auth/me" });
    expect(res.statusCode).toBe(401);
  });
});

describe("location-based access control", () => {
  it("forbids reading a catalog for a store the user cannot access", async () => {
    const storeId = await firstStoreId();
    // manager2 only has access to STR-002; manager.storeIds[0] is STR-001.
    const res = await app.inject({
      method: "GET",
      url: `/api/catalog?storeId=${storeId}`,
      headers: auth(manager2),
    });
    expect(res.statusCode).toBe(403);
  });

  it("does not leak other stores' orders when storeId is omitted", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/orders",
      headers: auth(manager2),
    });
    expect(res.statusCode).toBe(200);
    const storeIds = new Set(res.json().items.map((o: { storeId: string }) => o.storeId));
    for (const id of storeIds) {
      expect(manager2.storeIds).toContain(id);
    }
  });
});

describe("catalog product ingest", () => {
  it("lets HQ create an orderable product with opening stock and an image", async () => {
    const metadata = await app.inject({
      method: "GET",
      url: "/api/catalog/ingest-metadata",
      headers: auth(hq),
    });
    expect(metadata.statusCode).toBe(200);
    const warehouseId = metadata.json().warehouses[0]?.id as string;
    expect(warehouseId).toBeTruthy();

    const suffix = Date.now().toString();
    const sku = `INGEST-${suffix}`;
    const created = await app.inject({
      method: "POST",
      url: "/api/catalog",
      headers: auth(hq),
      payload: {
        name: "API Ingest Test Product",
        description: "Created by the catalog ingest invariant test",
        brandName: "Ingest Test Brand",
        categoryName: "Ingest Test Category",
        sku,
        variantName: "Single",
        barcode: `TEST${suffix}`,
        barcodeType: "UPC",
        unitPrice: "3.2500",
        casePrice: "36.0000",
        unitsPerCase: 12,
        minimumOrderQuantity: 1,
        warehouseId,
        initialStock: 24,
        isAgeRestricted: false,
        image: {
          fileName: "pixel.png",
          contentType: "image/png",
          base64:
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        },
      },
    });
    expect(created.statusCode).toBe(201);
    expect(created.json().sku).toBe(sku);
    expect(created.json().imageUrl).toMatch(/\/api\/catalog\/images\/.+\.png$/);

    const imagePath = new URL(created.json().imageUrl as string).pathname;
    const image = await app.inject({ method: "GET", url: imagePath });
    expect(image.statusCode).toBe(200);
    expect(image.headers["content-type"]).toContain("image/png");

    const items = await catalogItems(manager, await firstStoreId());
    const item = items.find((candidate) => candidate.sku === sku);
    expect(item).toMatchObject({
      unitPrice: "3.2500",
      unitsPerCase: 12,
      availableAtWarehouse: 24,
    });
    expect(await driftCount()).toBe(0);
  });

  it("forbids store managers from writing the catalog", async () => {
    const deniedMetadata = await app.inject({
      method: "GET",
      url: "/api/catalog/ingest-metadata",
      headers: auth(manager),
    });
    expect(deniedMetadata.statusCode).toBe(403);

    const allowedMetadata = await app.inject({
      method: "GET",
      url: "/api/catalog/ingest-metadata",
      headers: auth(hq),
    });
    const warehouseId = allowedMetadata.json().warehouses[0]?.id as string;

    const created = await app.inject({
      method: "POST",
      url: "/api/catalog",
      headers: auth(manager),
      payload: {
        name: "Forbidden Product",
        sku: `FORBIDDEN-${Date.now()}`,
        unitPrice: "1.0000",
        unitsPerCase: 1,
        minimumOrderQuantity: 1,
        warehouseId,
        initialStock: 0,
        isAgeRestricted: false,
      },
    });
    expect(created.statusCode).toBe(403);
  });

  it("rejects an image whose bytes do not match its content type", async () => {
    const metadata = await app.inject({
      method: "GET",
      url: "/api/catalog/ingest-metadata",
      headers: auth(hq),
    });
    const warehouseId = metadata.json().warehouses[0]?.id as string;

    const created = await app.inject({
      method: "POST",
      url: "/api/catalog",
      headers: auth(hq),
      payload: {
        name: "Bad Image Product",
        sku: `BAD-IMAGE-${Date.now()}`,
        unitPrice: "1.0000",
        unitsPerCase: 1,
        minimumOrderQuantity: 1,
        warehouseId,
        initialStock: 0,
        isAgeRestricted: false,
        image: {
          fileName: "not-really.png",
          contentType: "image/png",
          base64: Buffer.from("not an image").toString("base64"),
        },
      },
    });
    expect(created.statusCode).toBe(400);
    expect(created.json().error.code).toBe("VALIDATION_ERROR");
  });

  it("excludes inactive warehouses and refuses opening inventory against them", async () => {
    const metadataBefore = await app.inject({
      method: "GET",
      url: "/api/catalog/ingest-metadata",
      headers: auth(hq),
    });
    expect(metadataBefore.statusCode).toBe(200);
    const warehouseId = metadataBefore.json().warehouses[0]?.id as string;
    expect(warehouseId).toBeTruthy();

    const sku = `INACTIVE-WH-${Date.now()}`;
    await db
      .update(locations)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(locations.id, warehouseId));

    try {
      const metadataAfter = await app.inject({
        method: "GET",
        url: "/api/catalog/ingest-metadata",
        headers: auth(hq),
      });
      expect(metadataAfter.statusCode).toBe(200);
      expect(
        metadataAfter
          .json()
          .warehouses.some((warehouse: { id: string }) => warehouse.id === warehouseId),
      ).toBe(false);

      const created = await app.inject({
        method: "POST",
        url: "/api/catalog",
        headers: auth(hq),
        payload: {
          name: "Inactive Warehouse Product",
          sku,
          unitPrice: "1.0000",
          unitsPerCase: 1,
          minimumOrderQuantity: 1,
          warehouseId,
          initialStock: 10,
          isAgeRestricted: false,
        },
      });
      expect(created.statusCode).toBe(400);
      expect(created.json().error).toMatchObject({
        code: "VALIDATION_ERROR",
        message: expect.stringMatching(/inactive/i),
      });

      const [variant] = await db
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(eq(productVariants.sku, sku))
        .limit(1);
      expect(variant).toBeUndefined();
      expect(await driftCount()).toBe(0);
    } finally {
      await db
        .update(locations)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(locations.id, warehouseId));
    }
  });
});

describe("order submission", () => {
  it("is idempotent under a replayed Idempotency-Key", async () => {
    const storeId = await firstStoreId();
    const items = await catalogItems(manager, storeId);

    await app.inject({
      method: "DELETE",
      url: `/api/cart?storeId=${storeId}`,
      headers: auth(manager),
    });

    // Enough volume to clear the store's $100 minimum.
    for (const item of items.slice(0, 3)) {
      await app.inject({
        method: "POST",
        url: "/api/cart/lines",
        headers: auth(manager),
        payload: { storeId, variantId: item.variantId, unitType: "case", quantity: 2 },
      });
    }

    const key = `idem-${Date.now()}`;
    const payload = { storeId };

    const first = await app.inject({
      method: "POST",
      url: "/api/orders",
      headers: { ...auth(manager), "idempotency-key": key },
      payload,
    });
    expect(first.statusCode).toBe(201);

    const replay = await app.inject({
      method: "POST",
      url: "/api/orders",
      headers: { ...auth(manager), "idempotency-key": key },
      payload,
    });
    expect(replay.statusCode).toBe(201);

    // Same order, not a second one.
    expect(replay.json().order.id).toBe(first.json().order.id);
    expect(replay.json().order.orderNumber).toBe(first.json().order.orderNumber);
  });

  it("rejects a submission with no Idempotency-Key", async () => {
    const storeId = await firstStoreId();
    const res = await app.inject({
      method: "POST",
      url: "/api/orders",
      headers: auth(manager),
      payload: { storeId },
    });
    expect(res.statusCode).toBe(400);
  });

  it("refuses to submit an empty cart", async () => {
    const storeId = await firstStoreId();
    await app.inject({
      method: "DELETE",
      url: `/api/cart?storeId=${storeId}`,
      headers: auth(manager),
    });

    const res = await app.inject({
      method: "POST",
      url: "/api/orders",
      headers: { ...auth(manager), "idempotency-key": `empty-${Date.now()}` },
      payload: { storeId },
    });
    expect([400, 422]).toContain(res.statusCode);
  });
});

describe("submitted prices are immutable", () => {
  it("does not change an order's line prices when the catalog price changes", async () => {
    const storeId = await firstStoreId();
    const items = await catalogItems(manager, storeId);
    const target = items[0]!;

    await app.inject({
      method: "DELETE",
      url: `/api/cart?storeId=${storeId}`,
      headers: auth(manager),
    });
    for (const item of items.slice(0, 3)) {
      await app.inject({
        method: "POST",
        url: "/api/cart/lines",
        headers: auth(manager),
        payload: { storeId, variantId: item.variantId, unitType: "case", quantity: 3 },
      });
    }

    const submitted = await app.inject({
      method: "POST",
      url: "/api/orders",
      headers: { ...auth(manager), "idempotency-key": `price-${Date.now()}` },
      payload: { storeId },
    });
    expect(submitted.statusCode).toBe(201);

    const orderId = submitted.json().order.id as string;
    const originalTotal = submitted.json().order.orderTotal as string;
    const originalLine = submitted
      .json()
      .order.lines.find((l: { variantId: string }) => l.variantId === target.variantId);

    // Triple the catalog price after the fact.
    await db
      .update(priceBookItems)
      .set({ unitPrice: multiplyMoney(target.unitPrice, 3) })
      .where(eq(priceBookItems.productVariantId, target.variantId));

    const reread = await app.inject({
      method: "GET",
      url: `/api/orders/${orderId}`,
      headers: auth(manager),
    });
    expect(reread.statusCode).toBe(200);
    expect(reread.json().orderTotal).toBe(originalTotal);

    const rereadLine = reread
      .json()
      .lines.find((l: { variantId: string }) => l.variantId === target.variantId);
    expect(rereadLine.unitPrice).toBe(originalLine.unitPrice);
    expect(rereadLine.lineTotal).toBe(originalLine.lineTotal);

    // Restore so later tests see the seeded price.
    await db
      .update(priceBookItems)
      .set({ unitPrice: target.unitPrice })
      .where(eq(priceBookItems.productVariantId, target.variantId));
  });
});

describe("approval allocates inventory through the ledger", () => {
  it("moves stock from available to allocated and records a movement", async () => {
    const storeId = await firstStoreId();
    const items = await catalogItems(manager, storeId);
    const target = items.find((i) => i.availableAtWarehouse > 100)!;

    await app.inject({
      method: "DELETE",
      url: `/api/cart?storeId=${storeId}`,
      headers: auth(manager),
    });
    await app.inject({
      method: "POST",
      url: "/api/cart/lines",
      headers: auth(manager),
      payload: { storeId, variantId: target.variantId, unitType: "case", quantity: 4 },
    });

    const [balanceBefore] = await db
      .select()
      .from(inventoryBalances)
      .where(eq(inventoryBalances.productVariantId, target.variantId));

    const submitted = await app.inject({
      method: "POST",
      url: "/api/orders",
      headers: { ...auth(manager), "idempotency-key": `alloc-${Date.now()}` },
      payload: { storeId },
    });
    expect(submitted.statusCode).toBe(201);
    const orderId = submitted.json().order.id as string;
    const lineId = submitted.json().order.lines[0].id as string;

    // Allocation must NOT happen at submit time.
    const [balanceAfterSubmit] = await db
      .select()
      .from(inventoryBalances)
      .where(eq(inventoryBalances.productVariantId, target.variantId));
    expect(balanceAfterSubmit!.allocated).toBe(balanceBefore!.allocated);

    const forbiddenAdjustment = await app.inject({
      method: "POST",
      url: `/api/orders/${orderId}/adjust`,
      headers: auth(manager),
      payload: {
        reason: "A store manager cannot rewrite a submitted order",
        lines: [{ lineId, quantityOrdered: 2 }],
      },
    });
    expect(forbiddenAdjustment.statusCode).toBe(403);

    const removeEveryLine = await app.inject({
      method: "POST",
      url: `/api/orders/${orderId}/adjust`,
      headers: auth(hq),
      payload: {
        reason: "Invalid attempt to empty the order",
        lines: [{ lineId, quantityOrdered: 0 }],
      },
    });
    expect(removeEveryLine.statusCode).toBe(400);

    const adjusted = await app.inject({
      method: "POST",
      url: `/api/orders/${orderId}/adjust`,
      headers: auth(hq),
      payload: {
        reason: "Store confirmed a lower quantity",
        lines: [{ lineId, quantityOrdered: 2 }],
      },
    });
    expect(adjusted.statusCode).toBe(200);
    expect(adjusted.json().lines[0].quantityOrdered).toBe(2);
    expect(adjusted.json().orderTotal).toBe(adjusted.json().lines[0].lineTotal);
    expect(adjusted.json().statusHistory.at(-1).notes).toContain("Order adjusted");

    const approved = await app.inject({
      method: "POST",
      url: `/api/orders/${orderId}/approve`,
      headers: auth(hq),
      payload: {},
    });
    expect(approved.statusCode).toBe(200);
    expect(approved.json().status).toBe("inventory_allocated");

    const expectedUnits = 2 * target.unitsPerCase;

    const [balanceAfter] = await db
      .select()
      .from(inventoryBalances)
      .where(eq(inventoryBalances.productVariantId, target.variantId));

    expect(balanceAfter!.allocated).toBe(balanceBefore!.allocated + expectedUnits);
    // On-hand must be untouched: allocation reserves, it does not ship.
    expect(balanceAfter!.onHand).toBe(balanceBefore!.onHand);
    expect(balanceAfter!.available).toBe((balanceBefore!.available ?? 0) - expectedUnits);

    // The ledger must explain the change (spec section 23).
    const movements = await db
      .select()
      .from(inventoryMovements)
      .where(
        and(
          eq(inventoryMovements.relatedOrderId, orderId),
          eq(inventoryMovements.productVariantId, target.variantId),
        ),
      );

    expect(movements).toHaveLength(1);
    const movement = movements[0]!;
    expect(movement.movementType).toBe("order_allocation");
    expect(movement.balanceColumn).toBe("allocated");
    expect(movement.quantity).toBe(expectedUnits);
    expect(movement.resultingBalance).toBe(movement.previousBalance + expectedUnits);
    expect(movement.userId).toBeTruthy();

    expect(await driftCount()).toBe(0);
  });

  it("returns status history in true chronological order", async () => {
    // Regression: history used to sort by created_at, which broke twice over.
    // Postgres now() is transaction-stable so the two rows written during
    // approval tied, and the API server clock drifts from the database clock
    // (~1s in local Docker), which could sort submit *after* approval.
    const list = await app.inject({
      method: "GET",
      url: "/api/orders?status=inventory_allocated&limit=1",
      headers: auth(hq),
    });
    const orderId = list.json().items[0]?.id;
    expect(orderId).toBeTruthy();

    const detail = await app.inject({
      method: "GET",
      url: `/api/orders/${orderId}`,
      headers: auth(hq),
    });

    const statuses = detail.json().statusHistory.map((h: { toStatus: string }) => h.toStatus);
    expect(statuses[0]).toBe("submitted");
    expect(statuses.indexOf("approved")).toBeLessThan(statuses.indexOf("inventory_allocated"));

    // Each entry's fromStatus must chain to the previous entry's toStatus.
    const history = detail.json().statusHistory as Array<{
      fromStatus: string | null;
      toStatus: string;
    }>;
    for (let i = 1; i < history.length; i += 1) {
      expect(history[i]!.fromStatus).toBe(history[i - 1]!.toStatus);
    }
  });

  it("forbids approval by a user without orders.approve", async () => {
    const list = await app.inject({
      method: "GET",
      url: "/api/orders?limit=1",
      headers: auth(manager),
    });
    const orderId = list.json().items[0]?.id;
    expect(orderId).toBeTruthy();

    const res = await app.inject({
      method: "POST",
      url: `/api/orders/${orderId}/approve`,
      headers: auth(manager),
      payload: {},
    });
    expect(res.statusCode).toBe(403);
  });

  it("cannot approve the same order twice", async () => {
    const list = await app.inject({
      method: "GET",
      url: "/api/orders?status=inventory_allocated&limit=1",
      headers: auth(hq),
    });
    const orderId = list.json().items[0]?.id;
    expect(orderId).toBeTruthy();

    const res = await app.inject({
      method: "POST",
      url: `/api/orders/${orderId}/approve`,
      headers: auth(hq),
      payload: {},
    });
    expect(res.statusCode).toBe(422);
    expect(await driftCount()).toBe(0);
  });
});

describe("customer onboarding is durable and atomic", () => {
  it("restricts customer workspace access to HQ customer managers", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/customers",
      headers: auth(manager),
    });
    expect(res.statusCode).toBe(403);
  });

  it("creates the customer, store, scoped user, and invitation together", async () => {
    const optionsResponse = await app.inject({
      method: "GET",
      url: "/api/customers/setup-options",
      headers: auth(hq),
    });
    expect(optionsResponse.statusCode).toBe(200);
    const options = optionsResponse.json();
    const warehouseId = options.warehouses[0]?.id as string;
    const priceBookId = options.priceBooks[0]?.id as string;
    expect(warehouseId).toBeTruthy();
    expect(priceBookId).toBeTruthy();

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/customers",
      headers: auth(hq),
      payload: {
        businessName: "Juniper Market Group",
        accountCode: "JMG-01",
        businessType: "Independent retailer",
        contactEmail: "operations@juniper.test",
        contactPhone: "(303) 555-0142",
        locationName: "Pearl Street",
        address: "1420 Pearl Street",
        city: "Boulder",
        state: "CO",
        postalCode: "80302",
        timezone: "America/Denver",
        warehouseId,
        priceBookId,
        orderMinimum: "250.0000",
        paymentTerms: "Net 30",
        deliveryDays: ["Tuesday", "Friday"],
        orderNotes: "Receiving entrance on Walnut Street",
        inviteName: "Taylor Morgan",
        inviteEmail: "taylor@juniper.test",
        inviteRole: "store_manager",
        sendWelcome: true,
      },
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json().customer;
    expect(created.name).toBe("Juniper Market Group");
    expect(created.status).toBe("invite_pending");
    expect(created.location.name).toBe("Pearl Street");
    expect(created.manager.email).toBe("taylor@juniper.test");
    expect(created.invitation.status).toBe("pending");

    const [customerRow] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, created.id));
    expect(customerRow?.primaryContactEmail).toBe("operations@juniper.test");

    const [storeRow] = await db
      .select({
        customerId: stores.customerId,
        priceBookId: stores.priceBookId,
        locationCode: locations.code,
      })
      .from(stores)
      .innerJoin(locations, eq(locations.id, stores.locationId))
      .where(eq(stores.customerId, created.id));
    expect(storeRow).toMatchObject({
      customerId: created.id,
      priceBookId,
      locationCode: "JMG-01",
    });

    const [userRow] = await db
      .select()
      .from(users)
      .where(eq(users.email, "taylor@juniper.test"));
    expect(userRow?.isActive).toBe(false);

    const [invitationRow] = await db
      .select()
      .from(customerInvitations)
      .where(eq(customerInvitations.customerId, created.id));
    expect(invitationRow?.userId).toBe(userRow?.id);
    expect(invitationRow?.deliveryRequested).toBe(true);
    expect(invitationRow?.tokenHash).toMatch(/^[a-f0-9]{64}$/);

    const [roleAssignment] = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, userRow!.id));
    const [locationAssignment] = await db
      .select()
      .from(userLocationAccess)
      .where(eq(userLocationAccess.userId, userRow!.id));
    const [hqLocationAssignment] = await db
      .select()
      .from(userLocationAccess)
      .where(
        and(
          eq(userLocationAccess.userId, hq.userId),
          eq(userLocationAccess.locationId, created.location.id),
        ),
      );
    expect(roleAssignment).toBeDefined();
    expect(locationAssignment?.locationId).toBe(created.location.id);
    expect(hqLocationAssignment).toBeDefined();

    const workspaceResponse = await app.inject({
      method: "GET",
      url: "/api/customers",
      headers: auth(hq),
    });
    expect(workspaceResponse.statusCode).toBe(200);
    expect(
      workspaceResponse
        .json()
        .items.some((item: { id: string }) => item.id === created.id),
    ).toBe(true);
    expect(workspaceResponse.json().metrics.pendingInvitations).toBeGreaterThan(0);
  });

  it("does not create a partial account when a uniqueness check fails", async () => {
    const optionsResponse = await app.inject({
      method: "GET",
      url: "/api/customers/setup-options",
      headers: auth(hq),
    });
    const options = optionsResponse.json();

    const response = await app.inject({
      method: "POST",
      url: "/api/customers",
      headers: auth(hq),
      payload: {
        businessName: "Duplicate Juniper",
        accountCode: "JMG-01",
        businessType: "Independent retailer",
        contactEmail: "other@juniper.test",
        locationName: "Second Store",
        address: "1 Main Street",
        city: "Boulder",
        state: "CO",
        postalCode: "80301",
        timezone: "America/Denver",
        warehouseId: options.warehouses[0].id,
        priceBookId: options.priceBooks[0].id,
        orderMinimum: "100.0000",
        paymentTerms: "Net 30",
        deliveryDays: ["Monday"],
        inviteName: "Other Manager",
        inviteEmail: "other-manager@juniper.test",
        inviteRole: "store_manager",
        sendWelcome: false,
      },
    });

    expect(response.statusCode).toBe(409);
    const [partialUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, "other-manager@juniper.test"));
    expect(partialUser).toBeUndefined();
  });
});

describe("ledger and cache never diverge", () => {
  it("reports zero drift rows after the entire suite", async () => {
    expect(await driftCount()).toBe(0);
  });
});
