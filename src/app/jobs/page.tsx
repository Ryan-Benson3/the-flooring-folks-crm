import type { Metadata } from "next";
import { JobsPage } from "@/components/jobs/jobs-page";

export const metadata: Metadata = {
  title: "Jobs — The Flooring Folks CRM",
  description:
    "Track all jobs — profitability, expenses, status, schedule, and outstanding balances at a glance.",
};

export default function Page() {
  return <JobsPage />;
}
