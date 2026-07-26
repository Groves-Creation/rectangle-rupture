# API Contract — Walking Skeleton

**Authoritative.** The API, the admin dashboard, and the Flutter app all build
against this document. If an implementation disagrees with this file, this file
wins — raise the discrepancy rather than diverging.

Base URL comes from configuration, never hardcoded.
- API local: `http://localhost:3000`
- Device (Wi-Fi LAN): `http://192.168.1.144:3000`
- Device (Tailscale): `http://100.88.157.98:3000`

All requests and responses are `application/json`. All timestamps are ISO 8601
UTC strings. All money values are **strings** with 4 decimal places (e.g.
`"12.5000"`) — never floats, never numbers. All IDs are UUID strings.

## Conventions

Authenticated requests send `Authorization: Bearer <accessToken>`.

Errors use a single shape, HTTP status carrying the category:

```json
{ "error": { "code": "INSUFFICIENT_INVENTORY", "message": "human readable" } }
```

Known codes: `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401),
`FORBIDDEN` (403), `NOT_FOUND` (404), `IDEMPOTENCY_KEY_REUSED` (409),
`INSUFFICIENT_INVENTORY` (409), `CUTOFF_PASSED` (422), `RATE_LIMITED` (429).

---

## Auth

### POST /api/auth/login
```json
// request
{ "email": "manager@lit.test", "password": "...", "deviceIdentifier": "optional-string" }
// 200
{
  "accessToken": "jwt",
  "refreshToken": "opaque",
  "expiresIn": 900,
  "user": { "id": "uuid", "email": "...", "fullName": "...", "roles": ["store_manager"] },
  "stores": [ { "id": "uuid", "code": "STR-001", "name": "Downtown", "type": "store" } ]
}
```
`stores` is every location the user may act on. A user with more than one must
pick before ordering.

### POST /api/auth/refresh
```json
{ "refreshToken": "opaque" }
// 200 -> same shape as login (tokens rotate; the old refresh token is dead)
```
Presenting an already-consumed refresh token revokes the entire session family
and returns 401.

### POST /api/auth/logout
```json
{ "refreshToken": "opaque" }   // 204
```

### GET /api/auth/me
```json
// 200
{ "user": { "id": "uuid", "email": "...", "fullName": "...", "roles": ["..."] },
  "stores": [ /* as above */ ] }
```

---

## Catalog

### GET /api/catalog?storeId=<uuid>&search=<string>&categoryId=<uuid>&limit=50&offset=0
```json
// 200
{
  "items": [
    {
      "variantId": "uuid",
      "productId": "uuid",
      "name": "Product Name",
      "variantName": "Blue Razz",
      "sku": "SKU-0001",
      "brandName": "Brand",
      "categoryName": "Category",
      "imageUrl": "https://... or null",
      "unitPrice": "3.5000",
      "casePrice": "38.0000",
      "unitsPerCase": 12,
      "minimumOrderQuantity": 1,
      "availableAtWarehouse": 240,
      "isAgeRestricted": false
    }
  ],
  "total": 8,
  "limit": 50,
  "offset": 0
}
```

### GET /api/catalog/:variantId?storeId=<uuid>
Returns a single item in the same shape, plus:
```json
{ "description": "...", "barcodes": ["012345678905"], "warehouseId": "uuid" }
```

### GET /api/catalog/ingest-metadata   (permission `catalog.write`)
Returns the active brand/category suggestions and warehouses available to the
signed-in user's organization:
```json
{
  "brands": ["Brand"],
  "categories": ["Gummies"],
  "warehouses": [{ "id": "uuid", "code": "WH-001", "name": "Main DC" }]
}
```

### POST /api/catalog   (permission `catalog.write`)
Creates the product, sellable variant, case pack, default price-book entry,
optional barcode, opening inventory movement, and audit record atomically.
Brand and category names are reused case-insensitively or created when new.
```json
{
  "name": "Product Name",
  "description": "Optional customer-facing copy",
  "brandName": "Brand",
  "categoryName": "Gummies",
  "sku": "SKU-0001",
  "variantName": "Blue Razz",
  "barcode": "012345678905",
  "barcodeType": "UPC",
  "unitPrice": "3.5000",
  "casePrice": "38.0000",
  "unitsPerCase": 12,
  "minimumOrderQuantity": 1,
  "warehouseId": "uuid",
  "initialStock": 240,
  "isAgeRestricted": false,
  "image": {
    "fileName": "product.png",
    "contentType": "image/png",
    "base64": "base64 bytes without a data-URL prefix"
  }
}
// 201
{ "productId": "uuid", "variantId": "uuid", "sku": "SKU-0001", "imageUrl": "https://..." }
```
`image` is optional. JPEG, PNG, and WebP are accepted up to 4 MB; the API checks
both the declared content type and the file signature. Stored images are served
from `GET /api/catalog/images/:fileName` with immutable cache headers. Opening
stock always passes through the inventory ledger.

---

## Cart

The cart is per (store, user). The server creates one on demand.

### GET /api/cart?storeId=<uuid>
```json
// 200
{
  "cartId": "uuid",
  "storeId": "uuid",
  "lines": [
    {
      "id": "uuid",
      "variantId": "uuid",
      "name": "Product Name",
      "variantName": "Blue Razz",
      "sku": "SKU-0001",
      "imageUrl": null,
      "unitType": "case",
      "unitsPerPack": 12,
      "quantity": 2,
      "unitPrice": "3.5000",
      "packPrice": "38.0000",
      "lineTotal": "76.0000",
      "availableAtWarehouse": 240,
      "exceedsAvailable": false
    }
  ],
  "subtotal": "76.0000",
  "orderMinimum": "100.0000",
  "meetsMinimum": false
}
```

### POST /api/cart/lines
```json
{ "storeId": "uuid", "variantId": "uuid", "unitType": "case", "quantity": 2 }
// 200 -> full cart, same shape as GET
```
Adding an existing (variant, unitType) increments the quantity.

### PATCH /api/cart/lines/:lineId
```json
{ "quantity": 5 }   // 200 -> full cart
```

### DELETE /api/cart/lines/:lineId
`204`. Also `DELETE /api/cart?storeId=<uuid>` clears every line.

---

## Orders

### POST /api/orders
Header `Idempotency-Key: <client-generated-uuid>` is **required**.
```json
{ "storeId": "uuid", "notes": "optional" }
// 201
{ "order": { /* order detail shape below */ } }
```
Submits the active cart. Replaying the same key returns the original `201`
body unchanged, and does not create a second order.

### GET /api/orders?storeId=<uuid>&status=<enum>&limit=20&offset=0
```json
// 200
{ "items": [ /* order summary */ ], "total": 3, "limit": 20, "offset": 0 }
```
Order summary:
```json
{
  "id": "uuid",
  "orderNumber": "LIT-000001",
  "storeId": "uuid",
  "storeName": "Downtown",
  "status": "submitted",
  "orderTotal": "76.0000",
  "lineCount": 3,
  "submittedAt": "2026-07-25T18:00:00.000Z",
  "submittedByName": "Dana Reyes"
}
```

### GET /api/orders/:id
```json
{
  "id": "uuid",
  "orderNumber": "LIT-000001",
  "storeId": "uuid", "storeName": "Downtown",
  "warehouseId": "uuid", "warehouseName": "Main DC",
  "status": "inventory_allocated",
  "orderTotal": "76.0000",
  "notes": null,
  "submittedAt": "...", "submittedByName": "Dana Reyes",
  "approvedAt": "...", "approvedByName": "Sam Ortiz",
  "rejectionReason": null,
  "lines": [
    {
      "id": "uuid",
      "variantId": "uuid",
      "sku": "SKU-0001",
      "name": "Product Name",
      "unitType": "case",
      "unitsPerPack": 12,
      "quantityOrdered": 2,
      "quantityAllocated": 24,
      "unitPrice": "3.5000",
      "lineTotal": "76.0000",
      "fullyAllocated": true
    }
  ],
  "statusHistory": [
    { "toStatus": "submitted", "fromStatus": null, "changedByName": "Dana Reyes",
      "notes": null, "createdAt": "..." }
  ]
}
```

**Prices on a submitted order are snapshots.** Changing a catalog price must
never alter an existing order's `unitPrice`, `lineTotal`, or `orderTotal`.

### POST /api/orders/:id/approve   (permission `orders.approve`)
```json
{ "notes": "optional" }
// 200 -> order detail
```
Allocates inventory and moves the order to `inventory_allocated`. If stock is
short, allocates what is available, sets `fullyAllocated: false` on those
lines, and still advances the status. (Backorders are Phase 2.)

### POST /api/orders/:id/adjust   (permission `orders.approve`)
```json
{
  "reason": "Store confirmed it only needs 2 cases",
  "lines": [
    { "lineId": "uuid", "quantityOrdered": 2 },
    { "lineId": "uuid", "quantityOrdered": 0 }
  ]
}
// 200 -> adjusted order detail
```
HQ may adjust a `submitted` or `under_review` order before allocation. A zero
quantity removes that line, but at least one line must remain. Snapshot prices
stay unchanged; line and order totals are recalculated from those snapshots.
Every adjustment requires a reason and is written to both status history and
the append-only audit log.

### POST /api/orders/:id/reject   (permission `orders.approve`)
```json
{ "reason": "required, non-empty" }
// 200 -> order detail, status "rejected"
```

---

## Order status vocabulary

The enum carries all 17 spec values. The skeleton only produces:
`submitted` → `under_review` → `approved` → `inventory_allocated`, plus
`rejected` and `cancelled`.

Clients must render **icon + label + colour**, never colour alone, and must
degrade gracefully on an unrecognised status rather than crashing.

| status | label |
| --- | --- |
| `submitted` | Submitted |
| `under_review` | Under review |
| `approved` | Approved |
| `inventory_allocated` | Inventory allocated |
| `picking` | Picking |
| `partially_fulfilled` | Partially fulfilled |
| `picked` | Picked |
| `packed` | Packed |
| `route_assigned` | Route assigned |
| `out_for_delivery` | Out for delivery |
| `delivered` | Delivered |
| `receiving_required` | Receiving required |
| `completed` | Completed |
| `backordered` | Backordered |
| `cancelled` | Cancelled |
| `rejected` | Rejected |
| `delivery_failed` | Delivery failed |

---

## Seeded test accounts

| email | password | role |
| --- | --- | --- |
| `manager@lit.test` | `Password123!` | `store_manager`, access to both stores |
| `hq@lit.test` | `Password123!` | `hq_admin`, approve/reject |
| `manager2@lit.test` | `Password123!` | `store_manager`, access to store 2 only |

Seed data: 1 organization, 1 warehouse (`WH-001` "Main DC"), 2 stores
(`STR-001` "Downtown", `STR-002` "Riverside"), 3 brands, 8 products with one
variant each, a default price book, and opening warehouse stock.
