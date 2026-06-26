"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button, Card } from "@/components/dashboard/ui";
import { IconInvoice } from "@/components/dashboard/icons";
import type { EstimateEnriched } from "@/lib/estimate-helpers";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  ESTIMATE_STATUS_LABELS,
} from "@/lib/domain";

const STATUS_TONES: Record<string, { color: string; bg: string }> = {
  draft: { color: "#64748b", bg: "rgba(100,116,139,0.1)" },
  sent: { color: "#2563eb", bg: "rgba(37,99,235,0.1)" },
  accepted: { color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
  declined: { color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
  expired: { color: "#71717a", bg: "rgba(113,113,122,0.1)" },
};

export function EstimateDetailPage({ estimate }: { estimate: EstimateEnriched }) {
  const customerName = estimate.customer
    ? `${estimate.customer.firstName} ${estimate.customer.lastName}`
    : "Unknown customer";
  const tone = STATUS_TONES[estimate.status];

  return (
    <DashboardShell activeNavId="estimates">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/estimates" className="text-ink-500 transition hover:text-ink-300">
            Estimates
          </Link>
          <span className="text-ink-700">/</span>
          <span className="text-ink-200">{estimate.number}</span>
        </div>

        {/* Header card */}
        <Card className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-ink-100">
                  {estimate.number}
                </h1>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium"
                  style={{ backgroundColor: tone.bg, color: tone.color }}
                >
                  {ESTIMATE_STATUS_LABELS[estimate.status]}
                </span>
              </div>
              {estimate.customer && (
                <Link
                  href={`/customers/${estimate.customer.id}`}
                  className="mt-2 inline-block text-sm text-wood-300 transition hover:text-wood-200"
                >
                  {customerName}
                </Link>
              )}
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-400">
                <span>Issued {formatDate(estimate.issueDate)}</span>
                {estimate.expiryDate && (
                  <span>Expires {formatDate(estimate.expiryDate)}</span>
                )}
                {estimate.job && (
                  <Link href={`/jobs/${estimate.job.id}`} className="text-wood-300/80 hover:text-wood-200">
                    {estimate.job.title}
                  </Link>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button href="#" variant="ghost" icon={<IconInvoice />}>
                Convert to invoice
              </Button>
            </div>
          </div>

          {estimate.notes && (
            <div className="mt-5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">Notes</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-300">{estimate.notes}</p>
            </div>
          )}
        </Card>

        {/* Line items */}
        <Card className="overflow-hidden">
          <div className="border-b border-white/[0.06] px-5 py-3.5">
            <h2 className="text-sm font-semibold text-ink-100">Line items</h2>
          </div>
          <div className="hidden grid-cols-[3fr_1fr_1fr_1fr] gap-4 border-b border-white/[0.04] px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-600 sm:grid">
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Unit price</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {estimate.items.map((item) => {
              const amount = item.quantity * item.unitPriceCents;
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-[3fr_1fr_1fr_1fr] sm:items-center sm:gap-4"
                >
                  <p className="text-sm text-ink-200">{item.description}</p>
                  <p className="text-left text-sm text-ink-400 sm:text-right">{item.quantity}</p>
                  <p className="text-left text-sm text-ink-400 sm:text-right">{formatCurrency(item.unitPriceCents)}</p>
                  <p className="text-left text-sm font-semibold text-ink-100 sm:text-right">{formatCurrency(amount)}</p>
                </div>
              );
            })}
          </div>
          {/* Totals */}
          <div className="border-t border-white/[0.06] px-5 py-4">
            <div className="ml-auto max-w-xs space-y-2">
              <TotalRow label="Subtotal" value={formatCurrency(estimate.subtotalCents)} />
              <TotalRow label={`Tax (${formatPercent(estimate.taxRatePct, 0)})`} value={formatCurrency(estimate.taxCents)} />
              <div className="border-t border-white/[0.08] pt-2">
                <TotalRow label="Total" value={formatCurrency(estimate.totalCents)} bold />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}

function TotalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? "font-semibold text-ink-100" : "text-ink-400"}`}>{label}</span>
      <span className={`text-sm ${bold ? "text-lg font-bold text-ink-100" : "font-medium text-ink-200"}`}>{value}</span>
    </div>
  );
}
