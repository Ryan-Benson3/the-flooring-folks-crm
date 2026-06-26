"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button, Card, Chip } from "@/components/dashboard/ui";
import { IconPlus, IconFilePlus, IconWrench } from "@/components/dashboard/icons";
import type { CustomerEnriched } from "@/lib/customer-helpers";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
  invoiceTotal,
  invoiceBalance,
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  ESTIMATE_STATUS_LABELS,
  type InvoiceStatus,
  type EstimateStatus,
} from "@/lib/domain";
import { samplePayments } from "@/lib/sample-data";

export function CustomerDetailPage({ customer }: { customer: CustomerEnriched }) {
  const fullName = `${customer.firstName} ${customer.lastName}`;
  const initials = `${customer.firstName[0] ?? ""}${customer.lastName[0] ?? ""}`.toUpperCase();

  return (
    <DashboardShell activeNavId="customers">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/customers"
            className="text-ink-500 transition hover:text-ink-300"
          >
            Customers
          </Link>
          <span className="text-ink-700">/</span>
          <span className="text-ink-200">{fullName}</span>
        </div>

        {/* Customer header card */}
        <Card className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sage-500/30 to-sage-700/30 text-xl font-bold text-sage-200 ring-1 ring-sage-400/15">
                {initials}
              </span>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-ink-100">
                  {fullName}
                </h1>
                {customer.address && (
                  <p className="mt-1 text-sm text-ink-400">{customer.address}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                  {customer.email && (
                    <a
                      href={`mailto:${customer.email}`}
                      className="text-wood-300 transition hover:text-wood-200"
                    >
                      {customer.email}
                    </a>
                  )}
                  {customer.phone && (
                    <span className="text-ink-300">
                      {formatPhone(customer.phone)}
                    </span>
                  )}
                  <span className="text-ink-500">
                    Customer since {formatDate(customer.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button href="#" variant="ghost" icon={<IconFilePlus />}>
                New estimate
              </Button>
              <Button href="#" icon={<IconPlus />}>
                New job
              </Button>
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="mt-5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                Notes
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-300">
                {customer.notes}
              </p>
            </div>
          )}
        </Card>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            label="Lifetime Revenue"
            value={formatCurrency(customer.totalRevenueCents)}
            tone="sage"
          />
          <KpiCard
            label="Outstanding"
            value={
              customer.outstandingCents > 0
                ? formatCurrency(customer.outstandingCents)
                : "—"
            }
            tone={customer.outstandingCents > 0 ? "clay" : "neutral"}
          />
          <KpiCard
            label="Total Jobs"
            value={String(customer.jobCount)}
            tone="wood"
          />
          <KpiCard
            label="Open Estimates"
            value={String(
              customer.estimates.filter(
                (e) => e.status === "sent" || e.status === "draft",
              ).length,
            )}
            tone="neutral"
          />
        </div>

        {/* Jobs table */}
        {customer.jobs.length > 0 && (
          <Card className="overflow-hidden">
            <div className="border-b border-white/[0.06] px-5 py-3.5">
              <div className="flex items-center gap-2">
                <IconWrench className="h-4 w-4 text-ink-400" />
                <h2 className="text-sm font-semibold text-ink-100">Jobs</h2>
                <span className="text-xs text-ink-500">
                  ({customer.jobs.length})
                </span>
              </div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {customer.jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <p className="text-sm font-semibold text-ink-100">
                        {job.title}
                      </p>
                      <StatusChip
                        label={JOB_STATUS_LABELS[job.status]}
                        color={JOB_STATUS_COLORS[job.status]}
                      />
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-ink-500">
                      <span>
                        {formatCurrencyCompact(job.revenueCents)} revenue
                      </span>
                      {job.scheduledStart && (
                        <span>Starts {formatDate(job.scheduledStart)}</span>
                      )}
                      {job.completedAt && (
                        <span>Completed {formatDate(job.completedAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Invoices + Estimates in two columns */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Invoices */}
          {customer.invoices.length > 0 && (
            <Card className="overflow-hidden">
              <div className="border-b border-white/[0.06] px-5 py-3.5">
                <h2 className="text-sm font-semibold text-ink-100">
                  Invoices ({customer.invoices.length})
                </h2>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {customer.invoices.map((inv) => {
                  const balance = invoiceBalance(inv, samplePayments);
                  return (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink-200">
                          {inv.number}
                        </p>
                        <p className="text-xs text-ink-500">
                          Issued {formatDate(inv.issueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-ink-200">
                          {formatCurrency(invoiceTotal(inv))}
                        </span>
                        <InvoiceStatusChip status={inv.status} balance={balance} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Estimates */}
          {customer.estimates.length > 0 && (
            <Card className="overflow-hidden">
              <div className="border-b border-white/[0.06] px-5 py-3.5">
                <h2 className="text-sm font-semibold text-ink-100">
                  Estimates ({customer.estimates.length})
                </h2>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {customer.estimates.map((est) => (
                  <div
                    key={est.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink-200">
                        {est.number}
                      </p>
                      <p className="text-xs text-ink-500">
                        {formatDate(est.issueDate)}
                      </p>
                    </div>
                    <EstimateStatusChip status={est.status} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

// --- Helper components ---

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "wood" | "sage" | "clay" | "neutral";
}) {
  const tones = {
    wood: "text-wood-200",
    sage: "text-sage-300",
    clay: "text-clay-300",
    neutral: "text-ink-200",
  };
  return (
    <Card className="p-5">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${tones[tone]}`}>{value}</p>
    </Card>
  );
}

function StatusChip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.7rem] font-medium"
      style={{
        backgroundColor: `${color}1a`,
        color,
        boxShadow: `inset 0 0 0 1px ${color}33`,
      }}
    >
      {label}
    </span>
  );
}

function InvoiceStatusChip({
  status,
  balance,
}: {
  status: InvoiceStatus;
  balance: number;
}) {
  const tones: Record<InvoiceStatus, "sage" | "wood" | "clay" | "neutral" | "plum"> = {
    paid: "sage",
    sent: "wood",
    partial: "clay",
    overdue: "clay",
    draft: "neutral",
    void: "neutral",
  };
  return (
    <Chip tone={tones[status]} dot>
      {INVOICE_STATUS_LABELS[status]}
      {balance > 0 && status !== "draft" && status !== "void" && (
        <span className="ml-1 opacity-70">· {formatCurrency(balance)}</span>
      )}
    </Chip>
  );
}

function EstimateStatusChip({ status }: { status: EstimateStatus }) {
  const tones: Record<EstimateStatus, "wood" | "sage" | "clay" | "neutral"> = {
    draft: "neutral",
    sent: "wood",
    accepted: "sage",
    declined: "clay",
    expired: "neutral",
  };
  return (
    <Chip tone={tones[status]} dot>
      {ESTIMATE_STATUS_LABELS[status]}
    </Chip>
  );
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}
