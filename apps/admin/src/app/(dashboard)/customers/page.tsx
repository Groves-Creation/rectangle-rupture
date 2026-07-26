import {
  ArrowRight,
  Building2,
  Check,
  CircleDashed,
  Clock3,
  MapPin,
  Plus,
  Store,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Customers · LIT HQ",
};

const launchQueue = [
  {
    name: "Hearth & Finch Markets",
    initials: "HF",
    location: "Boulder, CO",
    owner: "Maya Chen",
    progress: 75,
    steps: "3 of 4",
    status: "In setup",
    updated: "12 min ago",
  },
  {
    name: "Northline Market",
    initials: "NM",
    location: "Fort Collins, CO",
    owner: "Jordan Lee",
    progress: 50,
    steps: "2 of 4",
    status: "Needs details",
    updated: "Yesterday",
  },
  {
    name: "Morrow Grocery Co.",
    initials: "MG",
    location: "Denver, CO",
    owner: "Priya Shah",
    progress: 25,
    steps: "1 of 4",
    status: "Invite pending",
    updated: "Jul 23",
  },
] as const;

const recentlyLaunched = [
  { name: "Riverside", date: "Jul 22", code: "STR-002" },
  { name: "Downtown", date: "Jul 18", code: "STR-001" },
] as const;

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Customer operations
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Bring every account from signed to first order with a clear,
            accountable setup path.
          </p>
        </div>
        <Button asChild className="sm:self-center">
          <Link href="/customers/new">
            <Plus aria-hidden="true" />
            Onboard customer
          </Link>
        </Button>
      </div>

      <section
        aria-label="Customer summary"
        className="grid gap-3 sm:grid-cols-3"
      >
        <SummaryCard
          icon={Building2}
          label="Active customers"
          value="24"
          note="+3 this quarter"
        />
        <SummaryCard
          icon={CircleDashed}
          label="In onboarding"
          value="3"
          note="1 needs attention"
        />
        <SummaryCard
          icon={Clock3}
          label="Avg. time to launch"
          value="2.4 days"
          note="18% faster"
        />
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/25">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Launch queue</CardTitle>
                <CardDescription>
                  Accounts that still need setup before ordering.
                </CardDescription>
              </div>
              <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                3 active
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {launchQueue.map((customer) => (
                <div
                  key={customer.name}
                  className="group grid gap-4 p-5 transition-colors hover:bg-muted/30 md:grid-cols-[minmax(0,1.45fr)_minmax(150px,.8fr)_auto] md:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold tracking-wide text-primary-foreground">
                      {customer.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {customer.name}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3" aria-hidden="true" />
                        {customer.location}
                        <span aria-hidden="true">·</span>
                        {customer.owner}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="font-medium">{customer.status}</span>
                      <span className="text-muted-foreground">
                        {customer.steps}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{ width: `${customer.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <span className="text-xs text-muted-foreground">
                      {customer.updated}
                    </span>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/customers/new">
                        Continue
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-5">
          <Card className="overflow-hidden border-0 bg-slate-950 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="mb-8 flex size-10 items-center justify-center rounded-lg bg-white/10">
                <Store className="size-5" aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Guided setup
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                Launch a customer without missing a detail.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Account, location, ordering rules, and access—all in one
                reviewable flow.
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
              <CardTitle>Recently launched</CardTitle>
              <CardDescription>Ready and able to place orders.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {recentlyLaunched.map((customer) => (
                <div
                  key={customer.code}
                  className="flex items-center gap-3"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <Check className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {customer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {customer.code}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {customer.date}
                  </span>
                </div>
              ))}
              <div className="mt-1 flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <UserRound className="size-4 shrink-0" aria-hidden="true" />
                Customer contacts receive access only after HQ review.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
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
