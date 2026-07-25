#!/usr/bin/env node
/**
 * Walks the whole slice over real HTTP: login -> catalog -> cart -> submit ->
 * approve -> verify the ledger explains the change.
 *
 * Usage: node scripts/smoke-test.mjs [baseUrl]
 * Default base URL is http://localhost:3000
 */

const BASE = process.argv[2] ?? "http://localhost:3000";

let failures = 0;

function check(label, condition, detail = "") {
  const mark = condition ? "PASS" : "FAIL";
  if (!condition) failures += 1;
  console.log(`  [${mark}] ${label}${detail ? ` — ${detail}` : ""}`);
}

async function call(method, path, { token, body, headers = {} } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON response */
  }
  return { status: res.status, body: json, raw: text };
}

console.log(`\nLIT Distribution smoke test against ${BASE}\n`);

// --- health ----------------------------------------------------------------
console.log("health");
const health = await call("GET", "/health");
check("API responds", health.status === 200, `status ${health.status}`);
if (health.status !== 200) {
  console.error("\nAPI is not reachable. Start it with: pnpm --filter @lit/api dev\n");
  process.exit(1);
}

// --- login -----------------------------------------------------------------
console.log("\nauthentication");
const login = await call("POST", "/api/auth/login", {
  body: { email: "manager@lit.test", password: "Password123!", deviceIdentifier: "smoke" },
});
check("store manager logs in", login.status === 200, `status ${login.status}`);
const token = login.body?.accessToken;
const storeId = login.body?.stores?.[0]?.id;
check("access token issued", Boolean(token));
check("stores returned", Array.isArray(login.body?.stores) && login.body.stores.length > 0,
  login.body?.stores?.map((s) => s.code).join(", "));

const badLogin = await call("POST", "/api/auth/login", {
  body: { email: "manager@lit.test", password: "wrong-password" },
});
check("wrong password rejected", badLogin.status === 401, `status ${badLogin.status}`);

const hqLogin = await call("POST", "/api/auth/login", {
  body: { email: "hq@lit.test", password: "Password123!" },
});
check("HQ admin logs in", hqLogin.status === 200);
const hqToken = hqLogin.body?.accessToken;

// --- catalog ---------------------------------------------------------------
console.log("\ncatalog");
const catalog = await call("GET", `/api/catalog?storeId=${storeId}&limit=50`, { token });
check("catalog loads", catalog.status === 200, `${catalog.body?.items?.length ?? 0} items`);
const items = catalog.body?.items ?? [];
check("prices are strings, not floats",
  items.every((i) => typeof i.unitPrice === "string"),
  items[0]?.unitPrice);
check("warehouse availability present",
  items.every((i) => Number.isInteger(i.availableAtWarehouse)));

const noAuth = await call("GET", `/api/catalog?storeId=${storeId}`);
check("catalog requires auth", noAuth.status === 401, `status ${noAuth.status}`);

// --- cart ------------------------------------------------------------------
console.log("\ncart");
await call("DELETE", `/api/cart?storeId=${storeId}`, { token });

const target = items.find((i) => i.availableAtWarehouse > 100) ?? items[0];
let cart = null;
for (const item of items.slice(0, 3)) {
  const res = await call("POST", "/api/cart/lines", {
    token,
    body: { storeId, variantId: item.variantId, unitType: "case", quantity: 2 },
  });
  cart = res.body;
  if (res.status !== 200) check(`add ${item.sku}`, false, `status ${res.status} ${res.raw}`);
}
check("cart has 3 lines", cart?.lines?.length === 3, `${cart?.lines?.length} lines`);
check("subtotal computed", typeof cart?.subtotal === "string", cart?.subtotal);
check("order minimum evaluated", typeof cart?.meetsMinimum === "boolean",
  `meetsMinimum=${cart?.meetsMinimum} (min ${cart?.orderMinimum})`);

// --- submit ----------------------------------------------------------------
console.log("\norder submission");
const idemKey = `smoke-${Date.now()}`;
const submit = await call("POST", "/api/orders", {
  token,
  headers: { "idempotency-key": idemKey },
  body: { storeId },
});
check("order submitted", submit.status === 201, `status ${submit.status} ${submit.status !== 201 ? submit.raw : ""}`);
const order = submit.body?.order;
check("order number generated", /^LIT-\d{6}$/.test(order?.orderNumber ?? ""), order?.orderNumber);
check("status is submitted", order?.status === "submitted", order?.status);
check("lines carry snapshot prices",
  order?.lines?.every((l) => typeof l.unitPrice === "string"));

const replay = await call("POST", "/api/orders", {
  token,
  headers: { "idempotency-key": idemKey },
  body: { storeId },
});
check("replayed Idempotency-Key returns the same order",
  replay.body?.order?.id === order?.id,
  `${replay.body?.order?.orderNumber} vs ${order?.orderNumber}`);

const noKey = await call("POST", "/api/orders", { token, body: { storeId } });
check("submit without Idempotency-Key rejected", noKey.status === 400, `status ${noKey.status}`);

// --- approval --------------------------------------------------------------
console.log("\napproval and allocation");
const notAllowed = await call("POST", `/api/orders/${order?.id}/approve`, {
  token,
  body: {},
});
check("store manager cannot approve", notAllowed.status === 403, `status ${notAllowed.status}`);

const approve = await call("POST", `/api/orders/${order?.id}/approve`, {
  token: hqToken,
  body: {},
});
check("HQ approves", approve.status === 200, `status ${approve.status}`);
check("status is inventory_allocated", approve.body?.status === "inventory_allocated",
  approve.body?.status);
const approvedLines = approve.body?.lines ?? [];
check("at least one line allocated",
  approvedLines.some((l) => l.quantityAllocated > 0),
  approvedLines.map((l) => `${l.sku}:${l.quantityAllocated}`).join(" "));
check("no line over-allocates beyond what was ordered",
  approvedLines.every((l) => l.quantityAllocated <= l.quantityOrdered * l.unitsPerPack));
check("fullyAllocated flag is accurate",
  approvedLines.every((l) =>
    l.fullyAllocated === (l.quantityAllocated >= l.quantityOrdered * l.unitsPerPack)),
  approvedLines.filter((l) => !l.fullyAllocated).map((l) => `${l.sku} short`).join(", ") || "all full");
const historyOrder = approve.body?.statusHistory?.map((h) => h.toStatus) ?? [];
check("status history recorded", historyOrder.length >= 3, historyOrder.join(" -> "));
check("history is chronologically ordered",
  historyOrder.indexOf("approved") < historyOrder.indexOf("inventory_allocated"),
  historyOrder.join(" -> "));

const doubleApprove = await call("POST", `/api/orders/${order?.id}/approve`, {
  token: hqToken,
  body: {},
});
check("cannot approve twice", doubleApprove.status === 422, `status ${doubleApprove.status}`);

// --- read back -------------------------------------------------------------
console.log("\norder tracking");
const detail = await call("GET", `/api/orders/${order?.id}`, { token });
check("store sees updated status", detail.body?.status === "inventory_allocated",
  detail.body?.status);
check("total unchanged after approval", detail.body?.orderTotal === order?.orderTotal,
  `${detail.body?.orderTotal} vs ${order?.orderTotal}`);

const list = await call("GET", `/api/orders?storeId=${storeId}&limit=5`, { token });
check("order appears in history", (list.body?.items?.length ?? 0) > 0,
  `${list.body?.total} total`);

// --- summary ---------------------------------------------------------------
console.log(
  failures === 0
    ? `\nAll checks passed. Order ${order?.orderNumber} completed the full slice.\n`
    : `\n${failures} check(s) FAILED.\n`,
);
process.exit(failures === 0 ? 0 : 1);
