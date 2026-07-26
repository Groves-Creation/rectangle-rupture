import { z } from "zod";

/**
 * Single source of truth for request and response shapes, shared by the API
 * and the admin dashboard. Mirrors documentation/api/contract.md — if the two
 * ever disagree, treat it as a bug and reconcile before shipping.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** Money crosses the wire as a fixed-4-decimal string, never a float. */
export const MoneySchema = z.string().regex(/^-?\d+\.\d{4}$/, "Money must be a string like '12.5000'");

export const UnitTypeSchema = z.enum(["unit", "box", "case", "display"]);

export const OrderStatusSchema = z.enum([
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
]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const LocationSummarySchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  type: z.enum(["warehouse", "store"]),
});

export const UserSummarySchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  fullName: z.string(),
  roles: z.array(z.string()),
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  deviceIdentifier: z.string().optional(),
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int(),
  user: UserSummarySchema,
  stores: z.array(LocationSummarySchema),
});

export const RefreshRequestSchema = z.object({ refreshToken: z.string().min(1) });

export const MeResponseSchema = z.object({
  user: UserSummarySchema,
  stores: z.array(LocationSummarySchema),
});

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export const DeliveryDaySchema = z.enum([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
]);

export const CustomerStatusSchema = z.enum(["active", "invite_pending"]);

export const CreateCustomerSchema = z.object({
  businessName: z.string().trim().min(1).max(160),
  accountCode: z
    .string()
    .trim()
    .min(2)
    .max(12)
    .regex(/^[A-Z0-9-]+$/, "Account code may contain only A-Z, 0-9, and hyphens"),
  businessType: z.string().trim().min(1).max(80),
  contactEmail: z.string().trim().email().max(254),
  contactPhone: z.string().trim().max(40).optional(),
  locationName: z.string().trim().min(1).max(160),
  address: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().length(2),
  postalCode: z.string().trim().min(3).max(20),
  timezone: z.string().trim().min(1).max(80),
  warehouseId: z.string().uuid(),
  priceBookId: z.string().uuid(),
  orderMinimum: MoneySchema.refine((value) => !value.startsWith("-"), {
    message: "Order minimum cannot be negative",
  }),
  paymentTerms: z.string().trim().min(1).max(40),
  deliveryDays: z.array(DeliveryDaySchema).min(1),
  orderNotes: z.string().trim().max(2000).optional(),
  inviteName: z.string().trim().min(1).max(160),
  inviteEmail: z.string().trim().email().max(254),
  inviteRole: z.literal("store_manager"),
  sendWelcome: z.boolean().default(true),
});

export const CustomerSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  businessType: z.string(),
  primaryContactEmail: z.string(),
  status: CustomerStatusSchema,
  createdAt: z.string(),
  location: z.object({
    id: z.string().uuid(),
    name: z.string(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    code: z.string(),
  }),
  manager: z
    .object({
      id: z.string().uuid(),
      fullName: z.string(),
      email: z.string(),
    })
    .nullable(),
  invitation: z
    .object({
      id: z.string().uuid(),
      status: z.enum(["pending", "accepted", "revoked", "expired"]),
      deliveryRequested: z.boolean(),
      expiresAt: z.string(),
    })
    .nullable(),
  priceBookName: z.string().nullable(),
  warehouseName: z.string().nullable(),
  orderMinimum: MoneySchema,
  paymentTerms: z.string(),
  deliveryDays: z.array(DeliveryDaySchema),
});

export const CustomerWorkspaceResponseSchema = z.object({
  items: z.array(CustomerSummarySchema),
  metrics: z.object({
    activeCustomers: z.number().int().nonnegative(),
    pendingInvitations: z.number().int().nonnegative(),
    totalLocations: z.number().int().nonnegative(),
  }),
});

export const CustomerSetupOptionsSchema = z.object({
  warehouses: z.array(
    z.object({
      id: z.string().uuid(),
      code: z.string(),
      name: z.string(),
    }),
  ),
  priceBooks: z.array(
    z.object({
      id: z.string().uuid(),
      code: z.string(),
      name: z.string(),
      isDefault: z.boolean(),
    }),
  ),
});

export const CreateCustomerResponseSchema = z.object({
  customer: CustomerSummarySchema,
});

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export const CatalogItemSchema = z.object({
  variantId: z.string().uuid(),
  productId: z.string().uuid(),
  name: z.string(),
  variantName: z.string().nullable(),
  sku: z.string(),
  brandName: z.string().nullable(),
  categoryName: z.string().nullable(),
  imageUrl: z.string().nullable(),
  unitPrice: MoneySchema,
  casePrice: MoneySchema.nullable(),
  unitsPerCase: z.number().int(),
  minimumOrderQuantity: z.number().int(),
  availableAtWarehouse: z.number().int(),
  isAgeRestricted: z.boolean(),
});

export const CatalogQuerySchema = z.object({
  storeId: z.string().uuid(),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const CatalogListResponseSchema = z.object({
  items: z.array(CatalogItemSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});

export const CatalogDetailResponseSchema = CatalogItemSchema.extend({
  description: z.string().nullable(),
  barcodes: z.array(z.string()),
  warehouseId: z.string().uuid(),
});

const ProductImageUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  /** Base64 only (no data-URL prefix). The API verifies size and magic bytes. */
  base64: z.string().min(1),
});

export const CreateCatalogProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4_000).optional(),
  brandName: z.string().trim().max(120).optional(),
  categoryName: z.string().trim().max(120).optional(),
  sku: z.string().trim().min(1).max(80),
  variantName: z.string().trim().max(120).optional(),
  barcode: z.string().trim().max(80).optional(),
  barcodeType: z.string().trim().min(1).max(20).default("UPC"),
  unitPrice: MoneySchema.refine((value) => !value.startsWith("-") && value !== "0.0000", {
    message: "Unit price must be greater than zero",
  }),
  casePrice: MoneySchema.refine((value) => !value.startsWith("-") && value !== "0.0000", {
    message: "Case price must be greater than zero",
  }).optional(),
  unitsPerCase: z.number().int().min(1).max(100_000),
  minimumOrderQuantity: z.number().int().min(1).max(100_000).default(1),
  warehouseId: z.string().uuid(),
  initialStock: z.number().int().min(0).max(100_000_000).default(0),
  isAgeRestricted: z.boolean().default(false),
  image: ProductImageUploadSchema.optional(),
});

export const CreateCatalogProductResponseSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid(),
  sku: z.string(),
  imageUrl: z.string().nullable(),
});

export const CatalogIngestMetadataSchema = z.object({
  brands: z.array(z.string()),
  categories: z.array(z.string()),
  warehouses: z.array(
    z.object({
      id: z.string().uuid(),
      code: z.string(),
      name: z.string(),
    }),
  ),
});

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

export const CartLineSchema = z.object({
  id: z.string().uuid(),
  variantId: z.string().uuid(),
  name: z.string(),
  variantName: z.string().nullable(),
  sku: z.string(),
  imageUrl: z.string().nullable(),
  unitType: UnitTypeSchema,
  unitsPerPack: z.number().int(),
  quantity: z.number().int(),
  unitPrice: MoneySchema,
  packPrice: MoneySchema,
  lineTotal: MoneySchema,
  availableAtWarehouse: z.number().int(),
  exceedsAvailable: z.boolean(),
});

export const CartResponseSchema = z.object({
  cartId: z.string().uuid(),
  storeId: z.string().uuid(),
  lines: z.array(CartLineSchema),
  subtotal: MoneySchema,
  orderMinimum: MoneySchema,
  meetsMinimum: z.boolean(),
});

export const AddCartLineSchema = z.object({
  storeId: z.string().uuid(),
  variantId: z.string().uuid(),
  unitType: UnitTypeSchema.default("case"),
  quantity: z.number().int().positive(),
});

export const UpdateCartLineSchema = z.object({ quantity: z.number().int().positive() });

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const OrderLineSchema = z.object({
  id: z.string().uuid(),
  variantId: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  unitType: UnitTypeSchema,
  unitsPerPack: z.number().int(),
  quantityOrdered: z.number().int(),
  quantityAllocated: z.number().int(),
  unitPrice: MoneySchema,
  lineTotal: MoneySchema,
  fullyAllocated: z.boolean(),
});

export const OrderStatusHistorySchema = z.object({
  toStatus: OrderStatusSchema,
  fromStatus: OrderStatusSchema.nullable(),
  changedByName: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
});

export const OrderSummarySchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  storeId: z.string().uuid(),
  storeName: z.string(),
  status: OrderStatusSchema,
  orderTotal: MoneySchema,
  lineCount: z.number().int(),
  submittedAt: z.string(),
  submittedByName: z.string(),
});

export const OrderDetailSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  storeId: z.string().uuid(),
  storeName: z.string(),
  warehouseId: z.string().uuid(),
  warehouseName: z.string(),
  status: OrderStatusSchema,
  orderTotal: MoneySchema,
  notes: z.string().nullable(),
  submittedAt: z.string(),
  submittedByName: z.string(),
  approvedAt: z.string().nullable(),
  approvedByName: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  lines: z.array(OrderLineSchema),
  statusHistory: z.array(OrderStatusHistorySchema),
});

export const SubmitOrderSchema = z.object({
  storeId: z.string().uuid(),
  notes: z.string().max(1000).optional(),
});

export const ApproveOrderSchema = z.object({ notes: z.string().max(1000).optional() });

export const RejectOrderSchema = z.object({ reason: z.string().min(1).max(1000) });

export const AdjustOrderSchema = z.object({
  reason: z.string().trim().min(1).max(1000),
  lines: z
    .array(
      z.object({
        lineId: z.string().uuid(),
        /** Zero removes the line; a positive value replaces its pack quantity. */
        quantityOrdered: z.number().int().min(0).max(100_000),
      }),
    )
    .min(1)
    .refine(
      (lines) => new Set(lines.map((line) => line.lineId)).size === lines.length,
      "Each order line may only be adjusted once",
    ),
});

export const OrderListQuerySchema = z.object({
  storeId: z.string().uuid().optional(),
  status: OrderStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const OrderListResponseSchema = z.object({
  items: z.array(OrderSummarySchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type CatalogItem = z.infer<typeof CatalogItemSchema>;
export type CreateCatalogProduct = z.infer<typeof CreateCatalogProductSchema>;
export type CartResponse = z.infer<typeof CartResponseSchema>;
export type OrderSummary = z.infer<typeof OrderSummarySchema>;
export type OrderDetail = z.infer<typeof OrderDetailSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type CreateCustomer = z.infer<typeof CreateCustomerSchema>;
export type CustomerSummary = z.infer<typeof CustomerSummarySchema>;
export type CustomerWorkspaceResponse = z.infer<typeof CustomerWorkspaceResponseSchema>;
