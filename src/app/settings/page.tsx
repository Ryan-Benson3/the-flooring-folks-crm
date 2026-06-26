import type { Metadata } from "next";
import { SettingsPage } from "@/components/settings/settings-page";

export const metadata: Metadata = {
  title: "Business Settings — The Flooring Folks CRM",
  description:
    "Business profile, branding, document defaults, workflows, payment methods, and expense categories for The Flooring Folks CRM.",
};

export default function Page() {
  return <SettingsPage />;
}
