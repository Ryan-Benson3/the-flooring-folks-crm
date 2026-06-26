/**
 * Receipt enrichment helpers — join receipt drafts with linked
 * file, expense, and job data for display.
 */

import {
  type ReceiptDraft,
  type Job,
  type Expense,
  type FileAsset,
} from "@/lib/domain";
import {
  sampleReceiptDrafts,
  sampleJobs,
  sampleExpenses,
  sampleFiles,
} from "@/lib/sample-data";

export interface ReceiptEnriched extends ReceiptDraft {
  job?: Job;
  expense?: Expense;
  file?: FileAsset;
  /** Human-readable OCR confidence label. */
  confidenceLabel: string;
  /** Whether OCR could not read key fields. */
  hasLowConfidence: boolean;
}

export function enrichReceipt(receipt: ReceiptDraft): ReceiptEnriched {
  const conf = receipt.ocrConfidence ?? 0;
  const confidenceLabel =
    conf >= 0.9 ? "High" : conf >= 0.7 ? "Medium" : conf >= 0.5 ? "Low" : "Very low";
  return {
    ...receipt,
    job: receipt.jobId ? sampleJobs.find((j) => j.id === receipt.jobId) : undefined,
    expense: receipt.expenseId
      ? sampleExpenses.find((e) => e.id === receipt.expenseId)
      : undefined,
    file: sampleFiles.find((f) => f.id === receipt.fileId),
    confidenceLabel,
    hasLowConfidence: conf < 0.7,
  };
}

export function getEnrichedReceipts(): ReceiptEnriched[] {
  return sampleReceiptDrafts.map(enrichReceipt);
}

export function getEnrichedReceipt(id: string): ReceiptEnriched | null {
  const r = sampleReceiptDrafts.find((r) => r.id === id);
  if (!r) return null;
  return enrichReceipt(r);
}

/** Search receipts by vendor or job title. */
export function searchReceipts(
  receipts: ReceiptEnriched[],
  query: string,
): ReceiptEnriched[] {
  if (!query.trim()) return receipts;
  const q = query.toLowerCase();
  return receipts.filter(
    (r) =>
      (r.vendor ?? "Unknown vendor").toLowerCase().includes(q) ||
      r.job?.title.toLowerCase().includes(q),
  );
}

/** Queue summary for header. */
export function receiptQueueSummary(receipts: ReceiptEnriched[]) {
  const pending = receipts.filter((r) => r.reviewStatus === "pending_review");
  const needsEdits = receipts.filter((r) => r.reviewStatus === "needs_edits");
  const reviewed = receipts.filter((r) => r.reviewStatus === "reviewed");
  const rejected = receipts.filter((r) => r.reviewStatus === "rejected");
  const totalAmount = receipts.reduce((s, r) => s + (r.amountCents ?? 0), 0);
  return { pending, needsEdits, reviewed, rejected, totalAmount };
}
