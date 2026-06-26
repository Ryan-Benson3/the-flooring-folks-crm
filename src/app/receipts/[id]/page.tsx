import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReceiptDetailPage } from "@/components/receipts/receipt-detail-page";
import { getEnrichedReceipt } from "@/lib/receipt-helpers";
import { sampleReceiptDrafts } from "@/lib/sample-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const r = sampleReceiptDrafts.find((r) => r.id === id);
  if (!r) return { title: "Receipt not found" };
  return { title: `${r.vendor ?? "Receipt"} — The Flooring Folks CRM` };
}

export function generateStaticParams() {
  return sampleReceiptDrafts.map((r) => ({ id: r.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const receipt = getEnrichedReceipt(id);
  if (!receipt) notFound();
  return <ReceiptDetailPage receipt={receipt} />;
}
