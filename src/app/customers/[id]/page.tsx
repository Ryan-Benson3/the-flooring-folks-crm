import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomerDetailPage } from "@/components/customers/customer-detail-page";
import { getEnrichedCustomer } from "@/lib/customer-helpers";
import { sampleCustomers } from "@/lib/sample-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const customer = sampleCustomers.find((c) => c.id === id);
  if (!customer) return { title: "Customer not found" };
  const name = `${customer.firstName} ${customer.lastName}`;
  return {
    title: `${name} — The Flooring Folks CRM`,
    description: `Customer profile, jobs, and invoices for ${name}.`,
  };
}

export function generateStaticParams() {
  return sampleCustomers.map((c) => ({ id: c.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = getEnrichedCustomer(id);
  if (!customer) notFound();
  return <CustomerDetailPage customer={customer} />;
}
