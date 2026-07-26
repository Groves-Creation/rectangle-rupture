/**
 * Types transcribed from `documentation/api/contract.md`.
 *
 * Rules the contract imposes that show up in these types:
 *  - every money value is a **string** with 4 decimal places (`"12.5000"`),
 *    never a number. `Money` is a nominal-ish alias to make that obvious at
 *    every call site. Never `Number()` one of these except inside a formatter.
 *  - every id is a UUID string, every timestamp an ISO 8601 UTC string.
 */

/** A decimal money value as a string, e.g. `"12.5000"`. Never parse for storage. */
export type Money = string;

/** ISO 8601 UTC timestamp string. */
export type IsoDateTime = string;

/* -------------------------------------------------------------------------- */
/* Order status                                                               */
/* -------------------------------------------------------------------------- */

/** All 17 statuses from the contract's status vocabulary table. */
export const ORDER_STATUSES = [
  "submitted",
  "under_review",
  "approved",
  "inventory_allocated",
  "picking",
  "partially_fulfilled",
  "picked",
  "packed",
  "route_assigned",
  "out_for_delivery",
  "delivered",
  "receiving_required",
  "completed",
  "backordered",
  "cancelled",
  "rejected",
  "delivery_failed",
] as const;

export type KnownOrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * The contract requires clients to "degrade gracefully on an unrecognised
 * status rather than crashing", so the wire type deliberately admits any
 * string while still offering autocomplete for the known values.
 */
export type OrderStatus = KnownOrderStatus | (string & Record<never, never>);

export function isKnownOrderStatus(value: string): value is KnownOrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface AuthStore {
  id: string;
  code: string;
  name: string;
  type: string;
}

/** `POST /api/auth/login` and `POST /api/auth/refresh` 200 body. */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
  stores: AuthStore[];
}

/** `GET /api/auth/me` 200 body. */
export interface MeResponse {
  user: AuthUser;
  stores: AuthStore[];
}

/* -------------------------------------------------------------------------- */
/* Customers                                                                  */
/* -------------------------------------------------------------------------- */

export type DeliveryDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday";

export interface CustomerSummary {
  id: string;
  name: string;
  code: string;
  businessType: string;
  primaryContactEmail: string;
  status: "active" | "invite_pending";
  createdAt: IsoDateTime;
  location: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    code: string;
  };
  manager: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  invitation: {
    id: string;
    status: "pending" | "accepted" | "revoked" | "expired";
    deliveryRequested: boolean;
    expiresAt: IsoDateTime;
  } | null;
  priceBookName: string | null;
  warehouseName: string | null;
  orderMinimum: Money;
  paymentTerms: string;
  deliveryDays: DeliveryDay[];
}

export interface CustomerWorkspaceResponse {
  items: CustomerSummary[];
  metrics: {
    activeCustomers: number;
    pendingInvitations: number;
    totalLocations: number;
  };
}

export interface CustomerSetupOptions {
  warehouses: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  priceBooks: Array<{
    id: string;
    code: string;
    name: string;
    isDefault: boolean;
  }>;
}

export interface CreateCustomerResponse {
  customer: CustomerSummary;
}

/* -------------------------------------------------------------------------- */
/* Catalog                                                                    */
/* -------------------------------------------------------------------------- */

export interface CatalogItem {
  variantId: string;
  productId: string;
  name: string;
  variantName: string;
  sku: string;
  brandName: string;
  categoryName: string;
  imageUrl: string | null;
  unitPrice: Money;
  casePrice: Money;
  unitsPerCase: number;
  minimumOrderQuantity: number;
  availableAtWarehouse: number;
  isAgeRestricted: boolean;
}

export interface CatalogResponse {
  items: CatalogItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface CatalogIngestMetadata {
  brands: string[];
  categories: string[];
  warehouses: Array<{
    id: string;
    code: string;
    name: string;
  }>;
}

export interface CreateCatalogProductResponse {
  productId: string;
  variantId: string;
  sku: string;
  imageUrl: string | null;
}

/* -------------------------------------------------------------------------- */
/* Orders                                                                     */
/* -------------------------------------------------------------------------- */

export interface OrderSummary {
  id: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  status: OrderStatus;
  orderTotal: Money;
  lineCount: number;
  submittedAt: IsoDateTime;
  submittedByName: string;
}

export interface OrdersResponse {
  items: OrderSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface OrderLine {
  id: string;
  variantId: string;
  sku: string;
  name: string;
  unitType: string;
  unitsPerPack: number;
  quantityOrdered: number;
  quantityAllocated: number;
  /** Snapshot price captured at submit. Never re-derived from live pricing. */
  unitPrice: Money;
  /** Snapshot line total captured at submit. */
  lineTotal: Money;
  fullyAllocated: boolean;
}

export interface OrderStatusHistoryEntry {
  toStatus: OrderStatus;
  fromStatus: OrderStatus | null;
  changedByName: string | null;
  notes: string | null;
  createdAt: IsoDateTime;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  warehouseId: string;
  warehouseName: string;
  status: OrderStatus;
  /** Snapshot order total captured at submit. */
  orderTotal: Money;
  notes: string | null;
  submittedAt: IsoDateTime;
  submittedByName: string;
  approvedAt: IsoDateTime | null;
  approvedByName: string | null;
  rejectionReason: string | null;
  lines: OrderLine[];
  statusHistory: OrderStatusHistoryEntry[];
}

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

/** Known error codes from the contract's "Known codes" list. */
export const API_ERROR_CODES = [
  "VALIDATION_ERROR",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "IDEMPOTENCY_KEY_REUSED",
  "INSUFFICIENT_INVENTORY",
  "CUTOFF_PASSED",
  "RATE_LIMITED",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number] | (string & Record<never, never>);

/** The single error envelope the contract defines for every failure. */
export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}
