"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button, Card } from "@/components/dashboard/ui";
import { IconPlus, IconSearch } from "@/components/dashboard/icons";
import {
  getEnrichedEstimates,
  searchEstimates,
  estimatePortfolioTotals,
  type EstimateEnriched,
} from "@/lib/estimate-helpers";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
  ESTIMATE_STATUS_LABELS,
  ESTIMATE_STATUSES,
  type EstimateStatus,
} from "@/lib/domain";

const STATUS_TONES: Record<EstimateStatus, { color: string; bg: string }> = {
  draft: { color: "#64748b", bg: "rgba(100,116,139,0.1)" },
  sent: { color: "#2563eb", bg: "rgba(37,99,235,0.1)" },
  accepted: { color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
  declined: { color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
  expired: { color: "#71717a", bg: "rgba(113,113,122,0.1)" },
};

type StatusFilter = "all" | EstimateStatus;

export function EstimatesPage() {
  const all = useMemo(() => getEnrichedEstimates(), []);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<"recent" | "value">("recent");

  const totals = useMemo(() => estimatePortfolioTotals(all), [all]);

  const filtered = useMemo(() => {
    let result = searchEstimates(all, query);
    if (statusFilter !== "all") {
      result = result.filter((e) => e.status === statusFilter);
    }
    if (sortBy === "value") {
      result = [...result].sort((a, b) => b.totalCents - a.totalCents);
    } else {
      result = [...result].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }
    return result;
  }, [all, query, statusFilter, sortBy]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of all) counts[e.status] = (counts[e.status] ?? 0) + 1;
    return counts;
  }, [all]);

  return (
    <DashboardShell activeNavId="estimates">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-wood-300/80">
              ESTIMATES
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">
              {all.length} estimates
            </h1>
            <p className="mt-1.5 text-sm text-ink-400">
              {formatCurrency(totals.totalValue)} total value ·{" "}
              <span className="text-sage-300">{totals.acceptedCount} accepted</span> ·{" "}
              {totals.pendingCount} pending
            </p>
          </div>
          <Button href="#" icon={<IconPlus />}>
            New estimate
          </Button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MiniKpi label="Total Value" value={formatCurrencyCompact(totals.totalValue)} tone="wood" />
          <MiniKpi label="Accepted" value={formatCurrencyCompact(totals.acceptedValue)} tone="sage" />
          <MiniKpi label="Pending" value={`${totals.pendingCount}`} tone="neutral" />
          <MiniKpi label="Win Rate" value={all.length > 0 ? `${Math.round((totals.acceptedCount / all.length) * 100)}%` : "—"} tone="sage" />
        </div>

        {/* Search + sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500">
              <IconSearch className="h-[1.05rem] w-[1.05rem]" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by number, customer, or job…"
              className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-11 pr-4 text-sm text-ink-100 placeholder:text-ink-500 focus:border-wood-400/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-wood-400/20"
            />
          </label>
          <div className="flex items-center gap-2">
            {(["recent", "value"] as const).map((key) => (
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
          <StatusPill active={statusFilter === "all"} onClick={() => setStatusFilter("all")} count={all.length}>
            All
          </StatusPill>
          {ESTIMATE_STATUSES.map((status) => {
            const count = statusCounts[status] ?? 0;
            if (count === 0) return null;
            return (
              <StatusPill
                key={status}
                active={statusFilter === status}
                onClick={() => setStatusFilter(status)}
                count={count}
                color={STATUS_TONES[status].color}
              >
                {ESTIMATE_STATUS_LABELS[status]}
              </StatusPill>
            );
          })}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <Card className="px-5 py-16 text-center">
            <p className="text-sm text-ink-400">No estimates match your filters.</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="hidden grid-cols-[1.5fr_2fr_1fr_1fr_1fr_0.5fr] gap-4 border-b border-white/[0.05] px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-600 md:grid">
              <span>Number</span>
              <span>Customer</span>
              <span>Status</span>
              <span>Issued</span>
              <span className="text-right">Total</span>
              <span />
            </div>
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((est) => (
                <EstimateRow key={est.id} estimate={est} />
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}

function EstimateRow({ estimate }: { estimate: EstimateEnriched }) {
  const customerName = estimate.customer
    ? `${estimate.customer.firstName} ${estimate.customer.lastName}`
    : "Unknown";
  const tone = STATUS_TONES[estimate.status];

  return (
    <Link
      href={`/estimates/${estimate.id}`}
      className="group grid grid-cols-1 gap-2 px-5 py-4 transition hover:bg-white/[0.025] md:grid-cols-[1.5fr_2fr_1fr_1fr_1fr_0.5fr] md:items-center md:gap-4"
    >
      <div>
        <p className="text-sm font-semibold text-ink-100 group-hover:text-white">{estimate.number}</p>
        {estimate.job && <p className="truncate text-xs text-ink-500">{estimate.job.title}</p>}
      </div>
      <div>
        <p className="text-sm text-ink-200">{customerName}</p>
      </div>
      <div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium"
          style={{ backgroundColor: tone.bg, color: tone.color }}
        >
          {ESTIMATE_STATUS_LABELS[estimate.status]}
        </span>
      </div>
      <div className="text-sm text-ink-400">{formatDate(estimate.issueDate)}</div>
      <div className="text-left text-sm font-semibold text-ink-100 md:text-right">
        {formatCurrency(estimate.totalCents)}
      </div>
      <div className="hidden text-right text-ink-600 md:block">
        <svg className="ml-auto h-4 w-4 transition group-hover:translate-x-0.5 group-hover:text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

function MiniKpi({ label, value, tone }: { label: string; value: string; tone: "wood" | "sage" | "clay" | "neutral" }) {
  const tones = { wood: "text-wood-200", sage: "text-sage-300", clay: "text-clay-300", neutral: "text-ink-200" };
  return (
    <Card className="px-4 py-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">{label}</p>
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
        active ? "bg-white/[0.08] text-ink-100 ring-1 ring-white/15" : "text-ink-400 hover:bg-white/[0.04] hover:text-ink-200"
      }`}
    >
      {color && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />}
      {children}
      <span className="text-ink-600">{count}</span>
    </button>
  );
}
