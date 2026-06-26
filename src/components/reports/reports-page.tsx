"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card } from "@/components/dashboard/ui";
import {
  formatCurrency,
  formatCurrencyCompact,
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
} from "@/lib/domain";
import {
  getMonthlyTrends,
  getJobPnlTable,
  getCategoryBreakdown,
  getArAging,
  getRevenueByCustomer,
  getPortfolioTotals,
  getEstimateFunnel,
  type MonthlyTrend,
  type JobPnlRow,
  type CategoryBreakdown,
} from "@/lib/report-helpers";

type Tab = "overview" | "revenue" | "jobs" | "expenses" | "receivables";

export function ReportsPage() {
  const [tab, setTab] = useState<Tab>("overview");

  const trends = useMemo(() => getMonthlyTrends(), []);
  const jobPnl = useMemo(() => getJobPnlTable(), []);
  const categories = useMemo(() => getCategoryBreakdown(), []);
  const arAging = useMemo(() => getArAging(), []);
  const customerRev = useMemo(() => getRevenueByCustomer(), []);
  const totals = useMemo(() => getPortfolioTotals(), []);
  const funnel = useMemo(() => getEstimateFunnel(), []);

  return (
    <DashboardShell activeNavId="reports">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-wood-300/80">
            REPORTS
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">
            Financial reports
          </h1>
          <p className="mt-1.5 text-sm text-ink-400">
            All-time totals through June 2026 · {totals.totalJobs} jobs · {formatCurrency(totals.totalRevenue)} collected
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-1 border-b border-white/[0.06] pb-px">
          {([
            { id: "overview", label: "Overview" },
            { id: "revenue", label: "Revenue" },
            { id: "jobs", label: "Job P&L" },
            { id: "expenses", label: "Expenses" },
            { id: "receivables", label: "A/R Aging" },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-4 py-2.5 text-sm font-medium transition ${
                tab === t.id
                  ? "text-ink-100"
                  : "text-ink-500 hover:text-ink-300"
              }`}
            >
              {t.label}
              {tab === t.id && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-wood-400" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "overview" && <OverviewTab totals={totals} trends={trends} funnel={funnel} arAging={arAging} />}
        {tab === "revenue" && <RevenueTab trends={trends} customerRev={customerRev} totals={totals} />}
        {tab === "jobs" && <JobsTab jobPnl={jobPnl} />}
        {tab === "expenses" && <ExpensesTab categories={categories} trends={trends} />}
        {tab === "receivables" && <ReceivablesTab arAging={arAging} />}
      </div>
    </DashboardShell>
  );
}

// ---------------------------------------------------------------------------
// Overview Tab
// ---------------------------------------------------------------------------

function OverviewTab({
  totals,
  trends,
  funnel,
  arAging,
}: {
  totals: ReturnType<typeof getPortfolioTotals>;
  trends: MonthlyTrend[];
  funnel: ReturnType<typeof getEstimateFunnel>;
  arAging: ReturnType<typeof getArAging>;
}) {
  return (
    <div className="space-y-6">
      {/* Top KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <BigKpi label="Total Revenue" value={formatCurrency(totals.totalRevenue)} tone="sage" />
        <BigKpi label="Total Expenses" value={formatCurrency(totals.totalExpenses)} tone="clay" />
        <BigKpi label="Net Profit" value={formatCurrency(totals.totalProfit)} tone="wood" />
        <BigKpi label="Gross Margin" value={`${totals.overallMargin.toFixed(1)}%`} tone="neutral" />
      </div>

      {/* 6-month trend chart */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink-100">6-month trend</h2>
            <p className="mt-0.5 text-xs text-ink-500">Revenue vs. expenses</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-ink-400">
              <span className="h-2 w-2 rounded-full bg-sage-400" /> Revenue
            </span>
            <span className="inline-flex items-center gap-1.5 text-ink-400">
              <span className="h-2 w-2 rounded-full bg-clay-400" /> Expenses
            </span>
          </div>
        </div>
        <TrendChart trends={trends} />
      </Card>

      {/* Two-column: Jobs + Estimates funnel */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink-100">Pipeline at a glance</h2>
          <div className="mt-4 space-y-3">
            <PipelineRow label="Active jobs" value={totals.activeJobs} sub="In progress or scheduled" />
            <PipelineRow label="Completed jobs" value={totals.completedJobs} sub="Revenue recognized" />
            <PipelineRow label="Avg. completed job" value={formatCurrency(totals.avgJobValue)} sub="Based on collected revenue" />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink-100">Estimate funnel</h2>
          <div className="mt-4 space-y-3">
            <FunnelRow label="Total estimates" value={funnel.total} />
            <FunnelRow label="Accepted" value={funnel.accepted} tone="sage" />
            <FunnelRow label="Pending" value={funnel.sent} tone="wood" />
            <FunnelRow label="Win rate" value={`${funnel.winRate.toFixed(0)}%`} tone="neutral" />
            <div className="mt-3 border-t border-white/[0.06] pt-3">
              <p className="text-xs text-ink-500">Pipeline value</p>
              <p className="mt-1 text-lg font-bold text-ink-100">{formatCurrency(funnel.totalValue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Outstanding A/R summary */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink-100">Outstanding receivables</h2>
            <p className="mt-0.5 text-xs text-ink-500">{formatCurrency(arAging.totalOutstanding)} total · {formatCurrency(arAging.totalOverdue)} overdue</p>
          </div>
          <span className={`text-xs font-semibold ${arAging.totalOverdue > 0 ? "text-clay-300" : "text-sage-300"}`}>
            {arAging.totalOverdue > 0 ? "Action needed" : "All current"}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {arAging.buckets.map((b) => (
            <div key={b.label} className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">{b.label}</p>
              <p className="mt-1 text-base font-bold text-ink-100">{formatCurrency(b.totalCents)}</p>
              <p className="mt-0.5 text-[0.7rem] text-ink-500">{b.count} invoices · {b.sublabel}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Revenue Tab
// ---------------------------------------------------------------------------

function RevenueTab({
  trends,
  customerRev,
}: {
  trends: MonthlyTrend[];
  customerRev: ReturnType<typeof getRevenueByCustomer>;
  totals: ReturnType<typeof getPortfolioTotals>;
}) {
  return (
    <div className="space-y-6">
      {/* Revenue trend chart */}
      <Card className="p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-ink-100">Monthly revenue</h2>
        <TrendChart trends={trends} showExpenses={false} />
      </Card>

      {/* Monthly breakdown table */}
      <Card className="overflow-hidden">
        <div className="border-b border-white/[0.05] px-5 py-3">
          <h2 className="text-sm font-semibold text-ink-100">Monthly breakdown</h2>
        </div>
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] gap-4 border-b border-white/[0.05] px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-600">
          <span>Month</span>
          <span className="text-right">Revenue</span>
          <span className="text-right">Expenses</span>
          <span className="text-right">Profit</span>
          <span className="text-right">Margin</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {trends.map((t) => (
            <div key={t.month} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] gap-4 px-5 py-3 text-sm">
              <span className="font-medium text-ink-200">{t.monthLabel} {t.month.substring(0, 4)}</span>
              <span className="text-right nums text-sage-300">{formatCurrency(t.revenueCents)}</span>
              <span className="text-right nums text-clay-300">{formatCurrency(t.expensesCents)}</span>
              <span className={`text-right nums font-medium ${t.profitCents >= 0 ? "text-ink-100" : "text-clay-400"}`}>
                {formatCurrency(t.profitCents)}
              </span>
              <span className="text-right text-xs text-ink-400">{t.marginPct.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Revenue by customer */}
      <Card className="overflow-hidden">
        <div className="border-b border-white/[0.05] px-5 py-3">
          <h2 className="text-sm font-semibold text-ink-100">Revenue by job</h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {customerRev.map((r) => (
            <Link
              key={r.jobId}
              href={`/jobs/${r.jobId}`}
              className="group grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3.5 transition hover:bg-white/[0.025] md:items-center"
            >
              <div>
                <p className="text-sm font-medium text-ink-100 group-hover:text-white">{r.customerName}</p>
                <p className="truncate text-xs text-ink-500">{r.jobTitle}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm nums text-sage-300">{formatCurrency(r.paidCents)}</p>
                <p className="text-[0.7rem] text-ink-600">Collected</p>
              </div>
              <div className="text-left md:text-right">
                <p className={`text-sm nums ${r.outstandingCents > 0 ? "text-clay-300" : "text-ink-500"}`}>
                  {formatCurrency(r.outstandingCents)}
                </p>
                <p className="text-[0.7rem] text-ink-600">Outstanding</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm font-semibold nums text-ink-100">{formatCurrency(r.totalValue)}</p>
                <p className="text-[0.7rem] text-ink-600">Total value</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Jobs Tab
// ---------------------------------------------------------------------------

function JobsTab({ jobPnl }: { jobPnl: JobPnlRow[] }) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="border-b border-white/[0.05] px-5 py-3">
          <h2 className="text-sm font-semibold text-ink-100">Job profitability analysis</h2>
          <p className="mt-0.5 text-xs text-ink-500">Revenue, cost, and margin per job — sorted by revenue</p>
        </div>

        {/* Desktop table header */}
        <div className="hidden grid-cols-[2.5fr_1fr_1fr_1fr_1fr_0.8fr] gap-4 border-b border-white/[0.05] px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-600 md:grid">
          <span>Job</span>
          <span className="text-right">Revenue</span>
          <span className="text-right">Cost</span>
          <span className="text-right">Profit</span>
          <span className="text-right">Margin</span>
          <span>Status</span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {jobPnl.map((row) => (
            <JobPnlRowDisplay key={row.job.id} row={row} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function JobPnlRowDisplay({ row }: { row: JobPnlRow }) {
  const marginColor = row.marginPct >= 35 ? "#16a34a" : row.marginPct >= 20 ? "#d97706" : "#dc2626";
  const costShare = row.revenueCents > 0 ? (row.costCents / row.revenueCents) * 100 : 0;
  const profitShare = Math.max(0, 100 - costShare);

  return (
    <Link
      href={`/jobs/${row.job.id}`}
      className="group grid grid-cols-1 gap-2 px-5 py-4 transition hover:bg-white/[0.025] md:grid-cols-[2.5fr_1fr_1fr_1fr_1fr_0.8fr] md:items-center md:gap-4"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink-100 group-hover:text-white">{row.customerName}</p>
        <p className="truncate text-xs text-ink-500">{row.job.title}</p>
      </div>
      <div className="text-left md:text-right">
        <p className="nums text-sm font-medium text-ink-100">{formatCurrency(row.revenueCents)}</p>
        <p className="text-[0.7rem] text-ink-600 md:hidden">Revenue</p>
      </div>
      <div className="text-left md:text-right">
        <p className="nums text-sm text-clay-300">{formatCurrency(row.costCents)}</p>
        <p className="text-[0.7rem] text-ink-600 md:hidden">Cost</p>
      </div>
      <div className="text-left md:text-right">
        <p className="nums text-sm font-semibold text-sage-300">{formatCurrency(row.profitCents)}</p>
        <p className="text-[0.7rem] text-ink-600 md:hidden">Profit</p>
      </div>
      <div className="flex items-center gap-2 md:justify-end">
        <span className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-white/[0.05] md:flex">
          <span className="h-full bg-ink-600" style={{ width: `${costShare}%` }} />
          <span className="h-full" style={{ width: `${profitShare}%`, backgroundColor: marginColor }} />
        </span>
        <span className="nums text-sm font-semibold" style={{ color: marginColor }}>
          {row.marginPct.toFixed(0)}%
        </span>
      </div>
      <div>
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-medium"
          style={{
            backgroundColor: `${JOB_STATUS_COLORS[row.status]}20`,
            color: JOB_STATUS_COLORS[row.status],
          }}
        >
          {JOB_STATUS_LABELS[row.status]}
        </span>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Expenses Tab
// ---------------------------------------------------------------------------

function ExpensesTab({
  categories,
  trends,
}: {
  categories: CategoryBreakdown[];
  trends: MonthlyTrend[];
}) {
  const maxCategory = Math.max(...categories.map((c) => c.totalCents), 1);
  const totalExpenses = categories.reduce((sum, c) => sum + c.totalCents, 0);

  return (
    <div className="space-y-6">
      {/* Monthly expense trend */}
      <Card className="p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-ink-100">Monthly expenses</h2>
        <ExpenseTrendChart trends={trends} />
      </Card>

      {/* Category breakdown */}
      <Card className="overflow-hidden">
        <div className="border-b border-white/[0.05] px-5 py-3">
          <h2 className="text-sm font-semibold text-ink-100">Expense categories</h2>
          <p className="mt-0.5 text-xs text-ink-500">{formatCurrency(totalExpenses)} total · non-draft expenses</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {categories.map((cat) => (
            <div key={cat.category} className="px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-ink-100">{cat.label}</span>
                  <span className="text-xs text-ink-600">{cat.count} entries</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="nums text-sm font-semibold text-ink-100">{formatCurrency(cat.totalCents)}</span>
                  <span className="w-12 text-right text-xs text-ink-500">{cat.pctOfTotal.toFixed(0)}%</span>
                </div>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className="h-full rounded-full bg-wood-400/60"
                  style={{ width: `${(cat.totalCents / maxCategory) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Receivables Tab
// ---------------------------------------------------------------------------

function ReceivablesTab({ arAging }: { arAging: ReturnType<typeof getArAging> }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <BigKpi label="Total Outstanding" value={formatCurrency(arAging.totalOutstanding)} tone="wood" />
        <BigKpi label="Total Overdue" value={formatCurrency(arAging.totalOverdue)} tone="clay" />
        <BigKpi
          label="Current"
          value={formatCurrency(arAging.buckets[0]?.totalCents ?? 0)}
          tone="sage"
        />
        <BigKpi
          label="60+ Days"
          value={formatCurrency(arAging.buckets[3]?.totalCents ?? 0)}
          tone="neutral"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-white/[0.05] px-5 py-3">
          <h2 className="text-sm font-semibold text-ink-100">A/R aging buckets</h2>
          <p className="mt-0.5 text-xs text-ink-500">Outstanding invoice balances grouped by days past due</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {arAging.buckets.map((bucket, i) => {
            const pct = arAging.totalOutstanding > 0 ? (bucket.totalCents / arAging.totalOutstanding) * 100 : 0;
            const colors = ["#16a34a", "#d97706", "#dc2626", "#991b1b"];
            return (
              <div key={bucket.label} className="px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink-100">{bucket.label}</p>
                    <p className="text-xs text-ink-500">{bucket.sublabel} · {bucket.count} invoices</p>
                  </div>
                  <div className="text-right">
                    <p className="nums text-sm font-bold text-ink-100">{formatCurrency(bucket.totalCents)}</p>
                    <p className="text-xs text-ink-500">{pct.toFixed(0)}% of total</p>
                  </div>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.max(2, pct)}%`, backgroundColor: colors[i] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared components
// ---------------------------------------------------------------------------

function BigKpi({ label, value, tone }: { label: string; value: string; tone: "wood" | "sage" | "clay" | "neutral" }) {
  const tones = { wood: "text-wood-200", sage: "text-sage-300", clay: "text-clay-300", neutral: "text-ink-200" };
  return (
    <Card className="px-5 py-4">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">{label}</p>
      <p className={`mt-1.5 text-xl font-bold nums ${tones[tone]}`}>{value}</p>
    </Card>
  );
}

function PipelineRow({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-ink-200">{label}</p>
        <p className="text-xs text-ink-500">{sub}</p>
      </div>
      <p className="text-lg font-bold nums text-ink-100">{value}</p>
    </div>
  );
}

function FunnelRow({ label, value, tone }: { label: string; value: string | number; tone?: "sage" | "wood" | "neutral" }) {
  const tones = { sage: "text-sage-300", wood: "text-wood-300", neutral: "text-ink-200" };
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-ink-400">{label}</span>
      <span className={`text-sm font-semibold nums ${tone ? tones[tone] : "text-ink-100"}`}>{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Charts (pure SVG, no external deps)
// ---------------------------------------------------------------------------

function TrendChart({ trends, showExpenses = true }: { trends: MonthlyTrend[]; showExpenses?: boolean }) {
  const w = 800;
  const h = 200;
  const padX = 40;
  const padY = 20;

  const allValues = showExpenses
    ? trends.flatMap((t) => [t.revenueCents, t.expensesCents])
    : trends.map((t) => t.revenueCents);
  const maxVal = Math.max(...allValues, 1);

  const step = (w - padX * 2) / Math.max(1, trends.length - 1);

  const buildPath = (key: "revenueCents" | "expensesCents") => {
    const pts = trends.map((t, i) => {
      const x = padX + i * step;
      const y = h - padY - (t[key] / maxVal) * (h - padY * 2);
      return [x, y] as const;
    });
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
    const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${h - padY} L${pts[0][0].toFixed(1)} ${h - padY} Z`;
    return { line, area, pts };
  };

  const rev = buildPath("revenueCents");
  const exp = showExpenses ? buildPath("expensesCents") : null;

  return (
    <div className="mt-4 w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-48 w-full min-w-[500px]" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6fb386" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6fb386" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={padX}
            y1={h - padY - ratio * (h - padY * 2)}
            x2={w - padX}
            y2={h - padY - ratio * (h - padY * 2)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
        ))}

        {/* Revenue area + line */}
        <path d={rev.area} fill="url(#revGrad)" />
        <path d={rev.line} fill="none" stroke="#6fb386" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Expenses line */}
        {exp && (
          <path d={exp.line} fill="none" stroke="#e08a7c" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />
        )}

        {/* Revenue dots + labels */}
        {rev.pts.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={3.5} fill="#6fb386" />
            <text x={p[0]} y={p[1] - 10} textAnchor="middle" className="fill-ink-400 text-[10px] font-medium">
              {formatCurrencyCompact(trends[i].revenueCents)}
            </text>
            <text x={p[0]} y={h - 4} textAnchor="middle" className="fill-ink-600 text-[11px]">
              {trends[i].monthLabel}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function ExpenseTrendChart({ trends }: { trends: MonthlyTrend[] }) {
  const w = 800;
  const h = 160;
  const padX = 40;
  const padY = 20;
  const maxVal = Math.max(...trends.map((t) => t.expensesCents), 1);
  const step = (w - padX * 2) / Math.max(1, trends.length - 1);
  const barW = step * 0.5;

  return (
    <div className="mt-4 w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full min-w-[500px]" preserveAspectRatio="xMidYMid meet">
        {trends.map((t, i) => {
          const x = padX + i * step - barW / 2;
          const barH = (t.expensesCents / maxVal) * (h - padY * 2);
          const y = h - padY - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx={4} fill="#e08a7c" opacity={0.8} />
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" className="fill-ink-400 text-[10px] font-medium">
                {formatCurrencyCompact(t.expensesCents)}
              </text>
              <text x={x + barW / 2} y={h - 4} textAnchor="middle" className="fill-ink-600 text-[11px]">
                {t.monthLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
