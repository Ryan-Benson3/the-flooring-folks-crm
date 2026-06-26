import type { Metadata } from "next";
import { InvoicesPage } from "@/components/invoices/invoices-page";

export const metadata: Metadata = {
  title: "Invoices — The Flooring Folks CRM",
  description: "Track invoices — billed, collected, outstanding balances, and overdue alerts.",
};

export default function Page() {
  return <InvoicesPage />;
}
