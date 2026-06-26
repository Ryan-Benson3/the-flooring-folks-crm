/**
 * Invoice enrichment helpers — join invoices with customer/job info and
 * compute totals, payments, balances, and aging using domain math.
 */

import {
  type Invoice,
  type Customer,
  type Job,
  type Payment,
  type InvoiceStatus,
  invoiceSubtotal,
  invoiceTax,
  invoiceTotal,
  invoicePaid,
  invoiceBalance,
  deriveInvoiceStatus,
  daysBetween,
} from "@/lib/domain";
import {
  sampleInvoices,
  sampleCustomers,
  sampleJobs,
  samplePayments,
} from "@/lib/sample-data";

export interface InvoiceEnriched extends Invoice {
  customer?: Customer;
  job?: Job;
  payments: Payment[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  paidCents: number;
  balanceCents: number;
  derivedStatus: InvoiceStatus;
  /** Days until due (negative = overdue). */
  daysUntilDue: number;
}

export function enrichInvoice(
  invoice: Invoice,
  customers: Customer[],
  jobs: Job[],
  payments: Payment[],
): InvoiceEnriched {
  const invPayments = payments.filter((p) => p.invoiceId === invoice.id);
  const now = new Date("2026-06-26T12:00:00.000Z"); // demo "today"
  return {
    ...invoice,
    customer: customers.find((c) => c.id === invoice.customerId),
    job: invoice.jobId ? jobs.find((j) => j.id === invoice.jobId) : undefined,
    payments: invPayments,
    subtotalCents: invoiceSubtotal(invoice),
    taxCents: invoiceTax(invoice),
    totalCents: invoiceTotal(invoice),
    paidCents: invoicePaid(invoice, payments),
    balanceCents: invoiceBalance(invoice, payments),
    derivedStatus: deriveInvoiceStatus(invoice, payments, now),
    daysUntilDue: daysBetween(now, invoice.dueDate),
  };
}

export function getEnrichedInvoices(): InvoiceEnriched[] {
  return sampleInvoices.map((i) =>
    enrichInvoice(i, sampleCustomers, sampleJobs, samplePayments),
  );
}

export function getEnrichedInvoice(id: string): InvoiceEnriched | null {
  const inv = sampleInvoices.find((i) => i.id === id);
  if (!inv) return null;
  return enrichInvoice(inv, sampleCustomers, sampleJobs, samplePayments);
}

/** Search invoices by number, customer name, or job title. */
export function searchInvoices(
  invoices: InvoiceEnriched[],
  query: string,
): InvoiceEnriched[] {
  if (!query.trim()) return invoices;
  const q = query.toLowerCase();
  return invoices.filter(
    (i) =>
      i.number.toLowerCase().includes(q) ||
      i.customer &&
        `${i.customer.firstName} ${i.customer.lastName}`.toLowerCase().includes(q) ||
      i.job?.title.toLowerCase().includes(q),
  );
}

/** Portfolio totals for header summary. */
export function invoicePortfolioTotals(invoices: InvoiceEnriched[]) {
  const totalBilled = invoices.reduce((s, i) => s + i.totalCents, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.paidCents, 0);
  const totalOutstanding = invoices.reduce((s, i) => s + i.balanceCents, 0);
  const overdueCount = invoices.filter((i) => i.derivedStatus === "overdue").length;
  const overdueAmount = invoices
    .filter((i) => i.derivedStatus === "overdue")
    .reduce((s, i) => s + i.balanceCents, 0);
  return {
    totalBilled,
    totalCollected,
    totalOutstanding,
    overdueCount,
    overdueAmount,
  };
}
