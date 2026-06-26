import type { Metadata } from "next";
import { ReportsPage } from "@/components/reports/reports-page";

export const metadata: Metadata = {
  title: "Reports — The Flooring Folks CRM",
  description: "Financial reports: revenue trends, job profitability, expense breakdowns, and A/R aging.",
};

export default function Page() {
  return <ReportsPage />;
}
