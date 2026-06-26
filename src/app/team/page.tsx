import type { Metadata } from "next";
import { TeamPage } from "@/components/team/team-page";

export const metadata: Metadata = {
  title: "Team & Roles — The Flooring Folks CRM",
  description:
    "Manage team members, roles, permissions, and external access for The Flooring Folks CRM.",
};

export default function Page() {
  return <TeamPage />;
}
