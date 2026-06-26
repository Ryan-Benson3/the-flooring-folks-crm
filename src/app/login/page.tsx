import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/login-page";

export const metadata: Metadata = {
  title: "Sign In — The Flooring Folks CRM",
};

export default function Page() {
  return <LoginPage />;
}
