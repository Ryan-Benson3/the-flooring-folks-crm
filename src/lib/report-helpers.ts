/**
 * Reports helpers — compute analytics from sample data using domain functions.
 * Pure, server-safe, no external deps beyond domain + sample-data.
 */

import {
  type Job,
  type ExpenseCategory,
  invoiceBalance,
  invoicePaid,
  jobProfit,
  jobBilledCents,
} from "@/lib/domain";
import {
  sampleJobs,
  sampleInvoices,
  samplePayments,
  sampleExpenses,
  sampleEstimates,
  sampleCustomers,
} from "@/lib/sample-data";

// ---------------------------------------------------------------------------
// Monthly trend data
// ---------------------------------------------------------------------------

export interface MonthlyTrend {
  month: string; // "2026-05"
  monthLabel: string; // "May"
  revenueCents: number;
  expensesCents: number;
  profitCents: number;
  marginPct: number;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getMonthKey(iso: string): string {
  return iso.substring(0, 7); // "2026-06"
}

function getMonthLabel(monthKey: string): string {
  const [, m] = monthKey.split("-");
  return MONTH_NAMES[parseInt(m, 10) - 1] ?? monthKey;
}

/** Build 6 months of trend data ending at the current month. */
export function getMonthlyTrends(): MonthlyTrend[] {
  const now = new Date("2026-06-26");
  const months: string[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  return months.map((monthKey) => {
    const paymentsThisMonth = samplePayments.filter((p) =>
      getMonthKey(p.paidAt) === monthKey,
    );
    const revenueCents = paymentsThisMonth.reduce((sum, p) => sum + p.amountCents, 0);

    const expensesThisMonth = sampleExpenses.filter(
      (e) => e.status !== "draft" && getMonthKey(e.incurredDate) === monthKey,
    );
    const expensesCents = expensesThisMonth.reduce((sum, e) => sum + e.amountCents, 0);

    const profitCents = revenueCents - expensesCents;
    const marginPct = revenueCents > 0 ? (profitCents / revenueCents) * 100 : 0;

    return {
      month: monthKey,
      monthLabel: getMonthLabel(monthKey),
      revenueCents,
      expensesCents,
      profitCents,
      marginPct,
    };
  });
}

// ---------------------------------------------------------------------------
// Job P&L table
// ---------------------------------------------------------------------------

export interface JobPnlRow {
  job: Job;
  customerName: string;
  revenueCents: number;
  costCents: number;
  profitCents: number;
  marginPct: number;
  billedCents: number;
  status: Job["status"];
}

export function getJobPnlTable(): JobPnlRow[] {
  const customerMap = new Map(sampleCustomers.map((c) => [c.id, `${c.firstName} ${c.lastName}`]));

  return sampleJobs
    .map((job) => {
      const profit = jobProfit(job, sampleInvoices, sampleExpenses);
      const billed = jobBilledCents(job, sampleInvoices);
      const customerName = customerMap.get(job.customerId) ?? "Unknown";
      return {
        job,
        customerName,
        revenueCents: profit.revenueCents,
        costCents: profit.costCents,
        profitCents: profit.profitCents,
        marginPct: profit.marginPct,
        billedCents: billed,
        status: job.status,
      };
    })
    .sort((a, b) => b.revenueCents - a.revenueCents);
}

// ---------------------------------------------------------------------------
// Expense category breakdown (all-time, non-draft)
// ---------------------------------------------------------------------------

export interface CategoryBreakdown {
  category: ExpenseCategory;
  label: string;
  totalCents: number;
  pctOfTotal: number;
  count: number;
}

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  materials: "Materials",
  labor: "Labor",
  subcontractor: "Subcontractor",
  equipment: "Equipment",
  fuel: "Fuel",
  supplies: "Supplies",
  software: "Software",
  other: "Other",
};

export function getCategoryBreakdown(): CategoryBreakdown[] {
  const approved = sampleExpenses.filter((e) => e.status !== "draft");
  const total = approved.reduce((sum, e) => sum + e.amountCents, 0);

  const byCategory = new Map<ExpenseCategory, { totalCents: number; count: number }>();
  for (const e of approved) {
    const entry = byCategory.get(e.category) ?? { totalCents: 0, count: 0 };
    entry.totalCents += e.amountCents;
    entry.count += 1;
    byCategory.set(e.category, entry);
  }

  return Array.from(byCategory.entries())
    .map(([category, { totalCents, count }]) => ({
      category,
      label: CATEGORY_LABELS[category],
      totalCents,
      pctOfTotal: total > 0 ? (totalCents / total) * 100 : 0,
      count,
    }))
    .sort((a, b) => b.totalCents - a.totalCents);
}

// ---------------------------------------------------------------------------
// A/R Aging
// ---------------------------------------------------------------------------

export interface ArAgingBucket {
  label: string;
  count: number;
  totalCents: number;
  sublabel: string;
}

export function getArAging(): {
  buckets: ArAgingBucket[];
  totalOutstanding: number;
  totalOverdue: number;
} {
  const asOf = new Date("2026-06-26");
  const live = sampleInvoices.filter((i) => i.status !== "draft" && i.status !== "void");

  let current = 0, currentCount = 0;
  let d1to30 = 0, d1to30Count = 0;
  let d31to60 = 0, d31to60Count = 0;
  let d60plus = 0, d60plusCount = 0;

  const DAY = 24 * 60 * 60 * 1000;

  for (const inv of live) {
    const balance = invoiceBalance(inv, samplePayments);
    if (balance <= 0) continue;

    const dueDate = new Date(inv.dueDate);
    const daysPast = Math.floor((asOf.getTime() - dueDate.getTime()) / DAY);

    if (daysPast <= 0) {
      current += balance;
      currentCount++;
    } else if (daysPast <= 30) {
      d1to30 += balance;
      d1to30Count++;
    } else if (daysPast <= 60) {
      d31to60 += balance;
      d31to60Count++;
    } else {
      d60plus += balance;
      d60plusCount++;
    }
  }

  const totalOutstanding = current + d1to30 + d31to60 + d60plus;
  const totalOverdue = d1to30 + d31to60 + d60plus;

  return {
    buckets: [
      { label: "Current", sublabel: "Not yet due", count: currentCount, totalCents: current },
      { label: "1–30 days", sublabel: "Slightly overdue", count: d1to30Count, totalCents: d1to30 },
      { label: "31–60 days", sublabel: "Past due", count: d31to60Count, totalCents: d31to60 },
      { label: "60+ days", sublabel: "Critically overdue", count: d60plusCount, totalCents: d60plus },
    ],
    totalOutstanding,
    totalOverdue,
  };
}

// ---------------------------------------------------------------------------
// Revenue by customer
// ---------------------------------------------------------------------------

export interface CustomerRevenue {
  customerName: string;
  jobId: string;
  jobTitle: string;
  paidCents: number;
  outstandingCents: number;
  totalValue: number;
}

export function getRevenueByCustomer(): CustomerRevenue[] {
  const customerMap = new Map(sampleCustomers.map((c) => [c.id, `${c.firstName} ${c.lastName}`]));

  return sampleJobs
    .map((job) => {
      const jobInvoices = sampleInvoices.filter((i) => i.jobId === job.id);
      const paid = jobInvoices.reduce(
        (sum, inv) => sum + invoicePaid(inv, samplePayments),
        0,
      );
      const outstanding = jobInvoices.reduce(
        (sum, inv) => sum + Math.max(0, invoiceBalance(inv, samplePayments)),
        0,
      );
      return {
        customerName: customerMap.get(job.customerId) ?? "Unknown",
        jobId: job.id,
        jobTitle: job.title,
        paidCents: paid,
        outstandingCents: outstanding,
        totalValue: paid + outstanding,
      };
    })
    .filter((r) => r.totalValue > 0)
    .sort((a, b) => b.totalValue - a.totalValue);
}

// ---------------------------------------------------------------------------
// Portfolio totals
// ---------------------------------------------------------------------------

export function getPortfolioTotals() {
  const trends = getMonthlyTrends();
  const currentMonth = trends[trends.length - 1];

  const totalRevenue = samplePayments.reduce((sum, p) => sum + p.amountCents, 0);
  const totalExpenses = sampleExpenses
    .filter((e) => e.status !== "draft")
    .reduce((sum, e) => sum + e.amountCents, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const ytdRevenue = currentMonth.revenueCents;
  const ytdExpenses = trends.reduce((sum, t) => sum + t.expensesCents, 0);

  return {
    totalRevenue,
    totalExpenses,
    totalProfit,
    overallMargin,
    ytdRevenue,
    ytdExpenses,
    currentMonthRevenue: currentMonth.revenueCents,
    currentMonthExpenses: currentMonth.expensesCents,
    currentMonthProfit: currentMonth.profitCents,
    currentMonthMargin: currentMonth.marginPct,
    activeJobs: sampleJobs.filter((j) => j.status === "in_progress" || j.status === "scheduled").length,
    completedJobs: sampleJobs.filter((j) => j.status === "completed").length,
    totalJobs: sampleJobs.length,
    avgJobValue: totalRevenue / Math.max(1, sampleJobs.filter((j) => j.status === "completed").length),
  };
}

// ---------------------------------------------------------------------------
// Estimate win-rate
// ---------------------------------------------------------------------------

export function getEstimateFunnel() {
  const total = sampleEstimates.length;
  const accepted = sampleEstimates.filter((e) => e.status === "accepted").length;
  const sent = sampleEstimates.filter((e) => e.status === "sent").length;
  const draft = sampleEstimates.filter((e) => e.status === "draft").length;
  const declined = sampleEstimates.filter((e) => e.status === "declined").length;
  const winRate = total > 0 ? (accepted / Math.max(1, total - draft - sent)) * 100 : 0;

  const totalValue = sampleEstimates.reduce(
    (sum, e) => sum + e.items.reduce((s, i) => s + i.quantity * i.unitPriceCents, 0),
    0,
  );

  return { total, accepted, sent, draft, declined, winRate, totalValue };
}
