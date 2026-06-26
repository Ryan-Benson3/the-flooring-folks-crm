/**
 * The Flooring Folks CRM — domain models & pure helpers.
 *
 * This module is intentionally server-safe and framework-agnostic: no React,
 * no Next.js, no browser-only globals. It only relies on `Intl` and `Date`,
 * both available in the Node runtime. Import freely from server components,
 * route handlers, and background jobs.
 *
 * Money convention
 * ----------------
 * Every monetary value is an integer number of minor units ("cents") stored as
 * a JS `number`. This avoids floating-point drift in a financial app and keeps
 * the TypeScript and SQL layers in lock-step (SQL columns are `bigint` cents).
 * Use {@link formatCurrency} for display and {@link parseCurrencyToCents} for
 * parsing user input.
 */

// ---------------------------------------------------------------------------
// Date alias
// ---------------------------------------------------------------------------

/** An ISO-8601 timestamp or date string (e.g. `2026-06-26T12:00:00Z`). */
export type ISODateString = string;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Enums (const tuples + derived union types)
// ---------------------------------------------------------------------------

export const ORG_ROLES = ["owner", "admin", "member", "bookkeeper"] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

export const JOB_STATUSES = [
  "lead",
  "scheduled",
  "in_progress",
  "completed",
  "on_hold",
  "cancelled",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const ESTIMATE_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "declined",
  "expired",
] as const;
export type EstimateStatus = (typeof ESTIMATE_STATUSES)[number];

export const INVOICE_STATUSES = [
  "draft",
  "sent",
  "paid",
  "partial",
  "overdue",
  "void",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PAYMENT_METHODS = [
  "cash",
  "check",
  "card",
  "ach",
  "transfer",
  "other",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const EXPENSE_CATEGORIES = [
  "materials",
  "labor",
  "subcontractor",
  "equipment",
  "fuel",
  "supplies",
  "software",
  "other",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_STATUSES = ["draft", "reviewed", "approved"] as const;
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];

export const RECEIPT_REVIEW_STATUSES = [
  "pending_review",
  "reviewed",
  "needs_edits",
  "rejected",
] as const;
export type ReceiptReviewStatus = (typeof RECEIPT_REVIEW_STATUSES)[number];

export const FILE_KINDS = [
  "photo",
  "document",
  "contract",
  "receipt",
  "invoice",
  "other",
] as const;
export type FileKind = (typeof FILE_KINDS)[number];

export const SUPPORT_GRANT_STATUSES = ["active", "revoked", "expired"] as const;
export type SupportGrantStatus = (typeof SUPPORT_GRANT_STATUSES)[number];

// Human-readable labels for UI surfaces (premium polish, no magic strings).

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  lead: "Lead",
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
  on_hold: "On hold",
  cancelled: "Cancelled",
};

/** Chip/accent colors (hex) for job-status badges. Tuned for the navy cockpit. */
export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  lead: "#64748b",
  scheduled: "#2563eb",
  in_progress: "#d97706",
  completed: "#16a34a",
  on_hold: "#71717a",
  cancelled: "#dc2626",
};

export const ESTIMATE_STATUS_LABELS: Record<EstimateStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  partial: "Partially paid",
  overdue: "Overdue",
  void: "Void",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  materials: "Materials",
  labor: "Labor",
  subcontractor: "Subcontractor",
  equipment: "Equipment",
  fuel: "Fuel",
  supplies: "Supplies",
  software: "Software",
  other: "Other",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  check: "Check",
  card: "Card",
  ach: "ACH",
  transfer: "Transfer",
  other: "Other",
};

/** Units a {@link LineItemTemplate} (and most line items) can be priced in. */
export const LINE_ITEM_UNITS = [
  "each",
  "hour",
  "day",
  "sq_ft",
  "sq_yd",
  "linear_ft",
  "lump_sum",
] as const;
export type LineItemUnit = (typeof LINE_ITEM_UNITS)[number];

export const LINE_ITEM_UNIT_LABELS: Record<LineItemUnit, string> = {
  each: "each",
  hour: "hour",
  day: "day",
  sq_ft: "sq ft",
  sq_yd: "sq yd",
  linear_ft: "linear ft",
  lump_sum: "lump sum",
};

// ---------------------------------------------------------------------------
// Core domain models
// ---------------------------------------------------------------------------

export interface Organization {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  createdAt: ISODateString;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  profileId: string; // == profiles.id == auth.users.id
  role: OrgRole;
  createdAt: ISODateString;
}

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  createdAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Business settings, branding & customizable picklists
// ---------------------------------------------------------------------------
//
// SQL table: public.organization_settings (1:1 with organizations), plus the
// child picklist tables organization_expense_categories,
// organization_job_statuses, organization_payment_methods, and
// organization_line_item_templates. The TS aggregate nests the picklists for
// ergonomic display; the data layer normalizes them into those tables so RLS
// and per-row maintenance stay simple. Every row is org-scoped.

/** Structured postal/mailing address. Assemble for display via {@link formatAddress}. */
export interface PostalAddress {
  line1?: string;
  line2?: string;
  city?: string;
  /** State / province / region. */
  region?: string;
  /** ZIP / postal code. */
  postalCode?: string;
  /** ISO 3166-1 country code, e.g. "US". */
  country?: string;
}

/** Branding tokens that feed the app chrome, PDFs, and customer portal. */
export interface BrandSettings {
  /** Primary brand color (hex). Drives accents, buttons, charts. */
  primaryColor?: string;
  /** Secondary accent color (hex) for highlights and badges. */
  accentColor?: string;
  /** Supabase Storage path to the full logo (PNG/SVG). Preferred source. */
  logoStoragePath?: string;
  /** Optional public/CDN logo URL; overrides logoStoragePath when set. */
  logoUrl?: string;
  /** Small square brand mark / icon for favicons + document watermarks. */
  brandMarkStoragePath?: string;
}

/** Sequential numbering scheme for estimates and invoices. */
export interface DocumentNumbering {
  /** Prefix prepended to every number, e.g. "INV". */
  prefix: string;
  /** Next integer to assign when a document is created. */
  nextNumber: number;
  /** Zero-pad the numeric portion to this width, e.g. 4 -> "1042". */
  numberPadding: number;
}

/**
 * One entry in a tenant-customizable picklist (expense categories, job
 * statuses, payment methods). System entries are seeded from the domain enums
 * and keep their `value` so existing records/constraints stay valid; tenants
 * may relabel, reorder, disable, or add their own non-system entries.
 */
export interface ListOption {
  /** Stable key. Equals the domain enum value for system options. */
  value: string;
  /** Human label rendered in selectors and chips. */
  label: string;
  /** 0-based display order. */
  position: number;
  /** Hidden from new selectors when false, but retained for history. */
  enabled: boolean;
  /** True when seeded from a system enum (not tenant-created). */
  system: boolean;
  /** Optional hex accent for status chips, e.g. "#16a34a". */
  color?: string;
}

export interface BusinessSettings {
  organizationId: string;

  // --- Identity & legal ---
  /** Trading / display name (mirrors Organization.name; editable here). */
  displayName: string;
  /** Legal entity name for invoices, contracts, and 1099s. */
  legalName?: string;
  /** Public website. */
  website?: string;

  // --- Contact ---
  /** General contact email printed on documents. */
  email?: string;
  /** General contact phone printed on documents. */
  phone?: string;

  // --- Address (structured for mailing + maps) ---
  address: PostalAddress;

  // --- Branding ---
  brand: BrandSettings;

  // --- Money & tax defaults ---
  /** ISO 4217 currency applied to estimates/invoices/expenses, e.g. "USD". */
  currency: string;
  /** Default sales-tax % applied to new estimates/invoices. */
  taxRatePct: number;

  // --- Document defaults ---
  /** Default terms printed on invoices (e.g. "Net 15"). */
  invoiceTerms?: string;
  /** Default notes pre-filled on new estimates. */
  estimateNotes?: string;
  invoiceNumbering: DocumentNumbering;
  estimateNumbering: DocumentNumbering;

  // --- Customizable picklists (mirror the SQL child tables) ---
  expenseCategories: ListOption[];
  jobStatuses: ListOption[];
  paymentMethods: ListOption[];

  updatedAt: ISODateString;
}

/**
 * A reusable catalog line a flooring crew drops onto estimates/invoices (and
 * optionally expenses), e.g. "LVP install — per sq ft". Tenant-scoped.
 */
export interface LineItemTemplate {
  id: string;
  organizationId: string;
  /** Short label shown in the template picker. */
  name: string;
  /** Default description copied onto the line item. */
  description: string;
  unit: LineItemUnit;
  defaultQuantity: number;
  defaultUnitPriceCents: number;
  /** Optional rollup category when used as an expense line. */
  category?: ExpenseCategory;
  /** True when the template can also seed an expense (not just a sale line). */
  isExpense?: boolean;
  position: number;
  archivedAt?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Customer {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Job {
  id: string;
  organizationId: string;
  customerId: string;
  title: string;
  status: JobStatus;
  address?: string;
  scheduledStart?: ISODateString;
  completedAt?: ISODateString;
  /** Target/budgeted revenue used when the job is not yet fully invoiced. */
  revenueCents: number;
  notes?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Expense {
  id: string;
  organizationId: string;
  jobId?: string;
  vendor: string;
  category: ExpenseCategory;
  amountCents: number;
  status: ExpenseStatus;
  incurredDate: ISODateString;
  receiptId?: string;
  notes?: string;
  createdAt: ISODateString;
}

/**
 * A receipt parsed by OCR/AI. Per product rules this is ALWAYS a reviewable
 * draft: it never finalizes a financial record on its own. A human reviews it,
 * optionally edits vendor/amount/category, and then promotes it to an
 * {@link Expense}.
 */
export interface ReceiptDraft {
  id: string;
  organizationId: string;
  fileId: string;
  expenseId?: string; // draft expense created from the receipt
  jobId?: string;
  vendor?: string;
  /** Omitted when OCR confidence is too low to read a total. */
  amountCents?: number;
  category?: ExpenseCategory;
  incurredDate?: ISODateString;
  ocrConfidence?: number; // 0..1
  ocrRaw?: Record<string, unknown>;
  reviewStatus: ReceiptReviewStatus;
  reviewedBy?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Estimate {
  id: string;
  organizationId: string;
  number: string;
  customerId: string;
  jobId?: string;
  status: EstimateStatus;
  issueDate: ISODateString;
  expiryDate?: ISODateString;
  items: EstimateItem[];
  taxRatePct: number;
  notes?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface EstimateItem {
  id: string;
  estimateId: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
}

export interface Invoice {
  id: string;
  organizationId: string;
  number: string;
  customerId: string;
  jobId?: string;
  estimateId?: string;
  status: InvoiceStatus;
  issueDate: ISODateString;
  dueDate: ISODateString;
  items: InvoiceItem[];
  taxRatePct: number;
  notes?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
}

export interface Payment {
  id: string;
  organizationId: string;
  invoiceId: string;
  amountCents: number;
  method: PaymentMethod;
  paidAt: ISODateString;
  reference?: string;
  notes?: string;
  createdAt: ISODateString;
}

export interface FileAsset {
  id: string;
  organizationId: string;
  jobId?: string;
  customerId?: string;
  kind: FileKind;
  name: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy?: string;
  createdAt: ISODateString;
}

export interface ActivityEntry {
  id: string;
  organizationId: string;
  actorId?: string;
  actorName?: string;
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  createdAt: ISODateString;
}

export interface SupportAccessGrant {
  id: string;
  organizationId: string;
  granteeEmail: string;
  grantedBy: string;
  status: SupportGrantStatus;
  /** Human-readable scope, e.g. "invoices:read,customers:read". */
  scope: string;
  expiresAt: ISODateString;
  createdAt: ISODateString;
}

/** A single line item common to estimates and invoices. */
export interface LineItem {
  quantity: number;
  unitPriceCents: number;
}

// ---------------------------------------------------------------------------
// Money helpers
// ---------------------------------------------------------------------------

/** Safely totals a list of cent values, ignoring non-finite entries. */
export function sumCents(values: readonly number[]): number {
  let total = 0;
  for (const value of values) {
    total += Number.isFinite(value) ? Math.round(value) : 0;
  }
  return total;
}

/** Extended cost of a single line item, rounded to whole cents. */
export function lineItemTotalCents(item: LineItem): number {
  return Math.round(item.quantity * item.unitPriceCents);
}

/** Formats cents as a currency string, e.g. `15494` -> `"$154.94"`. */
export function formatCurrency(cents: number, currency = "USD"): string {
  const safe = Number.isFinite(cents) ? Math.round(cents) : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(safe / 100);
}

/** Compact currency for headline metrics, e.g. `1771700` -> `"$17.7K"`. */
export function formatCurrencyCompact(
  cents: number,
  currency = "USD",
): string {
  const safe = Number.isFinite(cents) ? cents : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(safe / 100);
}

/** Decimal dollars (or major units) for display in inputs/exports. */
export function centsToDecimal(cents: number): number {
  return (Number.isFinite(cents) ? Math.round(cents) : 0) / 100;
}

/** Parses free-form currency input into whole cents. */
export function parseCurrencyToCents(input: string | number): number {
  if (typeof input === "number") {
    return Number.isFinite(input) ? Math.round(input * 100) : 0;
  }
  const cleaned = input.replace(/[^0-9.\-]/g, "");
  const value = Number(cleaned);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

/** Formats a 0..1 ratio (or a percent number) for display. */
export function formatPercent(value: number, fractionDigits = 1): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `${safe.toFixed(fractionDigits)}%`;
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/** Coerces an ISO string or Date into a Date. */
export function toDate(value: ISODateString | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function startOfDay(value: ISODateString | Date): Date {
  const d = toDate(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Whole-day difference `b - a` (positive when b is later). */
export function daysBetween(
  a: ISODateString | Date,
  b: ISODateString | Date,
): number {
  return Math.round(
    (toDate(b).getTime() - toDate(a).getTime()) / MS_PER_DAY,
  );
}

/** Short date, e.g. `"Jun 26, 2026"`. */
export function formatDate(
  value: ISODateString | Date,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" },
): string {
  return new Intl.DateTimeFormat("en-US", options).format(toDate(value));
}

/** Date + time, e.g. `"Jun 26, 2026, 2:30 PM"`. */
export function formatDateTime(value: ISODateString | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(toDate(value));
}

/** Friendly relative label: Today / Yesterday / Tomorrow / "3 days ago". */
export function formatRelativeDate(
  value: ISODateString | Date,
  now: ISODateString | Date = new Date(),
): string {
  const diff = daysBetween(startOfDay(now), startOfDay(value));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1 && diff <= 7) return `in ${diff} days`;
  if (diff < -1 && diff >= -7) return `${Math.abs(diff)} days ago`;
  return formatDate(value);
}

/** True when a date is strictly before the start of `asOf`'s day. */
export function isOverdue(
  dueDate: ISODateString | Date,
  asOf: ISODateString | Date = new Date(),
): boolean {
  return startOfDay(dueDate) < startOfDay(asOf);
}

// ---------------------------------------------------------------------------
// People helpers
// ---------------------------------------------------------------------------

export function fullName(person: {
  firstName: string;
  lastName: string;
}): string {
  return `${person.firstName} ${person.lastName}`.trim();
}

export function initials(person: {
  firstName: string;
  lastName: string;
}): string {
  return `${person.firstName.charAt(0)}${person.lastName.charAt(0)}`.toUpperCase();
}

/** Formats a 10/11-digit US phone as `"(555) 123-4567"`. */
export function formatPhone(phone?: string): string | undefined {
  if (!phone) return phone;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

// ---------------------------------------------------------------------------
// Business settings & branding helpers
// ---------------------------------------------------------------------------

/** True for a well-formed 6-digit hex color, e.g. "#0f766e". */
export function isHexColor(value?: string): boolean {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

/**
 * Assembles a {@link PostalAddress} for display. Defaults to a single comma
 * line ("418 Maple Ridge Rd, Suite B, Marietta, GA 30060"); pass
 * `{ singleLine: false }` for a two-line mailing layout. Empty addresses yield
 * `undefined`.
 */
export function formatAddress(
  address?: PostalAddress,
  opts: { singleLine?: boolean } = {},
): string | undefined {
  if (!address) return undefined;
  const street = [address.line1, address.line2].filter(Boolean).join(", ");
  const locality = [
    address.city,
    [address.region, address.postalCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
  const country =
    address.country && address.country.toUpperCase() !== "US"
      ? address.country
      : "";
  const parts = [street, locality, country].filter(Boolean);
  const sep = opts.singleLine === false ? "\n" : ", ";
  return parts.join(sep) || undefined;
}

/** Formats a document number with zero padding: ("INV", 1042, 4) -> "INV-1042". */
export function formatDocumentNumber(
  prefix: string,
  number: number,
  padding = 4,
): string {
  const safePrefix = (prefix ?? "").trim();
  const safeNumber =
    Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
  const width = padding > 0 ? Math.min(padding, 12) : 0;
  const numStr =
    width > 0 ? String(safeNumber).padStart(width, "0") : String(safeNumber);
  return safePrefix ? `${safePrefix}-${numStr}` : numStr;
}

/** The human number the *next* document of this kind will receive. */
export function nextDocumentNumber(
  numbering: Pick<DocumentNumbering, "prefix" | "nextNumber" | "numberPadding">,
): string {
  return formatDocumentNumber(
    numbering.prefix,
    numbering.nextNumber,
    numbering.numberPadding,
  );
}

/** Effective business name: legal name when set, otherwise display name. */
export function businessDisplayName(
  settings: Pick<BusinessSettings, "displayName" | "legalName">,
): string {
  return (settings.legalName ?? "").trim() || settings.displayName;
}

/** Default expense-category picklist, seeded from the system enum. */
export function defaultExpenseCategoryOptions(): ListOption[] {
  return EXPENSE_CATEGORIES.map((value, i) => ({
    value,
    label: EXPENSE_CATEGORY_LABELS[value],
    position: i,
    enabled: true,
    system: true,
  }));
}

/** Default job-status picklist (with chip colors), seeded from the system enum. */
export function defaultJobStatusOptions(): ListOption[] {
  return JOB_STATUSES.map((value, i) => ({
    value,
    label: JOB_STATUS_LABELS[value],
    position: i,
    enabled: true,
    system: true,
    color: JOB_STATUS_COLORS[value],
  }));
}

/** Default payment-method picklist, seeded from the system enum. */
export function defaultPaymentMethodOptions(): ListOption[] {
  return PAYMENT_METHODS.map((value, i) => ({
    value,
    label: PAYMENT_METHOD_LABELS[value],
    position: i,
    enabled: true,
    system: true,
  }));
}

// ---------------------------------------------------------------------------
// Estimate / invoice math
// ---------------------------------------------------------------------------

export function estimateSubtotal(estimate: Pick<Estimate, "items">): number {
  return sumCents(estimate.items.map((i) => lineItemTotalCents(i)));
}

export function estimateTax(
  estimate: Pick<Estimate, "items" | "taxRatePct">,
): number {
  return Math.round((estimateSubtotal(estimate) * estimate.taxRatePct) / 100);
}

export function estimateTotal(
  estimate: Pick<Estimate, "items" | "taxRatePct">,
): number {
  return estimateSubtotal(estimate) + estimateTax(estimate);
}

export function invoiceSubtotal(invoice: Pick<Invoice, "items">): number {
  return sumCents(invoice.items.map((i) => lineItemTotalCents(i)));
}

export function invoiceTax(
  invoice: Pick<Invoice, "items" | "taxRatePct">,
): number {
  return Math.round((invoiceSubtotal(invoice) * invoice.taxRatePct) / 100);
}

export function invoiceTotal(
  invoice: Pick<Invoice, "items" | "taxRatePct">,
): number {
  return invoiceSubtotal(invoice) + invoiceTax(invoice);
}

export function invoicePaid(
  invoice: Pick<Invoice, "id">,
  payments: readonly Payment[],
): number {
  return sumCents(
    payments
      .filter((p) => p.invoiceId === invoice.id)
      .map((p) => p.amountCents),
  );
}

/** Remaining balance on an invoice: total minus payments applied. */
export function invoiceBalance(
  invoice: Invoice,
  payments: readonly Payment[],
): number {
  return invoiceTotal(invoice) - invoicePaid(invoice, payments);
}

/**
 * Reconciles an invoice's displayed status from its actual balance + due date.
 * Stored status can lag behind payments; use this for accurate UI badges.
 */
export function deriveInvoiceStatus(
  invoice: Invoice,
  payments: readonly Payment[],
  asOf: ISODateString | Date = new Date(),
): InvoiceStatus {
  if (invoice.status === "void" || invoice.status === "draft") {
    return invoice.status;
  }
  const total = invoiceTotal(invoice);
  const paid = invoicePaid(invoice, payments);
  const balance = total - paid;
  if (balance <= 0) return "paid";
  if (isOverdue(invoice.dueDate, asOf)) return "overdue";
  if (paid > 0) return "partial";
  return "sent";
}

// ---------------------------------------------------------------------------
// Job profitability
// ---------------------------------------------------------------------------

export interface JobProfit {
  revenueCents: number;
  costCents: number;
  profitCents: number;
  /** Gross margin as a percentage of revenue (0 when revenue is 0). */
  marginPct: number;
}

/** Total amount billed to a job across all its invoices (pre-tax + tax). */
export function jobBilledCents(
  job: Pick<Job, "id">,
  invoices: readonly Invoice[],
): number {
  return sumCents(
    invoices
      .filter((i) => i.jobId === job.id)
      .map((i) => invoiceTotal(i)),
  );
}

/** Total approved/reviewed expenses charged to a job (drafts excluded). */
export function jobCostCents(
  job: Pick<Job, "id">,
  expenses: readonly Expense[],
): number {
  return sumCents(
    expenses
      .filter(
        (e) =>
          e.jobId === job.id &&
          (e.status === "approved" || e.status === "reviewed"),
      )
      .map((e) => e.amountCents),
  );
}

/** Breakdown of a job's cost by expense category. */
export function jobCostByCategory(
  job: Pick<Job, "id">,
  expenses: readonly Expense[],
): Record<ExpenseCategory, number> {
  const base = {
    materials: 0,
    labor: 0,
    subcontractor: 0,
    equipment: 0,
    fuel: 0,
    supplies: 0,
    software: 0,
    other: 0,
  } satisfies Record<ExpenseCategory, number>;
  for (const e of expenses) {
    if (e.jobId !== job.id || e.status === "draft") continue;
    base[e.category] += e.amountCents;
  }
  return base;
}

/**
 * Profit for a single job. Revenue = billed invoices (falls back to the job's
 * target `revenueCents` when nothing is invoiced yet). Cost = non-draft
 * expenses. Profit = revenue - cost.
 */
export function jobProfit(
  job: Job,
  invoices: readonly Invoice[],
  expenses: readonly Expense[],
): JobProfit {
  const billed = jobBilledCents(job, invoices);
  const revenueCents = billed > 0 ? billed : job.revenueCents;
  const costCents = jobCostCents(job, expenses);
  const profitCents = revenueCents - costCents;
  const marginPct = revenueCents > 0 ? (profitCents / revenueCents) * 100 : 0;
  return { revenueCents, costCents, profitCents, marginPct };
}

// ---------------------------------------------------------------------------
// Dashboard summary
// ---------------------------------------------------------------------------

export interface DashboardInput {
  /** Inclusive [start, end] window for revenue & expense totals. */
  period: { start: Date; end: Date };
  /** "Now" for overdue/aging math. Defaults to the real current time. */
  asOf?: Date;
  jobs: readonly Job[];
  invoices: readonly Invoice[];
  payments: readonly Payment[];
  expenses: readonly Expense[];
  estimates: readonly Estimate[];
  receipts: readonly ReceiptDraft[];
}

export interface DashboardSummary {
  asOf: ISODateString;
  period: { start: ISODateString; end: ISODateString };
  /** Cash collected within the period (sum of payments.paidAt in window). */
  revenueCents: number;
  /** Non-draft expenses incurred within the period. */
  expensesCents: number;
  profitCents: number;
  /** Profit as a percentage of collected revenue. */
  marginPct: number;
  /** Sum of unpaid balances across all live (non-draft/void) invoices. */
  outstandingCents: number;
  activeJobsCount: number;
  completedJobsCount: number;
  leadsCount: number;
  overdueInvoicesCount: number;
  receiptsPendingReviewCount: number;
  /** Estimates sent and not yet accepted/declined. */
  estimatesPendingCount: number;
}

/**
 * Computes the headline cockpit metrics for a tenant from raw records. All
 * inputs are the tenant-scoped slices already filtered by the caller (or by
 * RLS at the database layer).
 */
export function computeDashboardSummary(input: DashboardInput): DashboardSummary {
  const asOf = input.asOf ?? new Date();
  const { start, end } = input.period;

  const inPeriod = (iso: ISODateString): boolean => {
    const d = toDate(iso);
    return d >= start && d <= end;
  };

  const paymentsInPeriod = input.payments.filter((p) => inPeriod(p.paidAt));
  const revenueCents = sumCents(paymentsInPeriod.map((p) => p.amountCents));

  const expensesInPeriod = input.expenses.filter(
    (e) => e.status !== "draft" && inPeriod(e.incurredDate),
  );
  const expensesCents = sumCents(
    expensesInPeriod.map((e) => e.amountCents),
  );

  const profitCents = revenueCents - expensesCents;
  const marginPct = revenueCents > 0 ? (profitCents / revenueCents) * 100 : 0;

  const liveInvoices = input.invoices.filter(
    (i) => i.status !== "draft" && i.status !== "void",
  );
  const outstandingCents = sumCents(
    liveInvoices.map((i) => Math.max(0, invoiceBalance(i, input.payments))),
  );

  const activeJobsCount = input.jobs.filter(
    (j) => j.status === "in_progress" || j.status === "scheduled",
  ).length;
  const completedJobsCount = input.jobs.filter(
    (j) => j.status === "completed",
  ).length;
  const leadsCount = input.jobs.filter((j) => j.status === "lead").length;

  const overdueInvoicesCount = liveInvoices.filter(
    (i) =>
      isOverdue(i.dueDate, asOf) && invoiceBalance(i, input.payments) > 0,
  ).length;

  const receiptsPendingReviewCount = input.receipts.filter(
    (r) => r.reviewStatus === "pending_review",
  ).length;

  const estimatesPendingCount = input.estimates.filter(
    (e) => e.status === "sent",
  ).length;

  return {
    asOf: asOf.toISOString(),
    period: { start: start.toISOString(), end: end.toISOString() },
    revenueCents,
    expensesCents,
    profitCents,
    marginPct,
    outstandingCents,
    activeJobsCount,
    completedJobsCount,
    leadsCount,
    overdueInvoicesCount,
    receiptsPendingReviewCount,
    estimatesPendingCount,
  };
}
