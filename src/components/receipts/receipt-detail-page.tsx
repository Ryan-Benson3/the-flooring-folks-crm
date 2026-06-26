"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button, Card } from "@/components/dashboard/ui";
import type { ReceiptEnriched } from "@/lib/receipt-helpers";
import {
  formatCurrency,
  formatDate,
  EXPENSE_CATEGORY_LABELS,
  type ReceiptReviewStatus,
} from "@/lib/domain";

const REVIEW_STATUS_LABELS: Record<ReceiptReviewStatus, string> = {
  pending_review: "Pending review",
  reviewed: "Reviewed",
  needs_edits: "Needs edits",
  rejected: "Rejected",
};

const STATUS_TONES: Record<string, { color: string; bg: string }> = {
  pending_review: { color: "#d97706", bg: "rgba(217,119,6,0.1)" },
  reviewed: { color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
  needs_edits: { color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
  rejected: { color: "#71717a", bg: "rgba(113,113,122,0.1)" },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReceiptDetailPage({ receipt }: { receipt: ReceiptEnriched }) {
  const tone = STATUS_TONES[receipt.reviewStatus];
  const conf = receipt.ocrConfidence ?? 0;
  const confColor = conf >= 0.9 ? "#16a34a" : conf >= 0.7 ? "#d97706" : "#dc2626";

  // Extract OCR line items with safe typing
  const ocrLineItems: Array<{ description?: string; qty?: number; price?: number }> =
    Array.isArray(receipt.ocrRaw?.lineItems)
      ? (receipt.ocrRaw!.lineItems as Array<{ description?: string; qty?: number; price?: number }>)
      : [];

  return (
    <DashboardShell activeNavId="receipts">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/receipts" className="text-ink-500 transition hover:text-ink-300">
            Receipts
          </Link>
          <span className="text-ink-700">/</span>
          <span className="text-ink-200">{receipt.vendor ?? "Unknown"}</span>
        </div>

        {/* Header card */}
        <Card className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-ink-100">
                  {receipt.vendor ?? "Unknown vendor"}
                </h1>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium"
                  style={{ backgroundColor: tone.bg, color: tone.color }}
                >
                  {REVIEW_STATUS_LABELS[receipt.reviewStatus]}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-400">
                {receipt.incurredDate && <span>{formatDate(receipt.incurredDate)}</span>}
                {receipt.job && (
                  <Link href={`/jobs/${receipt.job.id}`} className="text-wood-300/80 hover:text-wood-200">
                    {receipt.job.title}
                  </Link>
                )}
                {receipt.expense && (
                  <Link href={`/expenses/${receipt.expense.id}`} className="text-wood-300/80 hover:text-wood-200">
                    Expense →
                  </Link>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {receipt.reviewStatus === "pending_review" || receipt.reviewStatus === "needs_edits" ? (
                <>
                  <Button href="#" variant="ghost">
                    Needs edits
                  </Button>
                  <Button href="#">
                    Approve & create expense
                  </Button>
                </>
              ) : (
                <Button href="#" variant="ghost">
                  Re-open
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* OCR data + receipt image placeholder */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* OCR extracted fields */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="border-b border-white/[0.06] px-5 py-3.5">
                <h2 className="text-sm font-semibold text-ink-100">OCR extracted data</h2>
              </div>
              <div className="grid grid-cols-1 gap-px bg-white/[0.04] sm:grid-cols-2">
                <Field label="Vendor" value={receipt.vendor ?? "—"} missing={!receipt.vendor} />
                <Field
                  label="Amount"
                  value={receipt.amountCents != null ? formatCurrency(receipt.amountCents) : "—"}
                  missing={receipt.amountCents == null}
                />
                <Field
                  label="Date"
                  value={receipt.incurredDate ? formatDate(receipt.incurredDate) : "—"}
                  missing={!receipt.incurredDate}
                />
                <Field
                  label="Category"
                  value={receipt.category ? EXPENSE_CATEGORY_LABELS[receipt.category] : "—"}
                  missing={!receipt.category}
                />
              </div>

              {/* OCR line items from raw data */}
              {ocrLineItems.length > 0 && (
                <div className="border-t border-white/[0.06]">
                  <div className="px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-600">
                    Detected line items
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {ocrLineItems.map((item, i) => (
                      <div key={i} className="grid grid-cols-[3fr_1fr_1fr_1fr] gap-3 px-5 py-2.5 text-sm">
                        <span className="text-ink-200">{item.description ?? "—"}</span>
                        <span className="text-right text-ink-400">{item.qty ?? "—"}</span>
                        <span className="text-right text-ink-400">
                          {item.price != null ? formatCurrency(Number(item.price) * 100) : "—"}
                        </span>
                        <span className="text-right font-medium text-ink-300">
                          {item.qty != null && item.price != null
                            ? formatCurrency(Number(item.qty) * Number(item.price) * 100)
                            : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw OCR note */}
              {receipt.ocrRaw?.note != null && (
                <div className="border-t border-white/[0.06] px-5 py-3">
                  <p className="text-xs text-clay-300">⚠ {String(receipt.ocrRaw.note)}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar: confidence + file info */}
          <div className="space-y-6">
            {/* OCR confidence */}
            <Card className="p-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">
                OCR Confidence
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.round(conf * 100)}%`, backgroundColor: confColor }}
                  />
                </div>
                <span className="text-sm font-bold" style={{ color: confColor }}>
                  {Math.round(conf * 100)}%
                </span>
              </div>
              <p className="mt-1.5 text-xs text-ink-500">{receipt.confidenceLabel} confidence</p>
              {receipt.hasLowConfidence && (
                <p className="mt-2 rounded-lg bg-clay-500/8 px-2.5 py-1.5 text-[0.7rem] text-clay-300">
                  Verify extracted fields before approving
                </p>
              )}
            </Card>

            {/* File info */}
            {receipt.file && (
              <Card className="p-5">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">
                  Source file
                </p>
                <div className="mt-2 space-y-1.5">
                  <p className="truncate text-sm font-medium text-ink-200">{receipt.file.name}</p>
                  <div className="flex items-center justify-between text-xs text-ink-500">
                    <span>{receipt.file.mimeType}</span>
                    <span>{formatBytes(receipt.file.sizeBytes)}</span>
                  </div>
                </div>
                {/* Placeholder for receipt image */}
                <div className="mt-3 flex h-32 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <svg className="h-8 w-8 text-ink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <path d="M8 8h8M8 12h8M8 16h5" />
                  </svg>
                </div>
              </Card>
            )}

            {/* Linked expense */}
            {receipt.expense && (
              <Card className="p-5">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">
                  Linked expense
                </p>
                <Link
                  href={`/expenses/${receipt.expense.id}`}
                  className="mt-2 block rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 transition hover:border-white/15"
                >
                  <p className="text-sm font-medium text-ink-200">{receipt.expense.vendor}</p>
                  <p className="text-xs text-ink-500">
                    {formatCurrency(receipt.expense.amountCents)} · {EXPENSE_CATEGORY_LABELS[receipt.expense.category]}
                  </p>
                </Link>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Field({ label, value, missing }: { label: string; value: string; missing?: boolean }) {
  return (
    <div className="bg-[#0a0c14] px-5 py-3.5">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">{label}</p>
      <p className={`mt-1 text-sm font-medium ${missing ? "text-clay-400" : "text-ink-100"}`}>
        {missing ? "⚠ Not detected" : value}
      </p>
    </div>
  );
}
