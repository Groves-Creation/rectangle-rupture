import type { KnownOrderStatus, OrderStatus } from "@/lib/api/types";
import { ORDER_STATUSES, isKnownOrderStatus } from "@/lib/api/types";

/**
 * Human labels for all 17 statuses in the contract's status vocabulary table,
 * copied verbatim from that table.
 */
export const ORDER_STATUS_LABELS: Record<KnownOrderStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  inventory_allocated: "Inventory allocated",
  picking: "Picking",
  partially_fulfilled: "Partially fulfilled",
  picked: "Picked",
  packed: "Packed",
  route_assigned: "Route assigned",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  receiving_required: "Receiving required",
  completed: "Completed",
  backordered: "Backordered",
  cancelled: "Cancelled",
  rejected: "Rejected",
  delivery_failed: "Delivery failed",
};

/**
 * Fall back to a readable rendering of an unrecognised status instead of
 * crashing or showing a raw enum value — the contract requires clients to
 * degrade gracefully here.
 */
export function orderStatusLabel(status: OrderStatus): string {
  if (isKnownOrderStatus(status)) return ORDER_STATUS_LABELS[status];
  if (!status) return "Unknown";
  return status
    .replace(/[_-]+/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
}

/** Options for the status filter control, in workflow order. */
export const ORDER_STATUS_OPTIONS: { value: KnownOrderStatus; label: string }[] =
  ORDER_STATUSES.map((status) => ({
    value: status,
    label: ORDER_STATUS_LABELS[status],
  }));

/**
 * Statuses from which HQ may still approve or reject. Anything further along
 * the workflow (or already terminal) is not actionable from this dashboard.
 */
export const ACTIONABLE_ORDER_STATUSES = [
  "submitted",
  "under_review",
  "approved",
] as const satisfies readonly KnownOrderStatus[];

export function isActionableOrderStatus(status: OrderStatus): boolean {
  return (ACTIONABLE_ORDER_STATUSES as readonly string[]).includes(status);
}
