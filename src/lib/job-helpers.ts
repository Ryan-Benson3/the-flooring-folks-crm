/**
 * Job enrichment helpers — join jobs with customer info, expenses, invoices,
 * and compute profitability. When live Supabase reads replace this, the
 * computed fields move to SQL views or server-side computation.
 */

import {
  type Job,
  type Customer,
  type Invoice,
  type Expense,
  type Estimate,
  type Payment,
  type ExpenseCategory,
  type JobProfit,
  jobProfit,
  jobCostByCategory,
  invoiceBalance,
} from "@/lib/domain";
import {
  sampleJobs,
  sampleCustomers,
  sampleInvoices,
  sampleExpenses,
  sampleEstimates,
  samplePayments,
} from "@/lib/sample-data";

export interface JobEnriched extends Job {
  customer?: Customer;
  expenses: Expense[];
  invoices: Invoice[];
  estimates: Estimate[];
  profit: JobProfit;
  costByCategory: Record<ExpenseCategory, number>;
  outstandingCents: number;
}

export function enrichJob(
  job: Job,
  customers: Customer[],
  invoices: Invoice[],
  expenses: Expense[],
  estimates: Estimate[],
  payments: Payment[],
): JobEnriched {
  const customer = customers.find((c) => c.id === job.customerId);
  const jobExpenses = expenses.filter((e) => e.jobId === job.id);
  const jobInvoices = invoices.filter((i) => i.jobId === job.id);
  const jobEstimates = estimates.filter((e) => e.jobId === job.id);

  const profit = jobProfit(job, invoices, expenses);
  const costByCategory = jobCostByCategory(job, expenses);
  const outstanding = jobInvoices
    .filter((i) => i.status === "sent" || i.status === "overdue" || i.status === "partial")
    .reduce((sum, i) => sum + Math.max(0, invoiceBalance(i, payments)), 0);

  return {
    ...job,
    customer,
    expenses: jobExpenses,
    invoices: jobInvoices,
    estimates: jobEstimates,
    profit,
    costByCategory,
    outstandingCents: outstanding,
  };
}

export function getEnrichedJobs(): JobEnriched[] {
  return sampleJobs.map((j) =>
    enrichJob(j, sampleCustomers, sampleInvoices, sampleExpenses, sampleEstimates, samplePayments),
  );
}

export function getEnrichedJob(id: string): JobEnriched | null {
  const job = sampleJobs.find((j) => j.id === id);
  if (!job) return null;
  return enrichJob(job, sampleCustomers, sampleInvoices, sampleExpenses, sampleEstimates, samplePayments);
}

/** Search jobs by title, customer name, address, or notes. */
export function searchJobs(jobs: JobEnriched[], query: string): JobEnriched[] {
  if (!query.trim()) return jobs;
  const q = query.toLowerCase();
  return jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(q) ||
      j.customer &&
        `${j.customer.firstName} ${j.customer.lastName}`.toLowerCase().includes(q) ||
      j.address?.toLowerCase().includes(q) ||
      j.notes?.toLowerCase().includes(q),
  );
}

/** Calculate portfolio totals for header summary. */
export function jobPortfolioTotals(jobs: JobEnriched[]) {
  const totalRevenue = jobs.reduce((s, j) => s + j.profit.revenueCents, 0);
  const totalCost = jobs.reduce((s, j) => s + j.profit.costCents, 0);
  const totalProfit = jobs.reduce((s, j) => s + j.profit.profitCents, 0);
  const totalOutstanding = jobs.reduce((s, j) => s + j.outstandingCents, 0);
  const avgMargin =
    totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const activeCount = jobs.filter(
    (j) => j.status === "in_progress" || j.status === "scheduled",
  ).length;

  return { totalRevenue, totalCost, totalProfit, totalOutstanding, avgMargin, activeCount };
}
