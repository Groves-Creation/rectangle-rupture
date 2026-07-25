import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ApiErrorNotice } from "@/components/api-error-notice";
import { Button } from "@/components/ui/button";
import { ApiError, isNextControlFlowError, serializeError } from "@/lib/api/errors";
import type { SerializedError } from "@/lib/api/errors";
import { apiFetch } from "@/lib/api/server-client";
import type { OrderDetail } from "@/lib/api/types";

import { OrderDetailView } from "./order-detail-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order · LIT HQ",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let order: OrderDetail | null = null;
  let error: SerializedError | null = null;

  try {
    order = await apiFetch<OrderDetail>(`/api/orders/${encodeURIComponent(id)}`);
  } catch (caught) {
    if (isNextControlFlowError(caught)) throw caught;
    error = serializeError(caught);
    if (caught instanceof ApiError && caught.status === 404) {
      error = {
        code: "NOT_FOUND",
        message: `No order with id ${id} exists, or you do not have access to it.`,
      };
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href="/orders">
            <ArrowLeft aria-hidden="true" />
            Back to orders
          </Link>
        </Button>
      </div>

      {order ? (
        <OrderDetailView orderId={id} initialOrder={order} />
      ) : error ? (
        <ApiErrorNotice error={error} />
      ) : null}
    </div>
  );
}
