"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button, Card } from "@/components/dashboard/ui";
import { IconDollar, IconSearch } from "@/components/dashboard/icons";
import {
  getEnrichedExpenses,
  searchExpenses,
  expensePortfolioTotals,
  expenseCategoryTotals,
  type ExpenseEnriched,
} from "@/lib/expense-helpers";
import {
  formatCurrency,
  formatCurrencyCompact,
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
  type ExpenseStatus,
} from "@/lib/domain";

const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  draft: "Draft",
  reviewed: "Reviewed",
  approved: "Approved",
};

const STATUS_TONES: Record<ExpenseStatus, { color: string; bg: string }> = {
  draft: { color: "#d97706", bg: "rgba(217,119,6,0.1)" },
  reviewed: { color: "#2563eb", bg: "rgba(37,99,235,0.1)" },
  approved: { color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
};

type StatusFilter = "all" | ExpenseStatus;
type CategoryFilter = "all" | ExpenseCategory;

export function ExpensesPage() {
  const all = useMemo(() => getEnrichedExpenses(), []);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const totals = useMemo(() => expensePortfolioTotals(all), [all]);
  const categories = useMemo(() => expenseCategoryTotals(all), [all]);

  const filtered = useMemo(() => {
    let result = searchExpenses(all, query);
    if (statusFilter !== "all") result = result.filter((e) => e.status === statusFilter);
    if (categoryFilter !== "all") result = result.filter((e) => e.category === categoryFilter);
    return [...result].sort(
      (a, b) => new Date(b.incurredDate).getTime() - new Date(a.incurredDate).getTime(),
    );
  }, [all, query, statusFilter, categoryFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of all) counts[e.status] = (counts[e.status] ?? 0) + 1;
    return counts;
  }, [all]);

  return (
    <DashboardShell activeNavId="expenses">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-wood-300/80">
              EXPENSES
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">
              {all.length} expenses
            </h1>
            <p className="mt-1.5 text-sm text-ink-400">
              {formatCurrency(totals.totalAmount)} total ·{" "}
              <span className="text-sage-300">{formatCurrency(totals.approvedAmount)} approved</span> ·{" "}
              {totals.jobLinkedCount} job-linked
            </p>
          </div>
          <Button href="#" icon={<IconDollar />}>
            Add expense
          </Button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MiniKpi label="Total" value={formatCurrencyCompact(totals.totalAmount)} tone="wood" />
          <MiniKpi label="Approved" value={formatCurrencyCompact(totals.approvedAmount)} tone="sage" />
          <MiniKpi label="Drafts" value={`${totals.draftCount}`} tone="clay" />
          <MiniKpi label="Job-linked" value={`${totals.jobLinkedCount}`} tone="neutral" />
        </div>

        {/* Category breakdown */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                categoryFilter === "all"
                  ? "bg-white/[0.08] text-ink-100 ring-1 ring-white/15"
                  : "text-ink-400 hover:bg-white/[0.04] hover:text-ink-200"
              }`}
            >
              All categories
            </button>
            {categories.map(({ category, count, totalCents }) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  categoryFilter === category
                    ? "bg-white/[0.08] text-ink-100 ring-1 ring-white/15"
                    : "text-ink-400 hover:bg-white/[0.04] hover:text-ink-200"
                }`}
              >
                {EXPENSE_CATEGORY_LABELS[category]}
                <span className="text-ink-600">{count}</span>
                <span className="text-ink-500">· {formatCurrencyCompact(totalCents)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Search + status pills */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500">
              <IconSearch className="h-[1.05rem] w-[1.05rem]" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by vendor, job, or notes…"
              className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-11 pr-4 text-sm text-ink-100 placeholder:text-ink-500 focus:border-wood-400/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-wood-400/20"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill active={statusFilter === "all"} onClick={() => setStatusFilter("all")} count={all.length}>
              All
            </StatusPill>
            {(["draft", "reviewed", "approved"] as const).map((status) => {
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
                  {EXPENSE_STATUS_LABELS[status]}
                </StatusPill>
              );
            })}
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <Card className="px-5 py-16 text-center">
            <p className="text-sm text-ink-400">No expenses match your filters.</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="hidden grid-cols-[2fr_1.5fr_1fr_1fr_1fr_0.5fr] gap-4 border-b border-white/[0.05] px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-600 md:grid">
              <span>Vendor</span>
              <span>Job</span>
              <span>Category</span>
              <span>Status</span>
              <span className="text-right">Amount</span>
              <span />
            </div>
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((exp) => (
                <ExpenseRow key={exp.id} expense={exp} />
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}

function ExpenseRow({ expense }: { expense: ExpenseEnriched }) {
  const tone = STATUS_TONES[expense.status];
  return (
    <Link
      href={`/expenses/${expense.id}`}
      className="group grid grid-cols-1 gap-2 px-5 py-4 transition hover:bg-white/[0.025] md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_0.5fr] md:items-center md:gap-4"
    >
      <div>
        <p className="text-sm font-semibold text-ink-100 group-hover:text-white">{expense.vendor}</p>
        {expense.receipt && (
          <p className="text-xs text-wood-300/60">📎 Receipt linked</p>
        )}
      </div>
      <div>
        <p className="truncate text-sm text-ink-300">
          {expense.job ? expense.job.title : <span className="text-ink-600">—</span>}
        </p>
      </div>
      <div>
        <span className="text-xs font-medium text-ink-400">{EXPENSE_CATEGORY_LABELS[expense.category]}</span>
      </div>
      <div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium"
          style={{ backgroundColor: tone.bg, color: tone.color }}
        >
          {EXPENSE_STATUS_LABELS[expense.status]}
        </span>
      </div>
      <div className="text-left text-sm font-semibold text-ink-100 md:text-right">
        {formatCurrency(expense.amountCents)}
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
