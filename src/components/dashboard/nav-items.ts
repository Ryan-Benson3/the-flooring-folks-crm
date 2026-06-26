import type { ComponentType, SVGProps } from "react";
import {
  IconChart,
  IconClipboard,
  IconDollar,
  IconFolder,
  IconGrid,
  IconInvoice,
  IconScan,
  IconShield,
  IconSliders,
  IconUsers,
  IconWrench,
} from "./icons";

export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** optional attention badge count */
  badge?: number;
};

export const primaryNav: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: IconGrid },
  { id: "jobs", label: "Jobs", href: "#", icon: IconWrench, badge: 3 },
  { id: "customers", label: "Customers", href: "/customers", icon: IconUsers },
  { id: "estimates", label: "Estimates", href: "#", icon: IconClipboard, badge: 1 },
  { id: "invoices", label: "Invoices", href: "#", icon: IconInvoice },
  { id: "receipts", label: "Receipts", href: "#", icon: IconScan, badge: 3 },
  { id: "expenses", label: "Expenses", href: "#", icon: IconDollar },
  { id: "files", label: "Files & Photos", href: "#", icon: IconFolder },
];

export const secondaryNav: NavItem[] = [
  { id: "reports", label: "Reports", href: "#", icon: IconChart },
  { id: "roles", label: "Team & Roles", href: "#", icon: IconShield },
  { id: "settings", label: "Settings", href: "/settings", icon: IconSliders },
];

export const ACTIVE_NAV_ID = "dashboard";
