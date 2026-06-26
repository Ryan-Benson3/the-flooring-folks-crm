"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button, Card } from "@/components/dashboard/ui";
import { IconScan, IconSearch } from "@/components/dashboard/icons";
import {
  getEnrichedReceipts,
  searchReceipts,
  receiptQueueSummary,
  type ReceiptEnriched,
} from "@/lib/receipt-helpers";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
  type ReceiptReviewStatus,
} from "@/lib/domain";

const REVIEW_STATUS_LABELS: Record<ReceiptReviewStatus, string> = {
  pending_review: "Pending review",
  reviewed: "Reviewed",
  needs_edits: "Needs edits",
  rejected: "Rejected",
};

const STATUS_TONES: Record<ReceiptReviewStatus, { color: string; bg: string }> = {
  pending_review: { color: "#d97706", bg: "rgba(217,119,6,0.1)" },
  reviewed: { color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
  needs_edits: { color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
  rejected: { color: "#71717a", bg: "rgba(113,113,122,0.1)" },
};

type StatusFilter = "all" | ReceiptReviewStatus;

export function ReceiptsPage() {
  const all = useMemo(() => getEnrichedReceipts(), []);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const summary = useMemo(() => receiptQueueSummary(all), [all]);

  const filtered = useMemo(() => {
    let result = searchReceipts(all, query);
    if (statusFilter !== "all") {
      result = result.filter((r) => r.reviewStatus === statusFilter);
    }
    return [...result].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [all, query, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of all) counts[r.reviewStatus] = (counts[r.reviewStatus] ?? 0) + 1;
    return counts;
  }, [all]);

  return (
    <DashboardShell activeNavId="receipts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-wood-300/80">
              RECEIPTS
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">
              {all.length} receipts
            </h1>
            <p className="mt-1.5 text-sm text-ink-400">
              {summary.pending.length} pending review ·{" "}
              {summary.needsEdits.length} need edits ·{" "}
              {formatCurrency(summary.totalAmount)} scanned value
            </p>
          </div>
          <Button href="#" icon={<IconScan />}>
            Scan receipt
          </Button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MiniKpi label="In Queue" value={`${summary.pending.length + summary.needsEdits.length}`} tone="clay" />
          <MiniKpi label="Scanned Value" value={formatCurrencyCompact(summary.totalAmount)} tone="wood" />
          <MiniKpi label="Reviewed" value={`${summary.reviewed.length}`} tone="sage" />
          <MiniKpi label="Low Confidence" value={`${all.filter((r) => r.hasLowConfidence).length}`} tone="neutral" />
        </div>

        {/* Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500">
              <IconSearch className="h-[1.05rem] w-[1.05rem]" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by vendor or job…"
              className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-11 pr-4 text-sm text-ink-100 placeholder:text-ink-500 focus:border-wood-400/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-wood-400/20"
            />
          </label>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2">
          <StatusPill active={statusFilter === "all"} onClick={() => setStatusFilter("all")} count={all.length}>
            All
          </StatusPill>
          {(["pending_review", "reviewed", "needs_edits", "rejected"] as const).map((status) => {
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
                {REVIEW_STATUS_LABELS[status]}
              </StatusPill>
            );
          })}
        </div>

        {/* Receipt cards */}
        {filtered.length === 0 ? (
          <Card className="px-5 py-16 text-center">
            <p className="text-sm text-ink-400">No receipts match your filters.</p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <ReceiptCard key={r.id} receipt={r} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function ReceiptCard({ receipt }: { receipt: ReceiptEnriched }) {
  const tone = STATUS_TONES[receipt.reviewStatus];
  const vendor = receipt.vendor ?? "Unknown vendor";
  const amount = receipt.amountCents;
  const conf = receipt.ocrConfidence ?? 0;

  return (
    <Link href={`/receipts/${receipt.id}`} className="group block">
      <Card className="h-full px-5 py-4 transition hover:border-white/15 hover:bg-white/[0.03]">
        {/* Top: vendor + amount */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-100 group-hover:text-white">{vendor}</p>
            {receipt.job && <p className="truncate text-xs text-ink-500">{receipt.job.title}</p>}
          </div>
          {amount != null && (
            <p className="shrink-0 text-sm font-bold text-ink-100">{formatCurrency(amount)}</p>
          )}
        </div>

        {/* Status badge */}
        <div className="mt-3 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium"
            style={{ backgroundColor: tone.bg, color: tone.color }}
          >
            {REVIEW_STATUS_LABELS[receipt.reviewStatus]}
          </span>
          {/* Confidence indicator */}
          <span className={`text-[0.7rem] font-medium ${conf >= 0.7 ? "text-sage-400" : "text-clay-400"}`}>
            OCR {receipt.confidenceLabel} ({Math.round(conf * 100)}%)
          </span>
        </div>

        {/* Date + file */}
        <div className="mt-3 flex items-center justify-between text-xs text-ink-500">
          <span>{receipt.incurredDate ? formatDate(receipt.incurredDate) : "No date"}</span>
          {receipt.file && <span className="truncate text-ink-600">{receipt.file.name}</span>}
        </div>

        {/* Low confidence warning */}
        {receipt.hasLowConfidence && (
          <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-clay-500/8 px-2.5 py-1.5 text-[0.7rem] text-clay-300">
            <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 2.5 19.5h19zM12 10v4M12 17h.01" />
            </svg>
            {amount == null ? "Could not read amount" : "Low OCR confidence — verify fields"}
          </div>
        )}
      </Card>
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
