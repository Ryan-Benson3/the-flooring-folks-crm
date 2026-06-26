import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvoiceDetailPage } from "@/components/invoices/invoice-detail-page";
import { getEnrichedInvoice } from "@/lib/invoice-helpers";
import { sampleInvoices } from "@/lib/sample-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const inv = sampleInvoices.find((i) => i.id === id);
  if (!inv) return { title: "Invoice not found" };
  return { title: `${inv.number} — The Flooring Folks CRM` };
}

export function generateStaticParams() {
  return sampleInvoices.map((i) => ({ id: i.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = getEnrichedInvoice(id);
  if (!invoice) notFound();
  return <InvoiceDetailPage invoice={invoice} />;
}
