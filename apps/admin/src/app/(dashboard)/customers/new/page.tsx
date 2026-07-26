import Link from "next/link";

import { ApiErrorNotice } from "@/components/api-error-notice";
import { Button } from "@/components/ui/button";
import { isNextControlFlowError, serializeError } from "@/lib/api/errors";
import { apiFetch } from "@/lib/api/server-client";
import type { CustomerSetupOptions } from "@/lib/api/types";

import { CustomerOnboarding } from "./customer-onboarding";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Onboard customer · LIT HQ",
};

export default async function NewCustomerPage() {
  let setupOptions: CustomerSetupOptions | null = null;
  let loadError: ReturnType<typeof serializeError> | null = null;

  try {
    setupOptions =
      await apiFetch<CustomerSetupOptions>("/api/customers/setup-options");
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    loadError = serializeError(error);
  }

  if (setupOptions) {
    return <CustomerOnboarding setupOptions={setupOptions} />;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Onboard a customer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Setup options could not be loaded.
        </p>
      </div>
      {loadError ? <ApiErrorNotice error={loadError} /> : null}
      <Button asChild variant="outline" className="self-start">
        <Link href="/customers">Back to customers</Link>
      </Button>
    </div>
  );
}
