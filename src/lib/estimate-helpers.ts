/**
 * Estimate enrichment helpers — join estimates with customer/job info and
 * compute subtotal/tax/total using domain math.
 */

import {
  type Estimate,
  type Customer,
  type Job,
  estimateSubtotal,
  estimateTax,
  estimateTotal,
} from "@/lib/domain";
import {
  sampleEstimates,
  sampleCustomers,
  sampleJobs,
} from "@/lib/sample-data";

export interface EstimateEnriched extends Estimate {
  customer?: Customer;
  job?: Job;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

export function enrichEstimate(
  estimate: Estimate,
  customers: Customer[],
  jobs: Job[],
): EstimateEnriched {
  return {
    ...estimate,
    customer: customers.find((c) => c.id === estimate.customerId),
    job: estimate.jobId ? jobs.find((j) => j.id === estimate.jobId) : undefined,
    subtotalCents: estimateSubtotal(estimate),
    taxCents: estimateTax(estimate),
    totalCents: estimateTotal(estimate),
  };
}

export function getEnrichedEstimates(): EstimateEnriched[] {
  return sampleEstimates.map((e) =>
    enrichEstimate(e, sampleCustomers, sampleJobs),
  );
}

export function getEnrichedEstimate(id: string): EstimateEnriched | null {
  const est = sampleEstimates.find((e) => e.id === id);
  if (!est) return null;
  return enrichEstimate(est, sampleCustomers, sampleJobs);
}

/** Search estimates by number, customer name, or job title. */
export function searchEstimates(
  estimates: EstimateEnriched[],
  query: string,
): EstimateEnriched[] {
  if (!query.trim()) return estimates;
  const q = query.toLowerCase();
  return estimates.filter(
    (e) =>
      e.number.toLowerCase().includes(q) ||
      e.customer &&
        `${e.customer.firstName} ${e.customer.lastName}`.toLowerCase().includes(q) ||
      e.job?.title.toLowerCase().includes(q),
  );
}

/** Portfolio totals for header summary. */
export function estimatePortfolioTotals(estimates: EstimateEnriched[]) {
  const totalValue = estimates.reduce((s, e) => s + e.totalCents, 0);
  const pendingCount = estimates.filter(
    (e) => e.status === "sent" || e.status === "draft",
  ).length;
  const acceptedCount = estimates.filter(
    (e) => e.status === "accepted",
  ).length;
  const acceptedValue = estimates
    .filter((e) => e.status === "accepted")
    .reduce((s, e) => s + e.totalCents, 0);
  return { totalValue, pendingCount, acceptedCount, acceptedValue };
}
