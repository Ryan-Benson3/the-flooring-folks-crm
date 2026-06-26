/**
 * Local fallback sample data for the Phase 1 visual foundation.
 *
 * Pike will replace this with `src/lib/sample-data.ts` + a real data layer later.
 * Every tenant-owned model below carries `organizationId` per the product rules,
 * so the swap-in shape already matches the intended schema.
 */

export const organization = {
  id: "org_tff_0001",
  name: "The Flooring Folks",
  tagline: "Hardwood · Laminate · Tile · LVP",
} as const;

export const currentUser = {
  id: "usr_ryan",
  organizationId: organization.id,
  name: "Ryan Benson",
  role: "Owner",
  initials: "RB",
};

export type Trend = "up" | "down" | "flat";

export type Kpi = {
  id: string;
  organizationId: string;
  label: string;
  value: number;
  /** change vs previous period, in percentage points */
  deltaPct: number;
  trend: Trend;
  sublabel: string;
  tone: "wood" | "sage" | "clay" | "neutral";
  /** normalized 0..1-ish spark points */
  spark: number[];
};

export const kpis: Kpi[] = [
  {
    id: "revenue",
    organizationId: organization.id,
    label: "Revenue (MTD)",
    value: 84250,
    deltaPct: 12.4,
    trend: "up",
    sublabel: "vs. $74,900 last month",
    tone: "sage",
    spark: [10, 14, 12, 18, 16, 22, 20, 26, 24, 30, 28, 34],
  },
  {
    id: "expenses",
    organizationId: organization.id,
    label: "Expenses (MTD)",
    value: 51480,
    deltaPct: 6.1,
    trend: "up",
    sublabel: "Materials + subcontractors",
    tone: "neutral",
    spark: [12, 11, 14, 13, 16, 15, 18, 17, 19, 18, 21, 20],
  },
  {
    id: "profit",
    organizationId: organization.id,
    label: "Net Profit (MTD)",
    value: 32770,
    deltaPct: 18.9,
    trend: "up",
    sublabel: "38.9% margin",
    tone: "wood",
    spark: [4, 6, 5, 8, 7, 10, 9, 12, 11, 15, 14, 19],
  },
  {
    id: "receivables",
    organizationId: organization.id,
    label: "Outstanding A/R",
    value: 23140,
    deltaPct: 4.3,
    trend: "down",
    sublabel: "8 invoices open",
    tone: "clay",
    spark: [22, 21, 23, 20, 19, 21, 18, 17, 18, 16, 17, 15],
  },
];

export type JobStatus =
  | "Scheduled"
  | "In progress"
  | "On hold"
  | "Completed";

export type Job = {
  id: string;
  organizationId: string;
  code: string;
  customer: string;
  type: string;
  address: string;
  status: JobStatus;
  revenue: number;
  cost: number;
  marginPct: number;
  /** hours ago of last update */
  updatedHoursAgo: number;
};

export const jobs: Job[] = [
  {
    id: "job_001",
    organizationId: organization.id,
    code: "FF-2041",
    customer: "Henderson Residence",
    type: "White oak · 1,180 sqft",
    address: "14 Maple Crest Ln, Brentwood",
    status: "In progress",
    revenue: 18600,
    cost: 10400,
    marginPct: 44.1,
    updatedHoursAgo: 2,
  },
  {
    id: "job_002",
    organizationId: organization.id,
    code: "FF-2039",
    customer: "Okafor Duplex",
    type: "LVP · 2 units",
    address: "88 Sycamore St, Antioch",
    status: "Scheduled",
    revenue: 9750,
    cost: 6100,
    marginPct: 37.4,
    updatedHoursAgo: 9,
  },
  {
    id: "job_003",
    organizationId: organization.id,
    code: "FF-2036",
    customer: "Whitfield Kitchen",
    type: "Tile backsplash + floor",
    address: "212 Laurel Ave, Franklin",
    status: "In progress",
    revenue: 6400,
    cost: 5180,
    marginPct: 19.1,
    updatedHoursAgo: 27,
  },
  {
    id: "job_004",
    organizationId: organization.id,
    code: "FF-2031",
    customer: "Delgado Living Rm",
    type: "Sanding + refinish",
    address: "5 Birch Hollow Ct, Nolensville",
    status: "On hold",
    revenue: 4200,
    cost: 3950,
    marginPct: 6.0,
    updatedHoursAgo: 52,
  },
  {
    id: "job_005",
    organizationId: organization.id,
    code: "FF-2028",
    customer: "Caldera Townhome",
    type: "Laminate · full home",
    address: "47 Cedar Run, Spring Hill",
    status: "Completed",
    revenue: 11200,
    cost: 6840,
    marginPct: 38.9,
    updatedHoursAgo: 74,
  },
];

export type EstimateStatus = "Sent" | "Viewed" | "Accepted" | "Follow-up";

export type Estimate = {
  id: string;
  organizationId: string;
  number: string;
  customer: string;
  amount: number;
  status: EstimateStatus;
  daysOut: number;
};

export const estimates: Estimate[] = [
  {
    id: "est_01",
    organizationId: organization.id,
    number: "EST-318",
    customer: "Pruitt Addition",
    amount: 14750,
    status: "Follow-up",
    daysOut: 6,
  },
  {
    id: "est_02",
    organizationId: organization.id,
    number: "EST-317",
    customer: "Nguyen Hallway",
    amount: 3200,
    status: "Viewed",
    daysOut: 3,
  },
  {
    id: "est_03",
    organizationId: organization.id,
    number: "EST-316",
    customer: "Brennan Loft",
    amount: 9900,
    status: "Sent",
    daysOut: 1,
  },
  {
    id: "est_04",
    organizationId: organization.id,
    number: "EST-315",
    customer: "Salazar Entry",
    amount: 2150,
    status: "Accepted",
    daysOut: 9,
  },
];

export type InvoiceStatus = "Unpaid" | "Overdue" | "Partial";

export type Invoice = {
  id: string;
  organizationId: string;
  number: string;
  customer: string;
  amount: number;
  balance: number;
  status: InvoiceStatus;
  dueInDays: number;
};

export const invoices: Invoice[] = [
  {
    id: "inv_01",
    organizationId: organization.id,
    number: "INV-1124",
    customer: "Henderson Residence",
    amount: 9300,
    balance: 9300,
    status: "Overdue",
    dueInDays: -4,
  },
  {
    id: "inv_02",
    organizationId: organization.id,
    number: "INV-1121",
    customer: "Caldera Townhome",
    amount: 5600,
    balance: 2800,
    status: "Partial",
    dueInDays: 3,
  },
  {
    id: "inv_03",
    organizationId: organization.id,
    number: "INV-1118",
    customer: "Whitfield Kitchen",
    amount: 6400,
    balance: 6400,
    status: "Unpaid",
    dueInDays: 11,
  },
];

export type Receipt = {
  id: string;
  organizationId: string;
  vendor: string;
  amount: number;
  category: string;
  capturedAt: string;
  /** AI/OCR confidence 0..1 */
  confidence: number;
};

export const receipts: Receipt[] = [
  {
    id: "rcpt_01",
    organizationId: organization.id,
    vendor: "Floor & Decor",
    amount: 1284.56,
    category: "Materials",
    capturedAt: "Today, 8:42 AM",
    confidence: 0.96,
  },
  {
    id: "rcpt_02",
    organizationId: organization.id,
    vendor: "City Tile Supply",
    amount: 642.0,
    category: "Materials",
    capturedAt: "Today, 7:58 AM",
    confidence: 0.81,
  },
  {
    id: "rcpt_03",
    organizationId: organization.id,
    vendor: "Danny's Demo Co.",
    amount: 1500.0,
    category: "Subcontractor",
    capturedAt: "Yesterday",
    confidence: 0.62,
  },
];

export type ExpenseCategory = {
  id: string;
  label: string;
  amount: number;
  tone: "wood" | "sage" | "clay" | "plum" | "neutral";
};

/** Shares of the $51,480 MTD expense figure above. */
export const expenseCategories: ExpenseCategory[] = [
  { id: "mat", label: "Materials", amount: 23160, tone: "wood" },
  { id: "sub", label: "Subcontractors", amount: 14240, tone: "sage" },
  { id: "labor", label: "Crew labor", amount: 7720, tone: "clay" },
  { id: "tools", label: "Tools & equipment", amount: 3860, tone: "plum" },
  { id: "other", label: "Fuel & other", amount: 2500, tone: "neutral" },
];

export type QuickAction = {
  id: string;
  label: string;
  href: string;
  icon: "filePlus" | "userPlus" | "dollar" | "scan" | "invoice" | "wrench";
};

export const quickActions: QuickAction[] = [
  { id: "qa_estimate", label: "New estimate", href: "#", icon: "filePlus" },
  { id: "qa_invoice", label: "Create invoice", href: "#", icon: "invoice" },
  { id: "qa_expense", label: "Log expense", href: "#", icon: "dollar" },
  { id: "qa_receipt", label: "Scan receipt", href: "#", icon: "scan" },
  { id: "qa_customer", label: "Add customer", href: "#", icon: "userPlus" },
  { id: "qa_job", label: "Add job", href: "#", icon: "wrench" },
];

/* ----------------------------- formatting ----------------------------- */

export const usd = (n: number, opts?: { cents?: boolean }) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts?.cents ? 2 : 0,
    maximumFractionDigits: opts?.cents ? 2 : 0,
  }).format(n);

export const usdCompact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 1,
  }).format(n);

export const signedPct = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "\u2212" : ""}${Math.abs(n).toFixed(1)}%`;

export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");
