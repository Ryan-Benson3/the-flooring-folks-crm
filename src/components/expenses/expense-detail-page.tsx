"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button, Card } from "@/components/dashboard/ui";
import type { ExpenseEnriched } from "@/lib/expense-helpers";
import {
  formatCurrency,
  formatDate,
  EXPENSE_CATEGORY_LABELS,
  type ExpenseStatus,
} from "@/lib/domain";

const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  draft: "Draft",
  reviewed: "Reviewed",
  approved: "Approved",
};

const STATUS_TONES: Record<string, { color: string; bg: string }> = {
  draft: { color: "#d97706", bg: "rgba(217,119,6,0.1)" },
  reviewed: { color: "#2563eb", bg: "rgba(37,99,235,0.1)" },
  approved: { color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
};

export function ExpenseDetailPage({ expense }: { expense: ExpenseEnriched }) {
  const tone = STATUS_TONES[expense.status];

  return (
    <DashboardShell activeNavId="expenses">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/expenses" className="text-ink-500 transition hover:text-ink-300">
            Expenses
          </Link>
          <span className="text-ink-700">/</span>
          <span className="text-ink-200">{expense.vendor}</span>
        </div>

        {/* Header card */}
        <Card className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-ink-100">
                  {expense.vendor}
                </h1>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium"
                  style={{ backgroundColor: tone.bg, color: tone.color }}
                >
                  {EXPENSE_STATUS_LABELS[expense.status]}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">Amount</p>
                  <p className="mt-0.5 text-xl font-bold text-ink-100">{formatCurrency(expense.amountCents)}</p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">Category</p>
                  <p className="mt-0.5 text-sm font-medium text-ink-200">{EXPENSE_CATEGORY_LABELS[expense.category]}</p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">Incurred</p>
                  <p className="mt-0.5 text-sm font-medium text-ink-200">{formatDate(expense.incurredDate)}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {expense.status === "draft" && (
                <Button href="#">
                  Approve
                </Button>
              )}
              <Button href="#" variant="ghost">
                Edit
              </Button>
            </div>
          </div>

          {expense.notes && (
            <div className="mt-5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">Notes</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-300">{expense.notes}</p>
            </div>
          )}
        </Card>

        {/* Linked entities */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Job link */}
          {expense.job && (
            <Card className="p-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">
                Linked job
              </p>
              <Link
                href={`/jobs/${expense.job.id}`}
                className="mt-2 block rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 transition hover:border-white/15"
              >
                <p className="text-sm font-medium text-ink-200">{expense.job.title}</p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {expense.job.address ?? "No address on file"}
                </p>
              </Link>
            </Card>
          )}

          {/* Receipt link */}
          {expense.receipt ? (
            <Card className="p-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">
                Source receipt
              </p>
              <Link
                href={`/receipts/${expense.receipt.id}`}
                className="mt-2 block rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 transition hover:border-white/15"
              >
                <p className="text-sm font-medium text-ink-200">
                  {expense.receipt.vendor ?? "Unknown vendor"}
                </p>
                <p className="mt-0.5 text-xs text-ink-500">
                  OCR {Math.round((expense.receipt.ocrConfidence ?? 0) * 100)}% ·{" "}
                  {formatDate(expense.receipt.incurredDate ?? expense.receipt.createdAt)}
                </p>
              </Link>
            </Card>
          ) : (
            <Card className="p-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">
                Receipt
              </p>
              <div className="mt-2 rounded-lg border border-dashed border-white/[0.08] px-3 py-2.5 text-center">
                <p className="text-sm text-ink-500">No receipt linked</p>
                <button className="mt-1 text-xs text-wood-300 hover:text-wood-200">
                  + Attach receipt
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* Metadata */}
        <Card className="px-5 py-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-500">
            <span>Created {formatDate(expense.createdAt)}</span>
            <span>ID: {expense.id}</span>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
