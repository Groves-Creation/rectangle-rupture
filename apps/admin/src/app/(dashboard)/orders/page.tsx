import { ApiErrorNotice } from "@/components/api-error-notice";
import { ORDERS_PAGE_SIZE } from "@/lib/api/pagination";
import { isNextControlFlowError, serializeError } from "@/lib/api/errors";
import type { SerializedError } from "@/lib/api/errors";
import { apiFetch } from "@/lib/api/server-client";
import type { OrdersResponse } from "@/lib/api/types";
import { requireSession } from "@/lib/auth/session";

import { OrdersTable } from "./orders-table";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Orders · LIT HQ",
};

/**
 * Server Component: the unfiltered first page is fetched here so the table has
 * data in the initial HTML. Filtering and refetching afterwards happen in the
 * client via TanStack Query calling a server action.
 */
export default async function OrdersPage() {
  const session = await requireSession();

  let initialData: OrdersResponse | null = null;
  let initialError: SerializedError | null = null;

  try {
    initialData = await apiFetch<OrdersResponse>("/api/orders", {
      query: { limit: ORDERS_PAGE_SIZE, offset: 0 },
    });
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    initialError = serializeError(error);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Review submitted store orders and adjust, approve, or reject them.
        </p>
      </div>

      {initialError ? <ApiErrorNotice error={initialError} /> : null}

      <OrdersTable stores={session.stores} initialData={initialData} />
    </div>
  );
}
