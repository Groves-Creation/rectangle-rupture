"use server";

import { revalidatePath } from "next/cache";

import { isNextControlFlowError, serializeError } from "@/lib/api/errors";
import { apiFetch } from "@/lib/api/server-client";
import { ORDERS_PAGE_SIZE } from "@/lib/api/pagination";
import type { OrderDetail, OrdersResponse } from "@/lib/api/types";

import type { ActionResult } from "./types";

export interface ListOrdersParams {
  storeId?: string | undefined;
  status?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface AdjustOrderLineInput {
  lineId: string;
  quantityOrdered: number;
}

/**
 * `POST /api/orders` documents its 201 body as `{ "order": ... }` while
 * `GET /api/orders/:id`, approve and reject are documented as returning the
 * order detail bare. This tolerates either so a wrapper on approve/reject
 * would not break the dashboard — see the note in the handover.
 */
function unwrapOrder(payload: OrderDetail | { order: OrderDetail }): OrderDetail {
  if (payload && typeof payload === "object" && "order" in payload) {
    return payload.order;
  }
  return payload;
}

export async function listOrdersAction(
  params: ListOrdersParams = {},
): Promise<ActionResult<OrdersResponse>> {
  try {
    const data = await apiFetch<OrdersResponse>("/api/orders", {
      query: {
        storeId: params.storeId,
        status: params.status,
        limit: params.limit ?? ORDERS_PAGE_SIZE,
        offset: params.offset ?? 0,
      },
    });
    return { ok: true, data };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    return { ok: false, error: serializeError(error) };
  }
}

export async function getOrderAction(
  orderId: string,
): Promise<ActionResult<OrderDetail>> {
  try {
    const data = await apiFetch<OrderDetail>(
      `/api/orders/${encodeURIComponent(orderId)}`,
    );
    return { ok: true, data: unwrapOrder(data) };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    return { ok: false, error: serializeError(error) };
  }
}

/**
 * `POST /api/orders/:id/approve`. Allocates inventory; a short stock position
 * still advances the order but marks lines `fullyAllocated: false`, and an
 * outright failure surfaces as `INSUFFICIENT_INVENTORY` for the UI to show.
 */
export async function approveOrderAction(
  orderId: string,
  notes?: string,
): Promise<ActionResult<OrderDetail>> {
  const trimmed = notes?.trim() ?? "";
  try {
    const data = await apiFetch<OrderDetail>(
      `/api/orders/${encodeURIComponent(orderId)}/approve`,
      {
        method: "POST",
        body: trimmed === "" ? {} : { notes: trimmed },
      },
    );
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { ok: true, data: unwrapOrder(data) };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    return { ok: false, error: serializeError(error) };
  }
}

/** Updates or removes lines while an order is still awaiting an HQ decision. */
export async function adjustOrderAction(
  orderId: string,
  reason: string,
  lines: AdjustOrderLineInput[],
): Promise<ActionResult<OrderDetail>> {
  const trimmed = reason.trim();
  if (trimmed === "") {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "An adjustment reason is required.",
      },
    };
  }

  try {
    const data = await apiFetch<OrderDetail>(
      `/api/orders/${encodeURIComponent(orderId)}/adjust`,
      { method: "POST", body: { reason: trimmed, lines } },
    );
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { ok: true, data: unwrapOrder(data) };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    return { ok: false, error: serializeError(error) };
  }
}

/** `POST /api/orders/:id/reject`. `reason` is required and must be non-empty. */
export async function rejectOrderAction(
  orderId: string,
  reason: string,
): Promise<ActionResult<OrderDetail>> {
  const trimmed = reason.trim();
  if (trimmed === "") {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "A rejection reason is required.",
      },
    };
  }

  try {
    const data = await apiFetch<OrderDetail>(
      `/api/orders/${encodeURIComponent(orderId)}/reject`,
      { method: "POST", body: { reason: trimmed } },
    );
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { ok: true, data: unwrapOrder(data) };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    return { ok: false, error: serializeError(error) };
  }
}
