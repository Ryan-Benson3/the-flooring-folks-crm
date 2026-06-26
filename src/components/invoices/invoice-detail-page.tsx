"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button, Card } from "@/components/dashboard/ui";
import type { InvoiceEnriched } from "@/lib/invoice-helpers";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  INVOICE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/domain";

const STATUS_TONES: Record<string, { color: string; bg: string }> = {
  draft: { color: "#64748b", bg: "rgba(100,116,139,0.1)" },
  sent: { color: "#2563eb", bg: "rgba(37,99,235,0.1)" },
  paid: { color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
  partial: { color: "#d97706", bg: "rgba(217,119,6,0.1)" },
  overdue: { color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
  void: { color: "#71717a", bg: "rgba(113,113,122,0.1)" },
};

export function InvoiceDetailPage({ invoice }: { invoice: InvoiceEnriched }) {
  const customerName = invoice.customer
    ? `${invoice.customer.firstName} ${invoice.customer.lastName}`
    : "Unknown customer";
  const tone = STATUS_TONES[invoice.derivedStatus];
  const paidPct = invoice.totalCents > 0 ? (invoice.paidCents / invoice.totalCents) * 100 : 0;

  return (
    <DashboardShell activeNavId="invoices">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/invoices" className="text-ink-500 transition hover:text-ink-300">
            Invoices
          </Link>
          <span className="text-ink-700">/</span>
          <span className="text-ink-200">{invoice.number}</span>
        </div>

        {/* Header card */}
        <Card className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-ink-100">
                  {invoice.number}
                </h1>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium"
                  style={{ backgroundColor: tone.bg, color: tone.color }}
                >
                  {INVOICE_STATUS_LABELS[invoice.derivedStatus]}
                </span>
              </div>
              {invoice.customer && (
                <Link
                  href={`/customers/${invoice.customer.id}`}
                  className="mt-2 inline-block text-sm text-wood-300 transition hover:text-wood-200"
                >
                  {customerName}
                </Link>
              )}
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-400">
                <span>Issued {formatDate(invoice.issueDate)}</span>
                <span className={invoice.daysUntilDue < 0 ? "font-medium text-clay-300" : ""}>
                  Due {formatDate(invoice.dueDate)}
                  {invoice.daysUntilDue < 0 && ` (${Math.abs(invoice.daysUntilDue)}d overdue)`}
                </span>
                {invoice.job && (
                  <Link href={`/jobs/${invoice.job.id}`} className="text-wood-300/80 hover:text-wood-200">
                    {invoice.job.title}
                  </Link>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button href="#" variant="ghost">
                Record payment
              </Button>
              <Button href="#">
                Export PDF
              </Button>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">Notes</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-300">{invoice.notes}</p>
            </div>
          )}
        </Card>

        {/* Payment progress bar */}
        {invoice.totalCents > 0 && (
          <Card className="px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-400">Payment progress</span>
              <span className="font-semibold text-ink-100">{formatPercent(paidPct, 0)}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className={`h-full rounded-full transition-all ${
                  paidPct >= 100 ? "bg-sage-500" : paidPct > 0 ? "bg-wood-500" : "bg-transparent"
                }`}
                style={{ width: `${Math.min(paidPct, 100)}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-sage-300">{formatCurrency(invoice.paidCents)} paid</span>
              {invoice.balanceCents > 0 && (
                <span className="text-clay-300">{formatCurrency(invoice.balanceCents)} remaining</span>
              )}
            </div>
          </Card>
        )}

        {/* Two column: line items + payments */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Line items */}
          <div className="lg:col-span-2">
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
                {invoice.items.map((item) => {
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
                  <TotalRow label="Subtotal" value={formatCurrency(invoice.subtotalCents)} />
                  <TotalRow label={`Tax (${formatPercent(invoice.taxRatePct, 0)})`} value={formatCurrency(invoice.taxCents)} />
                  <div className="border-t border-white/[0.08] pt-2">
                    <TotalRow label="Total" value={formatCurrency(invoice.totalCents)} bold />
                  </div>
                  {invoice.paidCents > 0 && (
                    <>
                      <TotalRow label="Paid" value={`−${formatCurrency(invoice.paidCents)}`} tone="sage" />
                      <div className="border-t border-white/[0.08] pt-2">
                        <TotalRow
                          label="Balance due"
                          value={formatCurrency(invoice.balanceCents)}
                          bold
                          tone={invoice.balanceCents > 0 ? "clay" : "sage"}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Payments sidebar */}
          <div className="space-y-6">
            {invoice.payments.length > 0 && (
              <Card className="overflow-hidden">
                <div className="border-b border-white/[0.06] px-5 py-3.5">
                  <h2 className="text-sm font-semibold text-ink-100">
                    Payments ({invoice.payments.length})
                  </h2>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {invoice.payments.map((pmt) => (
                    <div key={pmt.id} className="px-5 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-sage-300">
                          {formatCurrency(pmt.amountCents)}
                        </span>
                        <span className="text-xs text-ink-500">
                          {PAYMENT_METHOD_LABELS[pmt.method]}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {formatDate(pmt.paidAt)}
                        {pmt.reference && ` · ${pmt.reference}`}
                      </p>
                      {pmt.notes && (
                        <p className="mt-1 text-xs text-ink-400">{pmt.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Summary KPIs */}
            <Card className="p-5">
              <div className="space-y-3">
                <SummaryRow label="Invoice total" value={formatCurrency(invoice.totalCents)} />
                <SummaryRow label="Collected" value={formatCurrency(invoice.paidCents)} tone="sage" />
                <div className="border-t border-white/[0.06] pt-3">
                  <SummaryRow
                    label="Balance due"
                    value={formatCurrency(invoice.balanceCents)}
                    tone={invoice.balanceCents > 0 ? "clay" : "sage"}
                    bold
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

function TotalRow({ label, value, bold, tone }: { label: string; value: string; bold?: boolean; tone?: "sage" | "clay" }) {
  const toneClass = tone === "sage" ? "text-sage-300" : tone === "clay" ? "text-clay-300" : "";
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? "font-semibold text-ink-100" : "text-ink-400"}`}>{label}</span>
      <span className={`text-sm ${bold ? "text-lg font-bold" : "font-medium"} ${toneClass || (bold ? "text-ink-100" : "text-ink-200")}`}>
        {value}
      </span>
    </div>
  );
}

function SummaryRow({ label, value, tone, bold }: { label: string; value: string; tone?: "sage" | "clay"; bold?: boolean }) {
  const toneClass = tone === "sage" ? "text-sage-300" : tone === "clay" ? "text-clay-300" : bold ? "text-ink-100" : "text-ink-200";
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? "font-semibold text-ink-100" : "text-ink-400"}`}>{label}</span>
      <span className={`text-sm ${bold ? "font-bold" : "font-medium"} ${toneClass}`}>{value}</span>
    </div>
  );
}
