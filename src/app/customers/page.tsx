import type { Metadata } from "next";
import { CustomersPage } from "@/components/customers/customers-page";

export const metadata: Metadata = {
  title: "Customers — The Flooring Folks CRM",
  description:
    "Browse and search your customer roster — contact info, lifetime revenue, outstanding balances, and job history.",
};

export default function Page() {
  return <CustomersPage />;
}
