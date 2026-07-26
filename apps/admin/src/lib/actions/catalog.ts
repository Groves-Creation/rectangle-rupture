"use server";

import { revalidatePath } from "next/cache";

import { isNextControlFlowError, serializeError } from "@/lib/api/errors";
import { apiFetch } from "@/lib/api/server-client";
import { CATALOG_PAGE_SIZE } from "@/lib/api/pagination";
import type {
  CatalogResponse,
  CreateCatalogProductResponse,
} from "@/lib/api/types";

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

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function formString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function optionalFormString(formData: FormData, name: string) {
  const value = formString(formData, name);
  return value === "" ? undefined : value;
}

function money(value: string) {
  if (!/^\d+(?:\.\d{1,4})?$/.test(value)) return value;
  const [whole, fraction = ""] = value.split(".");
  return `${whole}.${fraction.padEnd(4, "0")}`;
}

export async function createCatalogProductAction(
  formData: FormData,
): Promise<ActionResult<CreateCatalogProductResponse>> {
  try {
    const imageValue = formData.get("image");
    let image:
      | { fileName: string; contentType: "image/jpeg" | "image/png" | "image/webp"; base64: string }
      | undefined;

    if (imageValue instanceof File && imageValue.size > 0) {
      if (imageValue.size > MAX_IMAGE_BYTES) {
        return {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Product image must be no larger than 4 MB.",
          },
        };
      }
      if (!IMAGE_TYPES.has(imageValue.type)) {
        return {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Product image must be a JPEG, PNG, or WebP file.",
          },
        };
      }
      image = {
        fileName: imageValue.name,
        contentType: imageValue.type as "image/jpeg" | "image/png" | "image/webp",
        base64: Buffer.from(await imageValue.arrayBuffer()).toString("base64"),
      };
    }

    const data = await apiFetch<CreateCatalogProductResponse>("/api/catalog", {
      method: "POST",
      body: {
        name: formString(formData, "name"),
        description: optionalFormString(formData, "description"),
        brandName: optionalFormString(formData, "brandName"),
        categoryName: optionalFormString(formData, "categoryName"),
        sku: formString(formData, "sku"),
        variantName: optionalFormString(formData, "variantName"),
        barcode: optionalFormString(formData, "barcode"),
        barcodeType: "UPC",
        unitPrice: money(formString(formData, "unitPrice")),
        casePrice: optionalFormString(formData, "casePrice")
          ? money(formString(formData, "casePrice"))
          : undefined,
        unitsPerCase: Number(formString(formData, "unitsPerCase")),
        minimumOrderQuantity: Number(formString(formData, "minimumOrderQuantity")),
        warehouseId: formString(formData, "warehouseId"),
        initialStock: Number(formString(formData, "initialStock")),
        isAgeRestricted: formData.get("isAgeRestricted") === "on",
        image,
      },
    });
    revalidatePath("/products");
    return { ok: true, data };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    return { ok: false, error: serializeError(error) };
  }
}
