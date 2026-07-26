"use server";

import { revalidatePath } from "next/cache";

import { isNextControlFlowError, serializeError } from "@/lib/api/errors";
import { apiFetch } from "@/lib/api/server-client";
import type {
  CreateCustomerResponse,
  DeliveryDay,
} from "@/lib/api/types";

import type { ActionResult } from "./types";

export interface CreateCustomerInput {
  businessName: string;
  accountCode: string;
  businessType: string;
  contactEmail: string;
  contactPhone?: string;
  locationName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  timezone: string;
  warehouseId: string;
  priceBookId: string;
  orderMinimum: string;
  paymentTerms: string;
  deliveryDays: DeliveryDay[];
  orderNotes?: string;
  inviteName: string;
  inviteEmail: string;
  inviteRole: "store_manager";
  sendWelcome: boolean;
}

function normalizeMoney(value: string): string {
  const trimmed = value.trim();
  if (/^\d+\.\d{4}$/.test(trimmed)) return trimmed;
  const match = /^(\d+)(?:\.(\d{0,4}))?$/.exec(trimmed);
  if (!match) return trimmed;
  return `${match[1]}.${(match[2] ?? "").padEnd(4, "0")}`;
}

export async function createCustomerAction(
  input: CreateCustomerInput,
): Promise<ActionResult<CreateCustomerResponse>> {
  try {
    const data = await apiFetch<CreateCustomerResponse>("/api/customers", {
      method: "POST",
      body: {
        ...input,
        businessName: input.businessName.trim(),
        accountCode: input.accountCode.trim().toUpperCase(),
        contactEmail: input.contactEmail.trim().toLowerCase(),
        contactPhone: input.contactPhone?.trim() || undefined,
        inviteEmail: input.inviteEmail.trim().toLowerCase(),
        orderMinimum: normalizeMoney(input.orderMinimum),
        orderNotes: input.orderNotes?.trim() || undefined,
      },
    });
    revalidatePath("/customers");
    return { ok: true, data };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    return { ok: false, error: serializeError(error) };
  }
}
