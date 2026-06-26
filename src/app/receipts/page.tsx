import type { Metadata } from "next";
import { ReceiptsPage } from "@/components/receipts/receipts-page";

export const metadata: Metadata = {
  title: "Receipts — The Flooring Folks CRM",
  description: "Review OCR-scanned receipts before they become expenses.",
};

export default function Page() {
  return <ReceiptsPage />;
}
