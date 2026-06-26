/**
 * Customer enrichment helpers — join customers with related jobs, invoices,
 * and estimates from sample data. When live Supabase reads replace this,
 * these computed fields move to SQL views / server-side joins.
 */

import {
  type Customer,
  type Job,
  type Invoice,
  type Estimate,
  type Payment,
  invoiceTotal,
  invoiceBalance,
} from "@/lib/domain";
import {
  sampleCustomers,
  sampleJobs,
  sampleInvoices,
  sampleEstimates,
  samplePayments,
} from "@/lib/sample-data";

export interface CustomerEnriched extends Customer {
  jobs: Job[];
  invoices: Invoice[];
  estimates: Estimate[];
  totalRevenueCents: number;
  outstandingCents: number;
  jobCount: number;
  lastActivity?: string; // ISO date of most recent job/invoice
}

export function enrichCustomer(
  customer: Customer,
  jobs: Job[],
  invoices: Invoice[],
  estimates: Estimate[],
  payments: Payment[],
): CustomerEnriched {
  const custJobs = jobs.filter((j) => j.customerId === customer.id);
  const custInvoices = invoices.filter((i) => i.customerId === customer.id);
  const custEstimates = estimates.filter((e) => e.customerId === customer.id);

  const totalRevenue = custInvoices
    .filter((i) => i.status === "paid" || i.status === "partial")
    .reduce((sum, i) => sum + invoiceTotal(i), 0);

  const outstanding = custInvoices
    .filter((i) => i.status === "sent" || i.status === "overdue" || i.status === "partial")
    .reduce((sum, i) => sum + invoiceBalance(i, payments), 0);

  // Find most recent activity
  const dates = [
    ...custJobs.map((j) => j.updatedAt),
    ...custInvoices.map((i) => i.issueDate),
    customer.updatedAt,
  ].filter(Boolean);
  const lastActivity = dates.sort().pop();

  return {
    ...customer,
    jobs: custJobs,
    invoices: custInvoices,
    estimates: custEstimates,
    totalRevenueCents: totalRevenue,
    outstandingCents: outstanding,
    jobCount: custJobs.length,
    lastActivity,
  };
}

export function getEnrichedCustomers(): CustomerEnriched[] {
  return sampleCustomers.map((c) =>
    enrichCustomer(c, sampleJobs, sampleInvoices, sampleEstimates, samplePayments),
  );
}

export function getEnrichedCustomer(id: string): CustomerEnriched | null {
  const customer = sampleCustomers.find((c) => c.id === id);
  if (!customer) return null;
  return enrichCustomer(customer, sampleJobs, sampleInvoices, sampleEstimates, samplePayments);
}

/** Search customers by name, email, phone, or address. */
export function searchCustomers(
  customers: CustomerEnriched[],
  query: string,
): CustomerEnriched[] {
  if (!query.trim()) return customers;
  const q = query.toLowerCase();
  return customers.filter(
    (c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q) ||
      c.notes?.toLowerCase().includes(q),
  );
}
