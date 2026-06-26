import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExpenseDetailPage } from "@/components/expenses/expense-detail-page";
import { getEnrichedExpense } from "@/lib/expense-helpers";
import { sampleExpenses } from "@/lib/sample-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const e = sampleExpenses.find((e) => e.id === id);
  if (!e) return { title: "Expense not found" };
  return { title: `${e.vendor} — The Flooring Folks CRM` };
}

export function generateStaticParams() {
  return sampleExpenses.map((e) => ({ id: e.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expense = getEnrichedExpense(id);
  if (!expense) notFound();
  return <ExpenseDetailPage expense={expense} />;
}
