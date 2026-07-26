"use client";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Mail,
  MapPin,
  PackageCheck,
  PartyPopper,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import type { ReactNode } from "react";

import { ApiErrorNotice } from "@/components/api-error-notice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCustomerAction } from "@/lib/actions/customers";
import type { CustomerSetupOptions, CustomerSummary, DeliveryDay } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Account",
    eyebrow: "Customer profile",
    description: "Who you’re setting up",
    icon: Building2,
  },
  {
    title: "Location",
    eyebrow: "Fulfillment",
    description: "Where orders are going",
    icon: MapPin,
  },
  {
    title: "Ordering",
    eyebrow: "Commercial rules",
    description: "How the account buys",
    icon: CircleDollarSign,
  },
  {
    title: "Access",
    eyebrow: "Team invitation",
    description: "Who places the first order",
    icon: UserRound,
  },
] as const;

type Draft = {
  businessName: string;
  accountCode: string;
  businessType: string;
  contactEmail: string;
  contactPhone: string;
  locationName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  timezone: string;
  warehouseId: string;
  orderMinimum: string;
  priceBookId: string;
  paymentTerms: string;
  deliveryDays: DeliveryDay[];
  orderNotes: string;
  inviteName: string;
  inviteEmail: string;
  inviteRole: "store_manager";
  sendWelcome: boolean;
};

function createInitialDraft(setupOptions: CustomerSetupOptions): Draft {
  return {
  businessName: "",
  accountCode: "",
  businessType: "Independent retailer",
  contactEmail: "",
  contactPhone: "",
  locationName: "",
  address: "",
  city: "",
  state: "CO",
  postalCode: "",
  timezone: "America/Denver",
  warehouseId: setupOptions.warehouses[0]?.id ?? "",
  orderMinimum: "250.00",
  priceBookId:
    setupOptions.priceBooks.find((priceBook) => priceBook.isDefault)?.id ??
    setupOptions.priceBooks[0]?.id ??
    "",
  paymentTerms: "Net 30",
  deliveryDays: ["Tuesday", "Friday"],
  orderNotes: "",
  inviteName: "",
  inviteEmail: "",
  inviteRole: "store_manager",
  sendWelcome: true,
  };
}

const fieldClass =
  "h-10 border-slate-200 bg-white shadow-none focus-visible:ring-slate-900";
const selectClass =
  "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";

export function CustomerOnboarding({
  setupOptions,
}: {
  setupOptions: CustomerSetupOptions;
}) {
  const initialDraft = createInitialDraft(setupOptions);
  const [activeStep, setActiveStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [launchedCustomer, setLaunchedCustomer] =
    useState<CustomerSummary | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<{
    code: string;
    message: string;
  } | null>(null);
  const [isLaunching, startLaunch] = useTransition();

  const progress = ((activeStep + 1) / steps.length) * 100;
  const currentStep = steps[activeStep] ?? steps[0];
  const locationLabel =
    [draft.city, draft.state].filter(Boolean).join(", ") || "Not set";

  const update = <Key extends keyof Draft>(key: Key, value: Draft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const derivedCode = draft.businessName
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();

  const validateCurrentStep = () => {
    const nextErrors: Record<string, string> = {};
    const requireField = (key: keyof Draft, label: string) => {
      if (!String(draft[key]).trim()) {
        nextErrors[key] = `${label} is required`;
      }
    };

    if (activeStep === 0) {
      requireField("businessName", "Business name");
      requireField("accountCode", "Account code");
      requireField("contactEmail", "Contact email");
      if (
        draft.contactEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contactEmail)
      ) {
        nextErrors.contactEmail = "Enter a valid email";
      }
    }
    if (activeStep === 1) {
      requireField("locationName", "Location name");
      requireField("address", "Street address");
      requireField("city", "City");
      requireField("postalCode", "ZIP code");
      requireField("warehouseId", "Fulfillment warehouse");
    }
    if (activeStep === 2) {
      requireField("orderMinimum", "Order minimum");
      requireField("priceBookId", "Price book");
      if (draft.deliveryDays.length === 0) {
        nextErrors.deliveryDays = "Choose at least one delivery day";
      }
    }
    if (activeStep === 3) {
      requireField("inviteName", "Team member name");
      requireField("inviteEmail", "Team member email");
      if (
        draft.inviteEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.inviteEmail)
      ) {
        nextErrors.inviteEmail = "Enter a valid email";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (!validateCurrentStep()) return;
    if (activeStep === steps.length - 1) {
      setSubmitError(null);
      startLaunch(async () => {
        const result = await createCustomerAction(draft);
        if (!result.ok) {
          setSubmitError(result.error);
          return;
        }
        setLaunchedCustomer(result.data.customer);
      });
      return;
    }
    setActiveStep((step) => step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startOver = () => {
    setDraft(createInitialDraft(setupOptions));
    setActiveStep(0);
    setLaunchedCustomer(null);
    setSubmitError(null);
    setErrors({});
  };

  if (launchedCustomer) {
    return (
      <CompletionState
        customer={launchedCustomer}
        onStartOver={startOver}
      />
    );
  }

  return (
    <div className="-my-8 min-h-[calc(100vh-3.5rem)] bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <Link
              href="/customers"
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-950"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Back to customers
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Onboard a customer
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Everything HQ needs to make the first order feel effortless.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 shadow-sm sm:flex">
            <ShieldCheck className="size-3.5 text-emerald-600" aria-hidden="true" />
            Stored only when launched
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-950/10 lg:sticky lg:top-20">
            <div className="border-b border-white/10 p-5">
              <div className="mb-5 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">
                  Customer setup
                </span>
                <span className="text-emerald-300">
                  {activeStep + 1} / {steps.length}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <nav aria-label="Onboarding steps" className="p-3">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === activeStep;
                const isComplete = index < activeStep;
                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => {
                      if (index <= activeStep) {
                        setActiveStep(index);
                        setErrors({});
                      }
                    }}
                    disabled={index > activeStep}
                    aria-current={isActive ? "step" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors",
                      isActive && "bg-white/10",
                      !isActive &&
                        index <= activeStep &&
                        "hover:bg-white/[0.06]",
                      index > activeStep && "cursor-not-allowed opacity-45",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-400",
                        isActive && "bg-white text-slate-950",
                        isComplete &&
                          "border-emerald-400/30 bg-emerald-400/15 text-emerald-300",
                      )}
                    >
                      {isComplete ? (
                        <Check className="size-4" aria-hidden="true" />
                      ) : (
                        <StepIcon className="size-4" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {step.title}
                      </span>
                      <span className="block truncate text-xs text-slate-400">
                        {step.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="m-3 mt-1 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                <ShieldCheck
                  className="size-4 text-emerald-300"
                  aria-hidden="true"
                />
                Ready for review
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Access is activated only after the final account review.
              </p>
            </div>
          </aside>

          <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-white px-6 py-6 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                {currentStep.eyebrow}
              </p>
              <CardTitle className="mt-1 text-xl text-slate-950 sm:text-2xl">
                {stepHeading(activeStep)}
              </CardTitle>
              <CardDescription className="max-w-xl text-slate-500">
                {stepDescription(activeStep)}
              </CardDescription>
            </CardHeader>

            <CardContent className="bg-white p-6 sm:p-8">
              {activeStep === 0 ? (
                <AccountStep
                  draft={draft}
                  errors={errors}
                  derivedCode={derivedCode}
                  update={update}
                />
              ) : null}
              {activeStep === 1 ? (
                <LocationStep
                  draft={draft}
                  errors={errors}
                  setupOptions={setupOptions}
                  update={update}
                />
              ) : null}
              {activeStep === 2 ? (
                <OrderingStep
                  draft={draft}
                  errors={errors}
                  setupOptions={setupOptions}
                  update={update}
                />
              ) : null}
              {activeStep === 3 ? (
                <AccessStep
                  draft={draft}
                  errors={errors}
                  locationLabel={locationLabel}
                  setupOptions={setupOptions}
                  update={update}
                />
              ) : null}
              {submitError ? (
                <ApiErrorNotice error={submitError} className="mt-6" />
              ) : null}
            </CardContent>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-8">
              <Button
                type="button"
                variant="ghost"
                disabled={activeStep === 0}
                onClick={() => {
                  setActiveStep((step) => Math.max(step - 1, 0));
                  setErrors({});
                }}
                className="text-slate-600"
              >
                <ArrowLeft aria-hidden="true" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-slate-400 sm:inline">
                  Step {activeStep + 1} of {steps.length}
                </span>
                <Button
                  type="button"
                  onClick={goNext}
                  disabled={isLaunching}
                  className="min-w-28 bg-slate-950 hover:bg-slate-800"
                >
                  {activeStep === steps.length - 1 ? (
                    <>
                      {isLaunching ? "Launching…" : "Launch account"}
                      <Sparkles aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

type StepProps = {
  draft: Draft;
  errors: Record<string, string>;
  update: <Key extends keyof Draft>(key: Key, value: Draft[Key]) => void;
};

function AccountStep({
  draft,
  errors,
  derivedCode,
  update,
}: StepProps & { derivedCode: string }) {
  return (
    <div className="grid gap-6">
      <Field
        label="Business name"
        htmlFor="businessName"
        error={errors.businessName}
        hint="Use the name customers will recognize on invoices and orders."
      >
        <Input
          id="businessName"
          value={draft.businessName}
          onChange={(event) => {
            const name = event.target.value;
            update("businessName", name);
            if (!draft.accountCode || draft.accountCode === derivedCode) {
              update(
                "accountCode",
                name
                  .replace(/[^a-zA-Z0-9 ]/g, "")
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 4)
                  .toUpperCase(),
              );
            }
          }}
          placeholder="e.g. Juniper Market Group"
          className={fieldClass}
          aria-invalid={Boolean(errors.businessName)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Account code"
          htmlFor="accountCode"
          error={errors.accountCode}
          hint="A short code used in operations."
        >
          <div className="relative">
            <Input
              id="accountCode"
              value={draft.accountCode}
              onChange={(event) =>
                update("accountCode", event.target.value.toUpperCase())
              }
              placeholder="JMG"
              maxLength={8}
              className={cn(fieldClass, "pr-16 font-mono uppercase")}
              aria-invalid={Boolean(errors.accountCode)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-500">
              Unique
            </span>
          </div>
        </Field>
        <Field label="Business type" htmlFor="businessType">
          <select
            id="businessType"
            className={selectClass}
            value={draft.businessType}
            onChange={(event) => update("businessType", event.target.value)}
          >
            <option>Independent retailer</option>
            <option>Regional chain</option>
            <option>Convenience store</option>
            <option>Hospitality</option>
            <option>Other</option>
          </select>
        </Field>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-950">
            Primary business contact
          </h3>
          <p className="text-xs text-slate-500">
            Where HQ should send account and billing communication.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Contact email"
            htmlFor="contactEmail"
            error={errors.contactEmail}
          >
            <Input
              id="contactEmail"
              type="email"
              value={draft.contactEmail}
              onChange={(event) => update("contactEmail", event.target.value)}
              placeholder="operations@junipermarket.com"
              className={fieldClass}
              aria-invalid={Boolean(errors.contactEmail)}
            />
          </Field>
          <Field label="Phone number" htmlFor="contactPhone" optional>
            <Input
              id="contactPhone"
              type="tel"
              value={draft.contactPhone}
              onChange={(event) => update("contactPhone", event.target.value)}
              placeholder="(303) 555-0142"
              className={fieldClass}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function LocationStep({
  draft,
  errors,
  setupOptions,
  update,
}: StepProps & { setupOptions: CustomerSetupOptions }) {
  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
        <div className="flex gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Store className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-emerald-950">
              Start with the primary ordering location
            </p>
            <p className="mt-0.5 text-xs leading-5 text-emerald-800/80">
              More locations can be added after this account is launched.
            </p>
          </div>
        </div>
      </div>

      <Field
        label="Location name"
        htmlFor="locationName"
        error={errors.locationName}
      >
        <Input
          id="locationName"
          value={draft.locationName}
          onChange={(event) => update("locationName", event.target.value)}
          placeholder="e.g. Pearl Street"
          className={fieldClass}
          aria-invalid={Boolean(errors.locationName)}
        />
      </Field>

      <Field
        label="Street address"
        htmlFor="address"
        error={errors.address}
      >
        <Input
          id="address"
          value={draft.address}
          onChange={(event) => update("address", event.target.value)}
          placeholder="1420 Pearl Street"
          className={fieldClass}
          aria-invalid={Boolean(errors.address)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-[1fr_100px_130px]">
        <Field label="City" htmlFor="city" error={errors.city}>
          <Input
            id="city"
            value={draft.city}
            onChange={(event) => update("city", event.target.value)}
            placeholder="Boulder"
            className={fieldClass}
            aria-invalid={Boolean(errors.city)}
          />
        </Field>
        <Field label="State" htmlFor="state">
          <select
            id="state"
            className={selectClass}
            value={draft.state}
            onChange={(event) => update("state", event.target.value)}
          >
            <option>CO</option>
            <option>WY</option>
            <option>UT</option>
            <option>NM</option>
          </select>
        </Field>
        <Field
          label="ZIP code"
          htmlFor="postalCode"
          error={errors.postalCode}
        >
          <Input
            id="postalCode"
            value={draft.postalCode}
            onChange={(event) => update("postalCode", event.target.value)}
            placeholder="80302"
            className={fieldClass}
            aria-invalid={Boolean(errors.postalCode)}
          />
        </Field>
      </div>

      <div className="grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
        <Field
          label="Fulfillment warehouse"
          htmlFor="warehouseId"
          error={errors.warehouseId}
        >
          <select
            id="warehouseId"
            className={selectClass}
            value={draft.warehouseId}
            onChange={(event) => update("warehouseId", event.target.value)}
            aria-invalid={Boolean(errors.warehouseId)}
          >
            {setupOptions.warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.code} — {warehouse.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Location timezone" htmlFor="timezone">
          <select
            id="timezone"
            className={selectClass}
            value={draft.timezone}
            onChange={(event) => update("timezone", event.target.value)}
          >
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

function OrderingStep({
  draft,
  errors,
  setupOptions,
  update,
}: StepProps & { setupOptions: CustomerSetupOptions }) {
  const days = [
    { short: "Mon", full: "Monday" },
    { short: "Tue", full: "Tuesday" },
    { short: "Wed", full: "Wednesday" },
    { short: "Thu", full: "Thursday" },
    { short: "Fri", full: "Friday" },
  ] as const satisfies ReadonlyArray<{ short: string; full: DeliveryDay }>;

  return (
    <div className="grid gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Price book"
          htmlFor="priceBookId"
          error={errors.priceBookId}
        >
          <select
            id="priceBookId"
            className={selectClass}
            value={draft.priceBookId}
            onChange={(event) => update("priceBookId", event.target.value)}
            aria-invalid={Boolean(errors.priceBookId)}
          >
            {setupOptions.priceBooks.map((priceBook) => (
              <option key={priceBook.id} value={priceBook.id}>
                {priceBook.name}
                {priceBook.isDefault ? " (default)" : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Payment terms" htmlFor="paymentTerms">
          <select
            id="paymentTerms"
            className={selectClass}
            value={draft.paymentTerms}
            onChange={(event) => update("paymentTerms", event.target.value)}
          >
            <option>Due on receipt</option>
            <option>Net 15</option>
            <option>Net 30</option>
            <option>Net 45</option>
          </select>
        </Field>
      </div>

      <Field
        label="Minimum order"
        htmlFor="orderMinimum"
        error={errors.orderMinimum}
        hint="Orders below this amount can be saved, but not submitted."
      >
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            $
          </span>
          <Input
            id="orderMinimum"
            inputMode="decimal"
            value={draft.orderMinimum}
            onChange={(event) => update("orderMinimum", event.target.value)}
            className={cn(fieldClass, "pl-7")}
            aria-invalid={Boolean(errors.orderMinimum)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            USD
          </span>
        </div>
      </Field>

      <fieldset>
        <legend className="text-sm font-medium text-slate-900">
          Standard delivery days
        </legend>
        <p className="mt-1 text-xs text-slate-500">
          Select the days this location can receive shipments.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {days.map((day) => {
            const selected = draft.deliveryDays.includes(day.full);
            return (
              <button
                key={day.full}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  update(
                    "deliveryDays",
                    selected
                      ? draft.deliveryDays.filter((item) => item !== day.full)
                      : [...draft.deliveryDays, day.full],
                  )
                }
                className={cn(
                  "flex h-10 min-w-14 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors",
                  selected
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-400",
                )}
              >
                {day.short}
              </button>
            );
          })}
        </div>
        {errors.deliveryDays ? (
          <p className="mt-2 text-xs text-red-600">{errors.deliveryDays}</p>
        ) : null}
      </fieldset>

      <Field
        label="Internal fulfillment notes"
        htmlFor="orderNotes"
        optional
        hint="Visible to HQ and warehouse teams, not the customer."
      >
        <Textarea
          id="orderNotes"
          value={draft.orderNotes}
          onChange={(event) => update("orderNotes", event.target.value)}
          placeholder="Loading dock, receiving hours, delivery instructions…"
          className="min-h-24 border-slate-200 bg-white shadow-none focus-visible:ring-slate-900"
        />
      </Field>
    </div>
  );
}

function AccessStep({
  draft,
  errors,
  locationLabel,
  setupOptions,
  update,
}: StepProps & {
  locationLabel: string;
  setupOptions: CustomerSetupOptions;
}) {
  const warehouseName =
    setupOptions.warehouses.find(
      (warehouse) => warehouse.id === draft.warehouseId,
    )?.name ?? "Not set";
  const priceBookName =
    setupOptions.priceBooks.find(
      (priceBook) => priceBook.id === draft.priceBookId,
    )?.name ?? "Not set";

  return (
    <div className="grid gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Team member name"
          htmlFor="inviteName"
          error={errors.inviteName}
        >
          <Input
            id="inviteName"
            value={draft.inviteName}
            onChange={(event) => update("inviteName", event.target.value)}
            placeholder="Taylor Morgan"
            className={fieldClass}
            aria-invalid={Boolean(errors.inviteName)}
          />
        </Field>
        <Field
          label="Work email"
          htmlFor="inviteEmail"
          error={errors.inviteEmail}
        >
          <Input
            id="inviteEmail"
            type="email"
            value={draft.inviteEmail}
            onChange={(event) => update("inviteEmail", event.target.value)}
            placeholder="taylor@junipermarket.com"
            className={fieldClass}
            aria-invalid={Boolean(errors.inviteEmail)}
          />
        </Field>
      </div>

      <Field label="Role and access" htmlFor="inviteRole">
        <select
          id="inviteRole"
          className={selectClass}
          value={draft.inviteRole}
          onChange={() => update("inviteRole", "store_manager")}
        >
          <option value="store_manager">Store manager</option>
        </select>
      </Field>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50">
        <input
          type="checkbox"
          checked={draft.sendWelcome}
          onChange={(event) => update("sendWelcome", event.target.checked)}
          className="mt-0.5 size-4 rounded border-slate-300 accent-slate-950"
        />
        <span>
          <span className="block text-sm font-medium text-slate-950">
            Flag this invitation for welcome-email delivery
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            Records the delivery request with the invitation for the email
            delivery service.
          </span>
        </span>
      </label>

      <div className="border-t border-slate-100 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Account review
            </h3>
            <p className="text-xs text-slate-500">
              Confirm the launch details before activating access.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            Ready
          </span>
        </div>
        <div className="grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
          <ReviewItem
            icon={Building2}
            label="Customer"
            value={draft.businessName || "Not set"}
          />
          <ReviewItem
            icon={Store}
            label="Primary location"
            value={draft.locationName || "Not set"}
            detail={locationLabel}
          />
          <ReviewItem
            icon={Warehouse}
            label="Fulfilled by"
            value={warehouseName}
          />
          <ReviewItem
            icon={PackageCheck}
            label="Ordering"
            value={`${priceBookName} · $${draft.orderMinimum} minimum`}
          />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor} className="text-slate-900">
          {label}
        </Label>
        {optional ? (
          <span className="text-[11px] text-slate-400">Optional</span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs leading-5 text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

function ReviewItem({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex gap-3 bg-white p-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-900">
          {value}
        </p>
        {detail ? (
          <p className="truncate text-xs text-slate-500">{detail}</p>
        ) : null}
      </div>
    </div>
  );
}

function CompletionState({
  customer,
  onStartOver,
}: {
  customer: CustomerSummary;
  onStartOver: () => void;
}) {
  const locationLabel =
    [customer.location.city, customer.location.state]
      .filter(Boolean)
      .join(", ") || customer.location.code;

  return (
    <div className="-my-8 flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-xl shadow-slate-950/5">
          <div className="relative overflow-hidden bg-slate-950 px-6 py-9 text-center text-white sm:px-10">
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-16 size-48 rounded-full bg-emerald-400/10 blur-2xl"
            />
            <span className="relative mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20">
              <PartyPopper className="size-7" />
            </span>
            <p className="relative mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Account created
            </p>
            <h1 className="relative mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {customer.name} is awaiting activation.
            </h1>
            <p className="relative mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-300">
              The customer, store, commercial rules, manager access, and
              invitation were committed together. Ordering opens when the
              manager accepts the invitation.
            </p>
          </div>

          <CardContent className="p-6 sm:p-8">
            <div className="grid gap-3 sm:grid-cols-3">
              <LaunchFact
                icon={Store}
                label="Location"
                value={customer.location.name}
                detail={locationLabel}
              />
              <LaunchFact
                icon={CircleDollarSign}
                label="Terms"
                value={customer.paymentTerms}
                detail={`${customer.orderMinimum} minimum`}
              />
              <LaunchFact
                icon={Mail}
                label="Access"
                value={customer.manager?.fullName ?? "Invited manager"}
                detail={
                  customer.invitation?.deliveryRequested
                    ? "Invitation delivery requested"
                    : "Invitation created"
                }
              />
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <CheckCircle2
                className="mt-0.5 size-5 shrink-0 text-emerald-700"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-emerald-950">
                  Invitation is pending
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-800">
                  {customer.manager?.email ?? customer.primaryContactEmail} has
                  scoped access to {customer.location.name}, but remains
                  inactive until the invitation is accepted.
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={onStartOver}
                className="text-slate-600"
              >
                <RotateCcw aria-hidden="true" />
                Onboard another
              </Button>
              <Button asChild className="bg-slate-950 hover:bg-slate-800">
                <Link href="/customers">
                  View customers
                  <ChevronRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LaunchFact({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Store;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <Icon className="size-4 text-slate-400" aria-hidden="true" />
      <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-950">
        {value}
      </p>
      <p className="mt-0.5 truncate text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function stepHeading(step: number) {
  return [
    "Who are we welcoming?",
    "Set up the first ordering location",
    "Define how this account orders",
    "Invite the customer team",
  ][step];
}

function stepDescription(step: number) {
  return [
    "Create the account identity and give HQ a reliable primary contact.",
    "Connect the customer’s store to the warehouse and delivery network.",
    "Assign the defaults that shape pricing, checkout, and fulfillment.",
    "Grant location-specific access, then review everything before launch.",
  ][step];
}
