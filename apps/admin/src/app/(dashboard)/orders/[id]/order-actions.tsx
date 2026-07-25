"use client";

import { LoaderCircle, ThumbsUp, X } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface OrderActionsProps {
  actionable: boolean;
  statusLabel: string;
  isApproving: boolean;
  isRejecting: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function OrderActions({
  actionable,
  statusLabel,
  isApproving,
  isRejecting,
  onApprove,
  onReject,
}: OrderActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const busy = isApproving || isRejecting;
  const disabled = !actionable || busy;
  const reasonEmpty = reason.trim() === "";

  const disabledHint = actionable
    ? undefined
    : `This order is ${statusLabel.toLowerCase()} and can no longer be approved or rejected.`;

  function submitRejection() {
    setTouched(true);
    if (reasonEmpty) return;
    onReject(reason.trim());
    setDialogOpen(false);
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
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
            setReason("");
            setTouched(false);
            setDialogOpen(true);
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
              value={reason}
              autoFocus
              onChange={(event) => setReason(event.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={touched && reasonEmpty}
              aria-describedby={
                touched && reasonEmpty ? "rejection-reason-error" : undefined
              }
              placeholder="e.g. Duplicate of LIT-000004 — store confirmed by phone."
            />
            {touched && reasonEmpty ? (
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
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={submitRejection}
              disabled={reasonEmpty}
            >
              Reject order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
