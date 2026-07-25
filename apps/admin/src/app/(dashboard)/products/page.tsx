import { ApiErrorNotice } from "@/components/api-error-notice";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CATALOG_PAGE_SIZE } from "@/lib/api/pagination";
import { isNextControlFlowError, serializeError } from "@/lib/api/errors";
import type { SerializedError } from "@/lib/api/errors";
import { apiFetch } from "@/lib/api/server-client";
import type { CatalogResponse } from "@/lib/api/types";
import { requireSession } from "@/lib/auth/session";

import { ProductsTable } from "./products-table";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Products · LIT HQ",
};

/**
 * `GET /api/catalog` requires a `storeId` — pricing and warehouse availability
 * are both store-relative. This read-only view uses the first store on the
 * session, matching the contract's rule that a user with more than one store
 * must pick before acting.
 */
export default async function ProductsPage() {
  const session = await requireSession();
  const store = session.stores[0];

  if (!store) {
    return (
      <div className="flex flex-col gap-6">
        <Header />
        <Alert variant="warning">
          <AlertTitle>No store access</AlertTitle>
          <AlertDescription>
            The catalog is priced per store, and your account is not assigned to
            any store. Ask an administrator to grant location access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  let initialData: CatalogResponse | null = null;
  let initialError: SerializedError | null = null;

  try {
    initialData = await apiFetch<CatalogResponse>("/api/catalog", {
      query: { storeId: store.id, limit: CATALOG_PAGE_SIZE, offset: 0 },
    });
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    initialError = serializeError(error);
  }

  return (
    <div className="flex flex-col gap-6">
      <Header storeLabel={`${store.code} — ${store.name}`} />
      {initialError ? <ApiErrorNotice error={initialError} /> : null}
      <ProductsTable
        storeId={store.id}
        stores={session.stores}
        initialData={initialData}
      />
    </div>
  );
}

function Header({ storeLabel }: { storeLabel?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
      <p className="text-sm text-muted-foreground">
        Read-only catalog{storeLabel ? ` priced for ${storeLabel}` : ""}.
      </p>
    </div>
  );
}
