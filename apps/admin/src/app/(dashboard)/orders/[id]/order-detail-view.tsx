"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo } from "react";

import { ApiErrorNotice } from "@/components/api-error-notice";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adjustOrderAction,
  approveOrderAction,
  getOrderAction,
  rejectOrderAction,
} from "@/lib/actions/orders";
import type { ActionResult } from "@/lib/actions/types";
import type { SerializedError } from "@/lib/api/errors";
import type { OrderDetail } from "@/lib/api/types";
import { formatDateTime, formatQuantity, formatUnitType } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { isActionableOrderStatus, orderStatusLabel } from "@/lib/order-status";

import { OrderActions } from "./order-actions";

/** Carry the contract's error code through TanStack Query's `Error` channel. */
class ActionFailure extends Error {
  readonly code: string;
  constructor(error: SerializedError) {
    super(error.message);
    this.name = "ActionFailure";
    this.code = error.code;
  }
}

function unwrap<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new ActionFailure(result.error);
  return result.data;
}

function toSerialized(error: unknown): SerializedError | null {
  if (error instanceof ActionFailure) {
    return { code: error.code, message: error.message };
  }
  if (error instanceof Error) {
    return { code: "UNKNOWN_ERROR", message: error.message };
  }
  return null;
}

export interface OrderDetailViewProps {
  orderId: string;
  initialOrder: OrderDetail;
}

export function OrderDetailView({
  orderId,
  initialOrder,
}: OrderDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["order", orderId] as const, [orderId]);

  const orderQuery = useQuery<OrderDetail, Error>({
    queryKey,
    queryFn: async () => unwrap(await getOrderAction(orderId)),
    initialData: initialOrder,
  });

  const order = orderQuery.data;

  /** Push the fresh order into the cache, drop stale list data, resync the RSC tree. */
  function settle(updated: OrderDetail) {
    queryClient.setQueryData(queryKey, updated);
    void queryClient.invalidateQueries({ queryKey });
    void queryClient.invalidateQueries({ queryKey: ["orders"] });
    router.refresh();
  }

  const approve = useMutation<OrderDetail, Error, void>({
    mutationFn: async () => unwrap(await approveOrderAction(orderId)),
    onSuccess: settle,
  });

  const adjust = useMutation<
    OrderDetail,
    Error,
    {
      reason: string;
      lines: Array<{ lineId: string; quantityOrdered: number }>;
    }
  >({
    mutationFn: async ({ reason, lines }) =>
      unwrap(await adjustOrderAction(orderId, reason, lines)),
    onSuccess: settle,
  });

  const reject = useMutation<OrderDetail, Error, string>({
    mutationFn: async (reason: string) =>
      unwrap(await rejectOrderAction(orderId, reason)),
    onSuccess: settle,
  });

  const mutationError =
    toSerialized(adjust.error) ??
    toSerialized(approve.error) ??
    toSerialized(reject.error);

  const actionable = isActionableOrderStatus(order.status);
  const statusLabel = orderStatusLabel(order.status);

  const timeline = useMemo(
    () =>
      [...order.statusHistory].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [order.statusHistory],
  );

  const allocationRecorded = ![
    "submitted",
    "under_review",
    "approved",
    "rejected",
    "cancelled",
  ].includes(order.status);
  const hasShortfall =
    allocationRecorded && order.lines.some((line) => !line.fullyAllocated);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {order.storeName} → {order.warehouseName}
          </p>
        </div>

        <OrderActions
          actionable={actionable}
          statusLabel={statusLabel}
          lines={order.lines}
          isAdjusting={adjust.isPending}
          isApproving={approve.isPending}
          isRejecting={reject.isPending}
          onAdjust={(input) => adjust.mutate(input)}
          onApprove={() => approve.mutate()}
          onReject={(reason) => reject.mutate(reason)}
        />
      </div>

      {mutationError ? <ApiErrorNotice error={mutationError} /> : null}

      {order.rejectionReason ? (
        <Alert variant="destructive">
          <TriangleAlert aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <AlertTitle>Rejected</AlertTitle>
            <AlertDescription>{order.rejectionReason}</AlertDescription>
          </div>
        </Alert>
      ) : null}

      {hasShortfall ? (
        <Alert variant="warning">
          <TriangleAlert aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <AlertTitle>Partially allocated</AlertTitle>
            <AlertDescription>
              One or more lines could not be fully allocated from warehouse
              stock. The order still advanced; the shortfall is shown per line.
            </AlertDescription>
          </div>
        </Alert>
      ) : null}

      {/* Summary */}
      <Card>
        <CardContent className="grid grid-cols-1 gap-x-8 gap-y-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Submitted">
            <span>{formatDateTime(order.submittedAt)}</span>
            <span className="text-muted-foreground">
              {order.submittedByName}
            </span>
          </Field>
          <Field label="Approved">
            <span>{formatDateTime(order.approvedAt)}</span>
            <span className="text-muted-foreground">
              {order.approvedByName ?? "—"}
            </span>
          </Field>
          <Field label="Store">
            <span>{order.storeName}</span>
          </Field>
          <Field label="Order total">
            <span className="text-lg font-semibold tabular-nums">
              {formatMoney(order.orderTotal)}
            </span>
          </Field>
          {order.notes ? (
            <div className="sm:col-span-2 lg:col-span-4">
              <Field label="Notes">
                <span className="whitespace-pre-wrap">{order.notes}</span>
              </Field>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Lines */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Line items</CardTitle>
          <p className="text-sm text-muted-foreground">
            Prices are snapshots taken when the order was submitted. Later
            catalog price changes do not affect them.
          </p>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Ordered</TableHead>
                <TableHead className="text-right">Allocated</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="pr-6 text-right">Line total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.lines.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    This order has no lines.
                  </TableCell>
                </TableRow>
              ) : (
                order.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="pl-6 font-mono text-xs">
                      {line.sku}
                    </TableCell>
                    <TableCell className="font-medium">{line.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatUnitType(line.unitType)} × {line.unitsPerPack}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatQuantity(line.quantityOrdered)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span
                        className={
                          line.fullyAllocated || !allocationRecorded
                            ? undefined
                            : "font-medium text-amber-700 dark:text-amber-400"
                        }
                      >
                        {formatQuantity(line.quantityAllocated)}
                      </span>
                      {!allocationRecorded || line.fullyAllocated ? null : (
                        <span className="ml-1 text-xs text-amber-700 dark:text-amber-400">
                          (short)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(line.unitPrice)}
                    </TableCell>
                    <TableCell className="pr-6 text-right tabular-nums">
                      {formatMoney(line.lineTotal)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="pl-6 text-right">
                  Order total
                </TableCell>
                <TableCell className="pr-6 text-right text-base font-semibold tabular-nums">
                  {formatMoney(order.orderTotal)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Status history</CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No status changes recorded.
            </p>
          ) : (
            <ol className="flex flex-col gap-0">
              {timeline.map((entry, index) => (
                <li
                  key={`${entry.toStatus}-${entry.createdAt}-${index}`}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  <div className="flex flex-col items-center">
                    <span
                      className="mt-1.5 size-2.5 shrink-0 rounded-full bg-border ring-4 ring-background"
                      aria-hidden="true"
                    />
                    {index < timeline.length - 1 ? (
                      <span
                        className="w-px flex-1 bg-border"
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-1 pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <OrderStatusBadge status={entry.toStatus} size="sm" />
                      {entry.fromStatus ? (
                        <span className="text-xs text-muted-foreground">
                          from {orderStatusLabel(entry.fromStatus)}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(entry.createdAt)}
                      {entry.changedByName ? ` · ${entry.changedByName}` : ""}
                    </p>
                    {entry.notes ? (
                      <p className="text-sm whitespace-pre-wrap">
                        {entry.notes}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-col text-sm">{children}</div>
    </div>
  );
}
