"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button, Card } from "@/components/dashboard/ui";
import { IconPlus, IconSearch } from "@/components/dashboard/icons";
import {
  getEnrichedInvoices,
  searchInvoices,
  invoicePortfolioTotals,
  type InvoiceEnriched,
} from "@/lib/invoice-helpers";
import {
  formatCurrency,
  formatCurrencyCompact,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUSES,
  type InvoiceStatus,
} from "@/lib/domain";

const STATUS_TONES: Record<InvoiceStatus, { color: string; bg: string }> = {
  draft: { color: "#64748b", bg: "rgba(100,116,139,0.1)" },
  sent: { color: "#2563eb", bg: "rgba(37,99,235,0.1)" },
  paid: { color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
  partial: { color: "#d97706", bg: "rgba(217,119,6,0.1)" },
  overdue: { color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
  void: { color: "#71717a", bg: "rgba(113,113,122,0.1)" },
};

type StatusFilter = "all" | InvoiceStatus;

export function InvoicesPage() {
  const all = useMemo(() => getEnrichedInvoices(), []);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<"recent" | "balance" | "due">("recent");

  const totals = useMemo(() => invoicePortfolioTotals(all), [all]);

  const filtered = useMemo(() => {
    let result = searchInvoices(all, query);
    if (statusFilter !== "all") {
      result = result.filter((i) => i.derivedStatus === statusFilter);
    }
    switch (sortBy) {
      case "balance":
        result = [...result].sort((a, b) => b.balanceCents - a.balanceCents);
        break;
      case "due":
        result = [...result].sort((a, b) => a.daysUntilDue - b.daysUntilDue);
        break;
      case "recent":
        result = [...result].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        break;
    }
    return result;
  }, [all, query, statusFilter, sortBy]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const i of all) counts[i.derivedStatus] = (counts[i.derivedStatus] ?? 0) + 1;
    return counts;
  }, [all]);

  return (
    <DashboardShell activeNavId="invoices">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-wood-300/80">
              INVOICES
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">
              {all.length} invoices
            </h1>
            <p className="mt-1.5 text-sm text-ink-400">
              {formatCurrency(totals.totalBilled)} billed ·{" "}
              <span className="text-sage-300">{formatCurrency(totals.totalCollected)} collected</span> ·{" "}
              <span className="text-clay-300">{formatCurrency(totals.totalOutstanding)} outstanding</span>
            </p>
          </div>
          <Button href="#" icon={<IconPlus />}>
            New invoice
          </Button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MiniKpi label="Total Billed" value={formatCurrencyCompact(totals.totalBilled)} tone="wood" />
          <MiniKpi label="Collected" value={formatCurrencyCompact(totals.totalCollected)} tone="sage" />
          <MiniKpi label="Outstanding" value={formatCurrencyCompact(totals.totalOutstanding)} tone="clay" />
          <MiniKpi
            label="Overdue"
            value={totals.overdueCount > 0 ? `${totals.overdueCount} · ${formatCurrencyCompact(totals.overdueAmount)}` : "None"}
            tone={totals.overdueCount > 0 ? "clay" : "sage"}
          />
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
            {(["recent", "balance", "due"] as const).map((key) => (
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
          {INVOICE_STATUSES.map((status) => {
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
                {INVOICE_STATUS_LABELS[status]}
              </StatusPill>
            );
          })}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <Card className="px-5 py-16 text-center">
            <p className="text-sm text-ink-400">No invoices match your filters.</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="hidden grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr_0.5fr] gap-4 border-b border-white/[0.05] px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-600 md:grid">
              <span>Number</span>
              <span>Customer</span>
              <span>Status</span>
              <span>Due</span>
              <span className="text-right">Total</span>
              <span className="text-right">Balance</span>
              <span />
            </div>
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((inv) => (
                <InvoiceRow key={inv.id} invoice={inv} />
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}

function InvoiceRow({ invoice }: { invoice: InvoiceEnriched }) {
  const customerName = invoice.customer
    ? `${invoice.customer.firstName} ${invoice.customer.lastName}`
    : "Unknown";
  const tone = STATUS_TONES[invoice.derivedStatus];
  const dueLabel =
    invoice.daysUntilDue < 0
      ? `${Math.abs(invoice.daysUntilDue)}d overdue`
      : invoice.daysUntilDue === 0
        ? "Due today"
        : `in ${invoice.daysUntilDue}d`;

  return (
    <Link
      href={`/invoices/${invoice.id}`}
      className="group grid grid-cols-1 gap-2 px-5 py-4 transition hover:bg-white/[0.025] md:grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr_0.5fr] md:items-center md:gap-4"
    >
      <div>
        <p className="text-sm font-semibold text-ink-100 group-hover:text-white">{invoice.number}</p>
      </div>
      <div>
        <p className="text-sm text-ink-200">{customerName}</p>
      </div>
      <div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium"
          style={{ backgroundColor: tone.bg, color: tone.color }}
        >
          {INVOICE_STATUS_LABELS[invoice.derivedStatus]}
        </span>
      </div>
      <div className={`text-sm ${invoice.daysUntilDue < 0 ? "font-medium text-clay-300" : "text-ink-400"}`}>
        {dueLabel}
      </div>
      <div className="text-left text-sm font-semibold text-ink-100 md:text-right">
        {formatCurrency(invoice.totalCents)}
      </div>
      <div className={`text-left text-sm font-semibold md:text-right ${invoice.balanceCents > 0 ? "text-clay-300" : "text-sage-300"}`}>
        {invoice.balanceCents > 0 ? formatCurrency(invoice.balanceCents) : "Paid"}
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
