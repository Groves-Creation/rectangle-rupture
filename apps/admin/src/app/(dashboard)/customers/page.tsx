import {
  ArrowRight,
  Building2,
  Check,
  CircleDashed,
  MapPin,
  Plus,
  Store,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { ApiErrorNotice } from "@/components/api-error-notice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isNextControlFlowError, serializeError } from "@/lib/api/errors";
import { apiFetch } from "@/lib/api/server-client";
import type {
  CustomerSummary,
  CustomerWorkspaceResponse,
} from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Customers · LIT HQ",
};

export default async function CustomersPage() {
  let workspace: CustomerWorkspaceResponse | null = null;
  let loadError: ReturnType<typeof serializeError> | null = null;

  try {
    workspace = await apiFetch<CustomerWorkspaceResponse>("/api/customers");
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    loadError = serializeError(error);
  }

  const customers = workspace?.items ?? [];
  const recentlyLaunched = customers
    .filter((customer) => customer.status === "active")
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Customer operations
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Live customer accounts, locations, and outstanding invitations.
          </p>
        </div>
        <Button asChild className="sm:self-center">
          <Link href="/customers/new">
            <Plus aria-hidden="true" />
            Onboard customer
          </Link>
        </Button>
      </div>

      {loadError ? <ApiErrorNotice error={loadError} /> : null}

      {workspace ? (
        <>
          <section
            aria-label="Customer summary"
            className="grid gap-3 sm:grid-cols-3"
          >
            <SummaryCard
              icon={Building2}
              label="Active customers"
              value={String(workspace.metrics.activeCustomers)}
              note="Ready to order"
            />
            <SummaryCard
              icon={CircleDashed}
              label="Pending invitations"
              value={String(workspace.metrics.pendingInvitations)}
              note="Awaiting activation"
            />
            <SummaryCard
              icon={MapPin}
              label="Customer locations"
              value={String(workspace.metrics.totalLocations)}
              note="Configured stores"
            />
          </section>

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="overflow-hidden">
              <CardHeader className="border-b bg-muted/25">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>Customer accounts</CardTitle>
                    <CardDescription>
                      Accounts created in the distribution platform.
                    </CardDescription>
                  </div>
                  <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {customers.length} total
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {customers.length > 0 ? (
                  <div className="divide-y">
                    {customers.map((customer) => (
                      <CustomerRow key={customer.id} customer={customer} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center px-6 py-14 text-center">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <Building2 className="size-5" aria-hidden="true" />
                    </span>
                    <h2 className="mt-4 text-sm font-semibold">
                      No customers yet
                    </h2>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                      Onboard the first account to create its store, ordering
                      rules, manager access, and invitation.
                    </p>
                    <Button asChild size="sm" className="mt-5">
                      <Link href="/customers/new">
                        Onboard customer
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-5">
              <Card className="overflow-hidden border-0 bg-slate-950 text-white shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-8 flex size-10 items-center justify-center rounded-lg bg-white/10">
                    <Store className="size-5" aria-hidden="true" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                    Transactional setup
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight">
                    Launch every dependency together.
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Customer, store, commercial terms, manager access, and
                    invitation are committed as one operation.
                  </p>
                  <Button
                    asChild
                    className="mt-6 w-full bg-white text-slate-950 hover:bg-slate-100"
                  >
                    <Link href="/customers/new">
                      Start onboarding
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recently active</CardTitle>
                  <CardDescription>
                    Customer accounts ready for ordering.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {recentlyLaunched.length > 0 ? (
                    recentlyLaunched.map((customer) => (
                      <div key={customer.id} className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                          <Check className="size-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {customer.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {customer.location.code}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(customer.createdAt)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No active customer accounts yet.
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                    <UserRound
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    Pending users remain inactive until their invitation is
                    accepted.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function CustomerRow({ customer }: { customer: CustomerSummary }) {
  const location = [customer.location.city, customer.location.state]
    .filter(Boolean)
    .join(", ");
  const pending = customer.status === "invite_pending";

  return (
    <div className="grid gap-4 p-5 md:grid-cols-[minmax(0,1.35fr)_minmax(180px,.8fr)_auto] md:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold tracking-wide text-primary-foreground">
          {initials(customer.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{customer.name}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3" aria-hidden="true" />
            {customer.location.name}
            {location ? (
              <>
                <span aria-hidden="true">·</span>
                {location}
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs font-medium">
          {customer.manager?.fullName ?? customer.primaryContactEmail}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {customer.priceBookName ?? "No price book"} ·{" "}
          {formatMoney(customer.orderMinimum)} minimum
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 md:justify-end">
        <span
          className={
            pending
              ? "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"
              : "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
          }
        >
          {pending ? "Invite pending" : "Active"}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDate(customer.createdAt)}
        </span>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <p className="text-xl font-semibold tracking-tight">{value}</p>
            <p className="text-xs text-emerald-700">{note}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
