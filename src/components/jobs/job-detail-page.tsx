"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button, Card } from "@/components/dashboard/ui";
import { IconPlus, IconFilePlus } from "@/components/dashboard/icons";
import type { JobEnriched } from "@/lib/job-helpers";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
  formatPercent,
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
} from "@/lib/domain";

export function JobDetailPage({ job }: { job: JobEnriched }) {
  const statusColor = JOB_STATUS_COLORS[job.status];
  const { profit } = job;
  const customerName = job.customer
    ? `${job.customer.firstName} ${job.customer.lastName}`
    : "Unknown customer";

  return (
    <DashboardShell activeNavId="jobs">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/jobs" className="text-ink-500 transition hover:text-ink-300">
            Jobs
          </Link>
          <span className="text-ink-700">/</span>
          <span className="text-ink-200">{job.title}</span>
        </div>

        {/* Job header card */}
        <Card className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-ink-100">
                  {job.title}
                </h1>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium"
                  style={{
                    backgroundColor: `${statusColor}1a`,
                    color: statusColor,
                    boxShadow: `inset 0 0 0 1px ${statusColor}33`,
                  }}
                >
                  {JOB_STATUS_LABELS[job.status]}
                </span>
              </div>
              {job.customer && (
                <Link
                  href={`/customers/${job.customer.id}`}
                  className="mt-2 inline-block text-sm text-wood-300 transition hover:text-wood-200"
                >
                  {customerName}
                </Link>
              )}
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-400">
                {job.address && <span>{job.address}</span>}
                {job.scheduledStart && (
                  <span>Starts {formatDate(job.scheduledStart)}</span>
                )}
                {job.completedAt && (
                  <span>Completed {formatDate(job.completedAt)}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button href="#" variant="ghost" icon={<IconFilePlus />}>
                Add expense
              </Button>
              <Button href="#" icon={<IconPlus />}>
                New invoice
              </Button>
            </div>
          </div>

          {/* Notes */}
          {job.notes && (
            <div className="mt-5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                Notes
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-300">
                {job.notes}
              </p>
            </div>
          )}
        </Card>

        {/* Profitability KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            label="Revenue"
            value={formatCurrency(profit.revenueCents)}
            tone="wood"
          />
          <KpiCard
            label="Cost"
            value={
              profit.costCents > 0
                ? formatCurrency(profit.costCents)
                : "—"
            }
            tone="clay"
          />
          <KpiCard
            label="Profit"
            value={formatCurrency(profit.profitCents)}
            tone="sage"
          />
          <KpiCard
            label="Margin"
            value={
              profit.revenueCents > 0
                ? formatPercent(profit.marginPct)
                : "—"
            }
            tone={profit.marginPct >= 40 ? "sage" : profit.marginPct >= 20 ? "wood" : "clay"}
          />
        </div>

        {/* Two column: expenses + invoices/estimates */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Expenses */}
          {job.expenses.length > 0 && (
            <Card className="overflow-hidden">
              <div className="border-b border-white/[0.06] px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-ink-100">
                    Expenses ({job.expenses.length})
                  </h2>
                  <span className="text-xs font-semibold text-clay-300">
                    {formatCurrencyCompact(profit.costCents)} total
                  </span>
                </div>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {job.expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-ink-200">
                          {exp.vendor}
                        </p>
                        {exp.status === "draft" && (
                          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[0.65rem] font-medium text-ink-400">
                            draft
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-500">
                        {EXPENSE_CATEGORY_LABELS[exp.category]} · {formatDate(exp.incurredDate)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-ink-200">
                      {formatCurrency(exp.amountCents)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost breakdown by category */}
              <CostBreakdown costByCategory={job.costByCategory} />
            </Card>
          )}

          {/* Invoices */}
          <div className="space-y-6">
            {job.invoices.length > 0 && (
              <Card className="overflow-hidden">
                <div className="border-b border-white/[0.06] px-5 py-3.5">
                  <h2 className="text-sm font-semibold text-ink-100">
                    Invoices ({job.invoices.length})
                  </h2>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {job.invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink-200">
                          {inv.number}
                        </p>
                        <p className="text-xs text-ink-500">
                          Due {formatDate(inv.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-ink-200">
                          {formatCurrencyCompact(profit.revenueCents > 0 ? profit.revenueCents : 0)}
                        </span>
                        <span className="text-xs font-medium text-ink-400">
                          {INVOICE_STATUS_LABELS[inv.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {job.estimates.length > 0 && (
              <Card className="overflow-hidden">
                <div className="border-b border-white/[0.06] px-5 py-3.5">
                  <h2 className="text-sm font-semibold text-ink-100">
                    Estimates ({job.estimates.length})
                  </h2>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {job.estimates.map((est) => (
                    <div
                      key={est.id}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink-200">
                          {est.number}
                        </p>
                        <p className="text-xs text-ink-500">
                          Issued {formatDate(est.issueDate)}
                        </p>
                      </div>
                      <span className="text-xs font-medium capitalize text-ink-400">
                        {est.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Timeline */}
            <Card className="overflow-hidden">
              <div className="border-b border-white/[0.06] px-5 py-3.5">
                <h2 className="text-sm font-semibold text-ink-100">Timeline</h2>
              </div>
              <div className="px-5 py-4">
                <div className="space-y-3">
                  <TimelineEntry
                    date={job.createdAt}
                    label="Job created"
                  />
                  {job.scheduledStart && (
                    <TimelineEntry
                      date={job.scheduledStart}
                      label="Scheduled start"
                    />
                  )}
                  {job.completedAt && (
                    <TimelineEntry
                      date={job.completedAt}
                      label="Marked complete"
                    />
                  )}
                  <TimelineEntry
                    date={job.updatedAt}
                    label="Last updated"
                  />
                </div>
              </div>
            </Card>
          </div>
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

function CostBreakdown({
  costByCategory,
}: {
  costByCategory: Record<ExpenseCategory, number>;
}) {
  const entries = Object.entries(costByCategory)
    .filter(([, cents]) => cents > 0)
    .sort((a, b) => b[1] - a[1]) as [ExpenseCategory, number][];

  if (entries.length === 0) return null;

  return (
    <div className="border-t border-white/[0.06] px-5 py-4">
      <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">
        Cost breakdown
      </p>
      <div className="space-y-2">
        {entries.map(([category, cents]) => {
          const total = entries.reduce((s, [, c]) => s + c, 0);
          const pct = (cents / total) * 100;
          return (
            <div key={category} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-ink-400">
                {EXPENSE_CATEGORY_LABELS[category]}
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-clay-500 to-clay-300"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="w-16 shrink-0 text-right text-xs font-medium text-ink-300">
                {formatCurrency(cents)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineEntry({
  date,
  label,
}: {
  date: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-2 w-2 shrink-0 rounded-full bg-wood-400/60" />
      <span className="text-xs text-ink-400">{label}</span>
      <span className="ml-auto text-xs font-medium text-ink-300">
        {formatDate(date, { month: "short", day: "numeric", year: "numeric" })}
      </span>
    </div>
  );
}
