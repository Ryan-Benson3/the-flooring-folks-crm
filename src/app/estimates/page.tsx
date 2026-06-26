import type { Metadata } from "next";
import { EstimatesPage } from "@/components/estimates/estimates-page";

export const metadata: Metadata = {
  title: "Estimates — The Flooring Folks CRM",
  description: "Track estimates — value, status, win rate, and pending approvals.",
};

export default function Page() {
  return <EstimatesPage />;
}
