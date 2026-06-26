"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button, Card } from "@/components/dashboard/ui";
import { IconPlus, IconSearch } from "@/components/dashboard/icons";
import {
  getEnrichedJobs,
  searchJobs,
  jobPortfolioTotals,
  type JobEnriched,
} from "@/lib/job-helpers";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatPercent,
  formatDate,
  formatRelativeDate,
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
  JOB_STATUSES,
  type JobStatus,
} from "@/lib/domain";

type StatusFilter = "all" | JobStatus;

export function JobsPage() {
  const allJobs = useMemo(() => getEnrichedJobs(), []);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<"recent" | "profit" | "revenue">("recent");

  const totals = useMemo(() => jobPortfolioTotals(allJobs), [allJobs]);

  const filtered = useMemo(() => {
    let result = searchJobs(allJobs, query);
    if (statusFilter !== "all") {
      result = result.filter((j) => j.status === statusFilter);
    }
    switch (sortBy) {
      case "profit":
        result = [...result].sort(
          (a, b) => b.profit.profitCents - a.profit.profitCents,
        );
        break;
      case "revenue":
        result = [...result].sort(
          (a, b) => b.profit.revenueCents - a.profit.revenueCents,
        );
        break;
      case "recent":
        result = [...result].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        break;
    }
    return result;
  }, [allJobs, query, statusFilter, sortBy]);

  // Status filter counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const job of allJobs) {
      counts[job.status] = (counts[job.status] ?? 0) + 1;
    }
    return counts;
  }, [allJobs]);

  return (
    <DashboardShell activeNavId="jobs">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-wood-300/80">
              JOBS
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">
              {allJobs.length} jobs · {totals.activeCount} active
            </h1>
            <p className="mt-1.5 text-sm text-ink-400">
              {formatCurrency(totals.totalRevenue)} revenue ·{" "}
              <span className="text-sage-300">
                {formatCurrency(totals.totalProfit)} profit ({formatPercent(totals.avgMargin)})
              </span>
            </p>
          </div>
          <Button href="#" icon={<IconPlus />}>
            Add job
          </Button>
        </div>

        {/* Portfolio KPI strip */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MiniKpi label="Revenue" value={formatCurrencyCompact(totals.totalRevenue)} tone="wood" />
          <MiniKpi label="Profit" value={formatCurrencyCompact(totals.totalProfit)} tone="sage" />
          <MiniKpi label="Avg Margin" value={formatPercent(totals.avgMargin)} tone="sage" />
          <MiniKpi label="Outstanding" value={formatCurrencyCompact(totals.totalOutstanding)} tone="clay" />
        </div>

        {/* Search + status filter */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500">
                <IconSearch className="h-[1.05rem] w-[1.05rem]" />
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jobs, customers, addresses…"
                className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-11 pr-4 text-sm text-ink-100 placeholder:text-ink-500 focus:border-wood-400/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-wood-400/20"
              />
            </label>
            <div className="flex items-center gap-2">
              {(["recent", "profit", "revenue"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ${
                    sortBy === key
                      ? "bg-wood-500/15 text-wood-200 ring-1 ring-wood-400/25"
                      : "text-ink-400 hover:bg-white/[0.05] hover:text-ink-200"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2">
            <StatusPill
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              count={allJobs.length}
            >
              All
            </StatusPill>
            {JOB_STATUSES.map((status) => {
              const count = statusCounts[status] ?? 0;
              if (count === 0) return null;
              return (
                <StatusPill
                  key={status}
                  active={statusFilter === status}
                  onClick={() => setStatusFilter(status)}
                  count={count}
                  color={JOB_STATUS_COLORS[status]}
                >
                  {JOB_STATUS_LABELS[status]}
                </StatusPill>
              );
            })}
          </div>
        </div>

        {/* Job cards grid */}
        {filtered.length === 0 ? (
          <Card className="px-5 py-16 text-center">
            <p className="text-sm text-ink-400">
              No jobs match your filters.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <p className="text-center text-xs text-ink-600">
            Showing {filtered.length} of {allJobs.length} jobs
          </p>
        )}
      </div>
    </DashboardShell>
  );
}

function JobCard({ job }: { job: JobEnriched }) {
  const customerName = job.customer
    ? `${job.customer.firstName} ${job.customer.lastName}`
    : "Unknown customer";
  const statusColor = JOB_STATUS_COLORS[job.status];
  const { profit } = job;

  return (
    <Link href={`/jobs/${job.id}`} className="block">
      <Card className="group cursor-pointer p-5 transition hover:border-white/[0.12] hover:bg-white/[0.02]">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[0.95rem] font-semibold text-ink-100 group-hover:text-white">
              {job.title}
            </h3>
            <p className="mt-0.5 truncate text-xs text-ink-500">{customerName}</p>
          </div>
          <span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium"
            style={{
              backgroundColor: `${statusColor}1a`,
              color: statusColor,
              boxShadow: `inset 0 0 0 1px ${statusColor}33`,
            }}
          >
            {JOB_STATUS_LABELS[job.status]}
          </span>
        </div>

        {/* Meta row */}
        <div className="mt-3 flex items-center gap-3 text-xs text-ink-500">
          {job.scheduledStart && (
            <span>Starts {formatRelativeDate(job.scheduledStart)}</span>
          )}
          {job.completedAt && (
            <span>Done {formatDate(job.completedAt)}</span>
          )}
          {job.address && (
            <span className="truncate">{job.address}</span>
          )}
        </div>

        {/* Financial strip */}
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/[0.05] pt-3">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">
              Revenue
            </p>
            <p className="mt-1 text-sm font-semibold text-ink-100">
              {formatCurrencyCompact(profit.revenueCents)}
            </p>
          </div>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">
              Cost
            </p>
            <p className="mt-1 text-sm font-semibold text-clay-300">
              {profit.costCents > 0
                ? formatCurrencyCompact(profit.costCents)
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">
              Margin
            </p>
            <p className={`mt-1 text-sm font-semibold ${profit.marginPct >= 40 ? "text-sage-300" : profit.marginPct >= 20 ? "text-wood-200" : "text-clay-300"}`}>
              {profit.revenueCents > 0 ? formatPercent(profit.marginPct) : "—"}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function MiniKpi({
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
    <Card className="px-4 py-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">
        {label}
      </p>
      <p className={`mt-1 text-lg font-bold ${tones[tone]}`}>{value}</p>
    </Card>
  );
}

function StatusPill({
  active,
  onClick,
  count,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-white/[0.08] text-ink-100 ring-1 ring-white/15"
          : "text-ink-400 hover:bg-white/[0.04] hover:text-ink-200"
      }`}
    >
      {color && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
      <span className="text-ink-600">{count}</span>
    </button>
  );
}
