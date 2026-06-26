/**
 * Expense enrichment helpers — join expenses with job and receipt data
 * for display. Includes category totals for summary cards.
 */

import {
  type Expense,
  type Job,
  type ReceiptDraft,
  type ExpenseCategory,
  EXPENSE_CATEGORIES,
} from "@/lib/domain";
import {
  sampleExpenses,
  sampleJobs,
  sampleReceiptDrafts,
} from "@/lib/sample-data";

export interface ExpenseEnriched extends Expense {
  job?: Job;
  receipt?: ReceiptDraft;
}

export function enrichExpense(expense: Expense): ExpenseEnriched {
  return {
    ...expense,
    job: expense.jobId ? sampleJobs.find((j) => j.id === expense.jobId) : undefined,
    receipt: expense.receiptId
      ? sampleReceiptDrafts.find((r) => r.id === expense.receiptId)
      : undefined,
  };
}

export function getEnrichedExpenses(): ExpenseEnriched[] {
  return sampleExpenses.map(enrichExpense);
}

export function getEnrichedExpense(id: string): ExpenseEnriched | null {
  const e = sampleExpenses.find((e) => e.id === id);
  if (!e) return null;
  return enrichExpense(e);
}

/** Search expenses by vendor, job title, or notes. */
export function searchExpenses(
  expenses: ExpenseEnriched[],
  query: string,
): ExpenseEnriched[] {
  if (!query.trim()) return expenses;
  const q = query.toLowerCase();
  return expenses.filter(
    (e) =>
      e.vendor.toLowerCase().includes(q) ||
      e.job?.title.toLowerCase().includes(q) ||
      (e.notes ?? "").toLowerCase().includes(q),
  );
}

/** Category breakdown for the summary strip. */
export function expenseCategoryTotals(expenses: ExpenseEnriched[]) {
  const map = new Map<ExpenseCategory, { count: number; totalCents: number }>();
  for (const cat of EXPENSE_CATEGORIES) {
    map.set(cat, { count: 0, totalCents: 0 });
  }
  for (const e of expenses) {
    const entry = map.get(e.category);
    if (entry) {
      entry.count++;
      entry.totalCents += e.amountCents;
    }
  }
  return Array.from(map.entries())
    .filter(([, v]) => v.count > 0)
    .map(([category, { count, totalCents }]) => ({ category, count, totalCents }))
    .sort((a, b) => b.totalCents - a.totalCents);
}

/** Portfolio totals for header. */
export function expensePortfolioTotals(expenses: ExpenseEnriched[]) {
  const totalAmount = expenses.reduce((s, e) => s + e.amountCents, 0);
  const approved = expenses.filter((e) => e.status === "approved");
  const draft = expenses.filter((e) => e.status === "draft");
  const jobLinked = expenses.filter((e) => e.jobId);
  return {
    totalAmount,
    approvedCount: approved.length,
    approvedAmount: approved.reduce((s, e) => s + e.amountCents, 0),
    draftCount: draft.length,
    draftAmount: draft.reduce((s, e) => s + e.amountCents, 0),
    jobLinkedCount: jobLinked.length,
  };
}
