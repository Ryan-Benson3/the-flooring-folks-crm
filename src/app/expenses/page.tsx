import type { Metadata } from "next";
import { ExpensesPage } from "@/components/expenses/expenses-page";

export const metadata: Metadata = {
  title: "Expenses — The Flooring Folks CRM",
  description: "Track expenses by vendor, category, and job linkage.",
};

export default function Page() {
  return <ExpensesPage />;
}
