import type { Metadata } from "next";
import { FilesPage } from "@/components/files/files-page";

export const metadata: Metadata = {
  title: "Files & Photos — The Flooring Folks CRM",
  description:
    "Project photos, contracts, receipts, and documents for The Flooring Folks CRM.",
};

export default function Page() {
  return <FilesPage />;
}
