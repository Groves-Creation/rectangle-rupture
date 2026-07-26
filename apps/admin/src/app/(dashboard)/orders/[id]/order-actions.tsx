"use client";

import { LoaderCircle, Pencil, ThumbsUp, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OrderLine } from "@/lib/api/types";

interface AdjustmentInput {
  reason: string;
  lines: Array<{ lineId: string; quantityOrdered: number }>;
}

export interface OrderActionsProps {
  actionable: boolean;
  statusLabel: string;
  lines: OrderLine[];
  isAdjusting: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  onAdjust: (input: AdjustmentInput) => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function OrderActions({
  actionable,
  statusLabel,
  lines,
  isAdjusting,
  isApproving,
  isRejecting,
  onAdjust,
  onApprove,
  onReject,
}: OrderActionsProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionTouched, setRejectionTouched] = useState(false);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const busy = isAdjusting || isApproving || isRejecting;
  const disabled = !actionable || busy;
  const rejectionReasonEmpty = rejectionReason.trim() === "";
  const adjustmentReasonEmpty = adjustmentReason.trim() === "";
  const leavesAtLeastOneLine = lines.some(
    (line) => (quantities[line.id] ?? line.quantityOrdered) > 0,
  );
  const changedLines = lines
    .filter(
      (line) =>
        (quantities[line.id] ?? line.quantityOrdered) !== line.quantityOrdered,
    )
    .map((line) => ({
      lineId: line.id,
      quantityOrdered: quantities[line.id] ?? line.quantityOrdered,
    }));
  const adjustmentInvalid =
    adjustmentReasonEmpty ||
    changedLines.length === 0 ||
    !leavesAtLeastOneLine;

  const disabledHint = actionable
    ? undefined
    : `This order is ${statusLabel.toLowerCase()} and can no longer be adjusted, approved, or rejected.`;

  function submitRejection() {
    setRejectionTouched(true);
    if (rejectionReasonEmpty) return;
    onReject(rejectionReason.trim());
    setRejectDialogOpen(false);
  }

  function openAdjustment() {
    setQuantities(
      Object.fromEntries(
        lines.map((line) => [line.id, line.quantityOrdered]),
      ),
    );
    setAdjustmentReason("");
    setAdjustDialogOpen(true);
  }

  function submitAdjustment() {
    if (adjustmentInvalid) return;
    onAdjust({ reason: adjustmentReason.trim(), lines: changedLines });
    setAdjustDialogOpen(false);
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={openAdjustment}
          disabled={disabled}
        >
          {isAdjusting ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <Pencil aria-hidden="true" />
          )}
          Adjust
        </Button>

        <Button type="button" onClick={onApprove} disabled={disabled}>
          {isApproving ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <ThumbsUp aria-hidden="true" />
          )}
          Approve
        </Button>

        <Button
          type="button"
          variant="destructive"
          disabled={disabled}
          onClick={() => {
            setRejectionReason("");
            setRejectionTouched(false);
            setRejectDialogOpen(true);
          }}
        >
          {isRejecting ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <X aria-hidden="true" />
          )}
          Reject
        </Button>
      </div>

      {disabledHint ? (
        <p className="text-xs text-muted-foreground sm:text-right">
          {disabledHint}
        </p>
      ) : null}

      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adjust this order</DialogTitle>
            <DialogDescription>
              Change requested pack quantities before approval. Set a quantity
              to zero to remove that line. Snapshot prices stay unchanged and
              totals are recalculated.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {lines.map((line) => (
                <div
                  key={line.id}
                  className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_8rem] sm:items-end"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{line.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {line.sku}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`quantity-${line.id}`}>Quantity</Label>
                    <Input
                      id={`quantity-${line.id}`}
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      value={quantities[line.id] ?? line.quantityOrdered}
                      onChange={(event) => {
                        const parsed = Number.parseInt(event.target.value, 10);
                        setQuantities((current) => ({
                          ...current,
                          [line.id]: Number.isNaN(parsed)
                            ? 0
                            : Math.max(0, parsed),
                        }));
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="adjustment-reason">Reason</Label>
              <Textarea
                id="adjustment-reason"
                value={adjustmentReason}
                onChange={(event) => setAdjustmentReason(event.target.value)}
                placeholder="e.g. Store confirmed it only needs 2 cases."
              />
              {leavesAtLeastOneLine ? null : (
                <p className="text-xs text-destructive">
                  At least one line must remain on the order.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAdjustDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitAdjustment}
              disabled={adjustmentInvalid}
            >
              Save adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this order</DialogTitle>
            <DialogDescription>
              The reason is recorded on the order and shown to the store that
              submitted it. It cannot be empty.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="rejection-reason">Reason</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              autoFocus
              onChange={(event) => setRejectionReason(event.target.value)}
              onBlur={() => setRejectionTouched(true)}
              aria-invalid={
                rejectionTouched && rejectionReasonEmpty
              }
              aria-describedby={
                rejectionTouched && rejectionReasonEmpty
                  ? "rejection-reason-error"
                  : undefined
              }
              placeholder="e.g. Duplicate order confirmed by the store."
            />
            {rejectionTouched && rejectionReasonEmpty ? (
              <p
                id="rejection-reason-error"
                className="text-xs text-destructive"
              >
                Enter a reason before rejecting.
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={submitRejection}
              disabled={rejectionReasonEmpty}
            >
              Reject order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
