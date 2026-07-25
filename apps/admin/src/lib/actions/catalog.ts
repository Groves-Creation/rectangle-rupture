"use server";

import { isNextControlFlowError, serializeError } from "@/lib/api/errors";
import { apiFetch } from "@/lib/api/server-client";
import { CATALOG_PAGE_SIZE } from "@/lib/api/pagination";
import type { CatalogResponse } from "@/lib/api/types";

import type { ActionResult } from "./types";

export interface ListCatalogParams {
  /** Required by the contract: `GET /api/catalog?storeId=<uuid>`. */
  storeId: string;
  search?: string | undefined;
  categoryId?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export async function listCatalogAction(
  params: ListCatalogParams,
): Promise<ActionResult<CatalogResponse>> {
  try {
    const data = await apiFetch<CatalogResponse>("/api/catalog", {
      query: {
        storeId: params.storeId,
        search: params.search,
        categoryId: params.categoryId,
        limit: params.limit ?? CATALOG_PAGE_SIZE,
        offset: params.offset ?? 0,
      },
    });
    return { ok: true, data };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    return { ok: false, error: serializeError(error) };
  }
}
