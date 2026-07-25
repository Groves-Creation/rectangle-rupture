import {
  BadgeCheck,
  Ban,
  Boxes,
  CircleHelp,
  ClipboardList,
  Clock,
  Eye,
  Hand,
  Layers,
  MapPin,
  Package,
  PackageCheck,
  Route,
  Send,
  ThumbsUp,
  TriangleAlert,
  Truck,
  X,
} from "lucide-react";
import type { ComponentType } from "react";

import type { KnownOrderStatus, OrderStatus } from "@/lib/api/types";
import { isKnownOrderStatus } from "@/lib/api/types";
import { orderStatusLabel } from "@/lib/order-status";
import { cn } from "@/lib/utils";

/**
 * The single rendering path for an order status, anywhere in the dashboard.
 *
 * Accessibility requirement from the contract: status must be conveyed as
 * **icon + label + colour, never colour alone**, and an unrecognised value must
 * degrade gracefully rather than crash. Both are structural here — the label is
 * always text in the DOM, every entry carries an icon, and anything not in the
 * map lands on a neutral fallback. Keeping this in one component is what stops
 * a colour-only chip creeping back in somewhere.
 */

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

interface StatusPresentation {
  icon: IconComponent;
  /** Full literal class strings so Tailwind's scanner can see them. */
  className: string;
}

const NEUTRAL: StatusPresentation = {
  icon: CircleHelp,
  className:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
};

const PRESENTATION: Record<KnownOrderStatus, StatusPresentation> = {
  submitted: {
    icon: Send,
    className:
      "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200",
  },
  under_review: {
    icon: Eye,
    className:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  },
  approved: {
    icon: ThumbsUp,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  },
  inventory_allocated: {
    icon: PackageCheck,
    className:
      "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-200",
  },
  picking: {
    icon: Hand,
    className:
      "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200",
  },
  partially_fulfilled: {
    icon: Layers,
    className:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  },
  picked: {
    icon: Boxes,
    className:
      "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200",
  },
  packed: {
    icon: Package,
    className:
      "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-200",
  },
  route_assigned: {
    icon: Route,
    className:
      "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-200",
  },
  out_for_delivery: {
    icon: Truck,
    className:
      "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-200",
  },
  delivered: {
    icon: MapPin,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  },
  receiving_required: {
    icon: ClipboardList,
    className:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  },
  completed: {
    icon: BadgeCheck,
    className:
      "border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
  },
  backordered: {
    icon: Clock,
    className:
      "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200",
  },
  cancelled: {
    icon: Ban,
    className:
      "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  },
  rejected: {
    icon: X,
    className:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
  },
  delivery_failed: {
    icon: TriangleAlert,
    className:
      "border-red-300 bg-red-100 text-red-900 dark:border-red-800 dark:bg-red-900 dark:text-red-100",
  },
};

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
  size?: "sm" | "md";
}

export function OrderStatusBadge({
  status,
  className,
  size = "md",
}: OrderStatusBadgeProps) {
  const presentation = isKnownOrderStatus(status)
    ? PRESENTATION[status]
    : NEUTRAL;
  const Icon = presentation.icon;
  const label = orderStatusLabel(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        presentation.className,
        className,
      )}
      data-status={status}
    >
      <Icon
        className={cn("shrink-0", size === "sm" ? "size-3.5" : "size-4")}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}
