/**
 * The Flooring Folks CRM — demo seed data.
 *
 * A single, plausible tenant ("The Flooring Folks") rendered entirely with the
 * types and helpers from {@link ./domain}. All monetary math is derived through
 * `invoiceTotal`, `estimateTotal`, `jobProfit`, and `computeDashboardSummary`
 * so the dataset is internally consistent and doubles as a usage reference.
 *
 * Dates are pinned to the project's "current" date of 2026-06-26 so the demo is
 * deterministic regardless of when it is rendered.
 */

import {
  computeDashboardSummary,
  defaultExpenseCategoryOptions,
  defaultJobStatusOptions,
  defaultPaymentMethodOptions,
  jobProfit,
} from "./domain";
import type {
  ActivityEntry,
  BusinessSettings,
  Customer,
  Estimate,
  Expense,
  FileAsset,
  Invoice,
  Job,
  JobProfit,
  LineItemTemplate,
  Organization,
  OrganizationMember,
  Payment,
  Profile,
  ReceiptDraft,
  SupportAccessGrant,
} from "./domain";

// Fixed "today" so overdue/aging math is stable in the demo.
export const SAMPLE_TODAY = "2026-06-26T09:00:00.000Z";

const ORG_ID = "org_flooring_folks";

// ---------------------------------------------------------------------------
// Organization, team, and settings
// ---------------------------------------------------------------------------

export const sampleOrganization: Organization = {
  id: ORG_ID,
  name: "The Flooring Folks",
  slug: "the-flooring-folks",
  timezone: "America/New_York",
  createdAt: "2024-02-12T14:00:00.000Z",
};

export const sampleProfiles: Profile[] = [
  {
    id: "profile_ryan",
    firstName: "Ryan",
    lastName: "Benson",
    email: "ryan@theflooringfolks.com",
    createdAt: "2024-02-12T14:00:00.000Z",
  },
  {
    id: "profile_jessica",
    firstName: "Jessica",
    lastName: "Benson",
    email: "jessica@theflooringfolks.com",
    createdAt: "2024-03-01T14:00:00.000Z",
  },
  {
    id: "profile_dana",
    firstName: "Dana",
    lastName: "Whitfield",
    email: "dana@theflooringfolks.com",
    createdAt: "2025-01-20T14:00:00.000Z",
  },
];

export const sampleMembers: OrganizationMember[] = [
  {
    id: "member_ryan",
    organizationId: ORG_ID,
    profileId: "profile_ryan",
    role: "owner",
    createdAt: "2024-02-12T14:00:00.000Z",
  },
  {
    id: "member_jessica",
    organizationId: ORG_ID,
    profileId: "profile_jessica",
    role: "admin",
    createdAt: "2024-03-01T14:00:00.000Z",
  },
  {
    id: "member_dana",
    organizationId: ORG_ID,
    profileId: "profile_dana",
    role: "bookkeeper",
    createdAt: "2025-01-20T14:00:00.000Z",
  },
];

export const sampleBusinessSettings: BusinessSettings = {
  organizationId: ORG_ID,
  displayName: "The Flooring Folks",
  legalName: "The Flooring Folks, LLC",
  website: "https://theflooringfolks.com",
  email: "hello@theflooringfolks.com",
  phone: "7705550142",
  address: {
    line1: "418 Maple Ridge Rd",
    line2: "Suite B",
    city: "Marietta",
    region: "GA",
    postalCode: "30060",
    country: "US",
  },
  brand: {
    primaryColor: "#d99a48",
    accentColor: "#6fb386",
    brandMarkStoragePath: "orgs/the-flooring-folks/brand/mark.svg",
    logoStoragePath: "orgs/the-flooring-folks/brand/logo.svg",
  },
  currency: "USD",
  taxRatePct: 7,
  invoiceTerms: "Payment due within 15 days unless otherwise noted.",
  estimateNotes:
    "Estimate is valid for 14 days. Final pricing may change if hidden subfloor damage is discovered after demo.",
  invoiceNumbering: {
    prefix: "INV",
    nextNumber: 1047,
    numberPadding: 4,
  },
  estimateNumbering: {
    prefix: "EST",
    nextNumber: 212,
    numberPadding: 4,
  },
  expenseCategories: [
    ...defaultExpenseCategoryOptions(),
    {
      value: "dump_fees",
      label: "Dump fees",
      position: 8,
      enabled: true,
      system: false,
    },
  ],
  jobStatuses: defaultJobStatusOptions(),
  paymentMethods: defaultPaymentMethodOptions(),
  updatedAt: "2026-06-26T13:00:00.000Z",
};

export const sampleLineItemTemplates: LineItemTemplate[] = [
  {
    id: "template_lvp_install",
    organizationId: ORG_ID,
    name: "LVP install",
    description: "Install luxury vinyl plank flooring, including layout and standard cuts.",
    unit: "sq_ft",
    defaultQuantity: 1,
    defaultUnitPriceCents: 325,
    category: "labor",
    position: 0,
    createdAt: "2026-06-26T13:00:00.000Z",
    updatedAt: "2026-06-26T13:00:00.000Z",
  },
  {
    id: "template_base_shoe",
    organizationId: ORG_ID,
    name: "Base shoe install",
    description: "Install primed base shoe after flooring install.",
    unit: "linear_ft",
    defaultQuantity: 1,
    defaultUnitPriceCents: 275,
    category: "materials",
    position: 1,
    createdAt: "2026-06-26T13:00:00.000Z",
    updatedAt: "2026-06-26T13:00:00.000Z",
  },
  {
    id: "template_tile_floor",
    organizationId: ORG_ID,
    name: "Tile floor install",
    description: "Install tile flooring with standard underlayment and grout.",
    unit: "sq_ft",
    defaultQuantity: 1,
    defaultUnitPriceCents: 850,
    category: "labor",
    position: 2,
    createdAt: "2026-06-26T13:00:00.000Z",
    updatedAt: "2026-06-26T13:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export const sampleCustomers: Customer[] = [
  {
    id: "cust_whitfield",
    organizationId: ORG_ID,
    firstName: "Ryan",
    lastName: "Whitfield",
    email: "m.whitfield@gmail.com",
    phone: "4045550119",
    address: "2210 Ivy Glen Ln, Roswell, GA 30075",
    notes: "Prefers text updates. Two indoor cats — keep doors closed.",
    createdAt: "2026-05-20T15:30:00.000Z",
    updatedAt: "2026-06-11T18:45:00.000Z",
  },
  {
    id: "cust_raman",
    organizationId: ORG_ID,
    firstName: "Priya",
    lastName: "Raman",
    email: "priya.raman@outlook.com",
    phone: "6785550173",
    address: "77 Brookside Ct, Sandy Springs, GA 30328",
    notes: "Refinish only; original 1998 red oak.",
    createdAt: "2026-04-29T17:10:00.000Z",
    updatedAt: "2026-05-18T20:00:00.000Z",
  },
  {
    id: "cust_calloway",
    organizationId: ORG_ID,
    firstName: "James",
    lastName: "Calloway",
    email: "jcalloway@callowaytrust.com",
    phone: "4045550188",
    address: "1450 West Paces Ferry Rd NW, Atlanta, GA 30327",
    notes: "Estate property. Wool runner, brass rods, custom binding.",
    createdAt: "2026-06-02T13:00:00.000Z",
    updatedAt: "2026-06-19T16:20:00.000Z",
  },
  {
    id: "cust_nguyen",
    organizationId: ORG_ID,
    firstName: "Sandra",
    lastName: "Nguyen",
    email: "sandra.nguyen@gmail.com",
    phone: "7705550210",
    address: "92 Holly Springs Rd, Woodstock, GA 30188",
    notes: "Two bathrooms, both small. Considering porcelain plank.",
    createdAt: "2026-06-18T19:30:00.000Z",
    updatedAt: "2026-06-22T15:00:00.000Z",
  },
  {
    id: "cust_bennett",
    organizationId: ORG_ID,
    firstName: "Grace",
    lastName: "Bennett",
    email: "grace@bennettproperty.co",
    phone: "4045550301",
    address: "500 Northpoint Pkwy, Ste 200, Alpharetta, GA 30022",
    notes: "Commercial tenant build-out. Net-15 terms on file.",
    createdAt: "2026-05-06T16:00:00.000Z",
    updatedAt: "2026-05-29T21:10:00.000Z",
  },
  {
    id: "cust_holloway",
    organizationId: ORG_ID,
    firstName: "Derrick",
    lastName: "Holloway",
    email: "d.holloway@yahoo.com",
    phone: "6785550145",
    address: "38 Cedar Bluff Dr, Kennesaw, GA 30152",
    notes: "Insurance claim for water-damaged laminate. Scheduled start 7/6.",
    createdAt: "2026-06-08T18:00:00.000Z",
    updatedAt: "2026-06-24T17:30:00.000Z",
  },
  {
    id: "cust_vance",
    organizationId: ORG_ID,
    firstName: "Elena",
    lastName: "Vance",
    email: "elena.vance@gmail.com",
    phone: "4045550124",
    address: "1604 Magnolia Way, Smyrna, GA 30080",
    notes: "Recurring client. Slow to pay — flag overdue quickly.",
    createdAt: "2025-11-02T14:00:00.000Z",
    updatedAt: "2026-05-02T19:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export const sampleJobs: Job[] = [
  {
    id: "job_whitfield_lvp",
    organizationId: ORG_ID,
    customerId: "cust_whitfield",
    title: "Whole-home luxury vinyl plank",
    status: "in_progress",
    address: "2210 Ivy Glen Ln, Roswell, GA 30075",
    scheduledStart: "2026-06-04T12:00:00.000Z",
    revenueCents: 15494,
    notes: "2,300 sq ft premium LVP, demo + install + base shoe.",
    createdAt: "2026-05-20T15:45:00.000Z",
    updatedAt: "2026-06-15T20:30:00.000Z",
  },
  {
    id: "job_raman_hardwood",
    organizationId: ORG_ID,
    customerId: "cust_raman",
    title: "Red oak hardwood refinish",
    status: "completed",
    address: "77 Brookside Ct, Sandy Springs, GA 30328",
    scheduledStart: "2026-05-12T12:00:00.000Z",
    completedAt: "2026-05-16T20:00:00.000Z",
    revenueCents: 6848,
    notes: "650 sq ft screen & recoat, custom stain.",
    createdAt: "2026-04-29T17:20:00.000Z",
    updatedAt: "2026-05-18T20:00:00.000Z",
  },
  {
    id: "job_calloway_stair",
    organizationId: ORG_ID,
    customerId: "cust_calloway",
    title: "Custom wool stair runner",
    status: "scheduled",
    address: "1450 West Paces Ferry Rd NW, Atlanta, GA 30327",
    scheduledStart: "2026-07-01T12:00:00.000Z",
    revenueCents: 4194,
    notes: "16 stairs, wool runner, brass rods, custom binding.",
    createdAt: "2026-06-02T13:10:00.000Z",
    updatedAt: "2026-06-19T16:20:00.000Z",
  },
  {
    id: "job_nguyen_tile",
    organizationId: ORG_ID,
    customerId: "cust_nguyen",
    title: "Two-bathroom porcelain tile",
    status: "lead",
    address: "92 Holly Springs Rd, Woodstock, GA 30188",
    revenueCents: 4141,
    notes: "Estimate sent 6/22, awaiting decision.",
    createdAt: "2026-06-18T19:40:00.000Z",
    updatedAt: "2026-06-22T15:00:00.000Z",
  },
  {
    id: "job_bennett_carpet",
    organizationId: ORG_ID,
    customerId: "cust_bennett",
    title: "Commercial office carpet install",
    status: "completed",
    address: "500 Northpoint Pkwy, Ste 200, Alpharetta, GA 30022",
    scheduledStart: "2026-05-22T12:00:00.000Z",
    completedAt: "2026-05-28T20:00:00.000Z",
    revenueCents: 11717,
    notes: "1,400 sq yd commercial broadloom after hours.",
    createdAt: "2026-05-06T16:10:00.000Z",
    updatedAt: "2026-05-29T21:10:00.000Z",
  },
  {
    id: "job_holloway_laminate",
    organizationId: ORG_ID,
    customerId: "cust_holloway",
    title: "Water-damaged laminate replacement",
    status: "scheduled",
    address: "38 Cedar Bluff Dr, Kennesaw, GA 30152",
    scheduledStart: "2026-07-06T12:00:00.000Z",
    revenueCents: 4978,
    notes: "Insurance claim. 380 sq ft waterproof laminate.",
    createdAt: "2026-06-08T18:10:00.000Z",
    updatedAt: "2026-06-24T17:30:00.000Z",
  },
  {
    id: "job_vance_repair",
    organizationId: ORG_ID,
    customerId: "cust_vance",
    title: "Loose floor tile repair + regrout",
    status: "completed",
    address: "1604 Magnolia Way, Smyrna, GA 30080",
    scheduledStart: "2026-04-28T12:00:00.000Z",
    completedAt: "2026-04-30T20:00:00.000Z",
    revenueCents: 728,
    notes: "40 sq ft regrout, laundry + entry.",
    createdAt: "2025-11-02T14:10:00.000Z",
    updatedAt: "2026-05-02T19:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Estimates
// ---------------------------------------------------------------------------

export const sampleEstimates: Estimate[] = [
  {
    id: "est_holloway",
    organizationId: ORG_ID,
    number: "EST-208",
    customerId: "cust_holloway",
    jobId: "job_holloway_laminate",
    status: "accepted",
    issueDate: "2026-06-10",
    expiryDate: "2026-07-10",
    taxRatePct: 7,
    items: [
      {
        id: "est_holloway_i1",
        estimateId: "est_holloway",
        description: "Remove & haul water-damaged laminate — 380 sq ft",
        quantity: 380,
        unitPriceCents: 200,
      },
      {
        id: "est_holloway_i2",
        estimateId: "est_holloway",
        description: "Waterproof laminate material — 12mm",
        quantity: 380,
        unitPriceCents: 340,
      },
      {
        id: "est_holloway_i3",
        estimateId: "est_holloway",
        description: "Install + new underlayment + transitions",
        quantity: 1,
        unitPriceCents: 260000,
      },
    ],
    notes: "Matching insurance adjuster line items.",
    createdAt: "2026-06-10T15:00:00.000Z",
    updatedAt: "2026-06-24T17:30:00.000Z",
  },
  {
    id: "est_nguyen",
    organizationId: ORG_ID,
    number: "EST-209",
    customerId: "cust_nguyen",
    jobId: "job_nguyen_tile",
    status: "sent",
    issueDate: "2026-06-22",
    expiryDate: "2026-07-22",
    taxRatePct: 7,
    items: [
      {
        id: "est_nguyen_i1",
        estimateId: "est_nguyen",
        description: "Demo existing tile + mudset — 2 bathrooms",
        quantity: 1,
        unitPriceCents: 90000,
      },
      {
        id: "est_nguyen_i2",
        estimateId: "est_nguyen",
        description: "Porcelain plank tile material",
        quantity: 220,
        unitPriceCents: 450,
      },
      {
        id: "est_nguyen_i3",
        estimateId: "est_nguyen",
        description: "Install + grout + seal",
        quantity: 220,
        unitPriceCents: 900,
      },
    ],
    notes: "Held pricing for 30 days. Grout color TBD by homeowner.",
    createdAt: "2026-06-22T15:00:00.000Z",
    updatedAt: "2026-06-22T15:00:00.000Z",
  },
  {
    id: "est_porch_draft",
    organizationId: ORG_ID,
    number: "EST-211",
    customerId: "cust_vance",
    status: "draft",
    issueDate: "2026-06-25",
    expiryDate: "2026-07-25",
    taxRatePct: 7,
    items: [
      {
        id: "est_porch_i1",
        estimateId: "est_porch_draft",
        description: "Porcelain paver tile — covered porch, 120 sq ft",
        quantity: 120,
        unitPriceCents: 825,
      },
      {
        id: "est_porch_i2",
        estimateId: "est_porch_draft",
        description: "Mudset + install + grout",
        quantity: 120,
        unitPriceCents: 1100,
      },
    ],
    notes: "Waiting on porch paint color before sending.",
    createdAt: "2026-06-25T16:30:00.000Z",
    updatedAt: "2026-06-25T16:30:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

export const sampleInvoices: Invoice[] = [
  {
    id: "inv_raman",
    organizationId: ORG_ID,
    number: "INV-1042",
    customerId: "cust_raman",
    jobId: "job_raman_hardwood",
    status: "paid",
    issueDate: "2026-05-16",
    dueDate: "2026-06-15",
    taxRatePct: 7,
    items: [
      {
        id: "inv_raman_i1",
        invoiceId: "inv_raman",
        description: "Refinish existing red oak — 650 sq ft",
        quantity: 650,
        unitPriceCents: 850,
      },
      {
        id: "inv_raman_i2",
        invoiceId: "inv_raman",
        description: "Color stain + 3 coats water-based poly",
        quantity: 1,
        unitPriceCents: 87500,
      },
    ],
    notes: "Thank you for your business!",
    createdAt: "2026-05-16T20:30:00.000Z",
    updatedAt: "2026-05-18T20:00:00.000Z",
  },
  {
    id: "inv_bennett",
    organizationId: ORG_ID,
    number: "INV-1043",
    customerId: "cust_bennett",
    jobId: "job_bennett_carpet",
    status: "paid",
    issueDate: "2026-05-28",
    dueDate: "2026-06-12",
    taxRatePct: 7,
    items: [
      {
        id: "inv_bennett_i1",
        invoiceId: "inv_bennett",
        description: "Commercial broadloom carpet — 1,400 sq yd",
        quantity: 1400,
        unitPriceCents: 625,
      },
      {
        id: "inv_bennett_i2",
        invoiceId: "inv_bennett",
        description: "Install + tack strip + transition metals (after hours)",
        quantity: 1,
        unitPriceCents: 220000,
      },
    ],
    notes: "Net-15 per account agreement.",
    createdAt: "2026-05-28T21:00:00.000Z",
    updatedAt: "2026-05-29T21:10:00.000Z",
  },
  {
    id: "inv_whitfield",
    organizationId: ORG_ID,
    number: "INV-1044",
    customerId: "cust_whitfield",
    jobId: "job_whitfield_lvp",
    status: "partial",
    issueDate: "2026-06-09",
    dueDate: "2026-07-09",
    taxRatePct: 7,
    items: [
      {
        id: "inv_whitfield_i1",
        invoiceId: "inv_whitfield",
        description: "Premium LVP material — 2,300 sq ft",
        quantity: 2300,
        unitPriceCents: 310,
      },
      {
        id: "inv_whitfield_i2",
        invoiceId: "inv_whitfield",
        description: "Demo + install + base shoe + transitions",
        quantity: 1,
        unitPriceCents: 650000,
      },
      {
        id: "inv_whitfield_i3",
        invoiceId: "inv_whitfield",
        description: "Furniture move + haul-off",
        quantity: 1,
        unitPriceCents: 85000,
      },
    ],
    notes: "50% deposit due at start, balance on completion.",
    createdAt: "2026-06-09T18:00:00.000Z",
    updatedAt: "2026-06-10T18:00:00.000Z",
  },
  {
    id: "inv_calloway",
    organizationId: ORG_ID,
    number: "INV-1045",
    customerId: "cust_calloway",
    jobId: "job_calloway_stair",
    status: "sent",
    issueDate: "2026-06-19",
    dueDate: "2026-07-17",
    taxRatePct: 7,
    items: [
      {
        id: "inv_calloway_i1",
        invoiceId: "inv_calloway",
        description: "Wool runner material — 16 stairs",
        quantity: 16,
        unitPriceCents: 9500,
      },
      {
        id: "inv_calloway_i2",
        invoiceId: "inv_calloway",
        description: "Custom install + binding + brass rods",
        quantity: 1,
        unitPriceCents: 240000,
      },
    ],
    createdAt: "2026-06-19T16:30:00.000Z",
    updatedAt: "2026-06-19T16:30:00.000Z",
  },
  {
    id: "inv_vance",
    organizationId: ORG_ID,
    number: "INV-1041",
    customerId: "cust_vance",
    jobId: "job_vance_repair",
    status: "overdue",
    issueDate: "2026-04-30",
    dueDate: "2026-05-20",
    taxRatePct: 7,
    items: [
      {
        id: "inv_vance_i1",
        invoiceId: "inv_vance",
        description: "Repair loose floor tile + regrout — 40 sq ft",
        quantity: 1,
        unitPriceCents: 68000,
      },
    ],
    notes: "Partial cash payment received 5/2. Balance past due.",
    createdAt: "2026-04-30T20:30:00.000Z",
    updatedAt: "2026-05-02T19:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export const samplePayments: Payment[] = [
  {
    id: "pay_raman",
    organizationId: ORG_ID,
    invoiceId: "inv_raman",
    amountCents: 6848,
    method: "card",
    paidAt: "2026-05-18T19:45:00.000Z",
    reference: "stripe_ch_1Raman",
    notes: "Paid in full via online portal.",
    createdAt: "2026-05-18T20:00:00.000Z",
  },
  {
    id: "pay_bennett",
    organizationId: ORG_ID,
    invoiceId: "inv_bennett",
    amountCents: 11717,
    method: "check",
    paidAt: "2026-05-29T17:00:00.000Z",
    reference: "Check #4471",
    notes: "Net-15, paid early.",
    createdAt: "2026-05-29T21:10:00.000Z",
  },
  {
    id: "pay_whitfield_deposit",
    organizationId: ORG_ID,
    invoiceId: "inv_whitfield",
    amountCents: 6000,
    method: "card",
    paidAt: "2026-06-10T18:00:00.000Z",
    reference: "stripe_ch_1WhitDep",
    notes: "50% deposit at project start.",
    createdAt: "2026-06-10T18:00:00.000Z",
  },
  {
    id: "pay_vance_partial",
    organizationId: ORG_ID,
    invoiceId: "inv_vance",
    amountCents: 300,
    method: "cash",
    paidAt: "2026-05-02T19:00:00.000Z",
    notes: "Partial payment on completion. Balance outstanding.",
    createdAt: "2026-05-02T19:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

export const sampleExpenses: Expense[] = [
  {
    id: "exp_whitfield_lvp_material",
    organizationId: ORG_ID,
    jobId: "job_whitfield_lvp",
    vendor: "Floor & Decor",
    category: "materials",
    amountCents: 7350,
    status: "approved",
    incurredDate: "2026-06-03",
    receiptId: "receipt_whitfield_material",
    notes: "LVP planks + underlayment + reducer strips.",
    createdAt: "2026-06-03T20:00:00.000Z",
  },
  {
    id: "exp_raman_stain",
    organizationId: ORG_ID,
    jobId: "job_raman_hardwood",
    vendor: "Bona",
    category: "materials",
    amountCents: 640,
    status: "approved",
    incurredDate: "2026-05-12",
    createdAt: "2026-05-12T20:00:00.000Z",
  },
  {
    id: "exp_bennett_subcontractor",
    organizationId: ORG_ID,
    jobId: "job_bennett_carpet",
    vendor: "Metro Carpet Installers LLC",
    category: "subcontractor",
    amountCents: 2200,
    status: "approved",
    incurredDate: "2026-05-28",
    notes: "After-hours install crew.",
    createdAt: "2026-05-28T21:00:00.000Z",
  },
  {
    id: "exp_whitfield_labor",
    organizationId: ORG_ID,
    jobId: "job_whitfield_lvp",
    vendor: "Payroll — install crew",
    category: "labor",
    amountCents: 2800,
    status: "approved",
    incurredDate: "2026-06-09",
    createdAt: "2026-06-09T20:00:00.000Z",
  },
  {
    id: "exp_fuel_june",
    organizationId: ORG_ID,
    vendor: "Shell",
    category: "fuel",
    amountCents: 95,
    status: "approved",
    incurredDate: "2026-06-12",
    createdAt: "2026-06-12T20:00:00.000Z",
  },
  {
    id: "exp_jobber",
    organizationId: ORG_ID,
    vendor: "Jobber",
    category: "software",
    amountCents: 69,
    status: "approved",
    incurredDate: "2026-06-01",
    notes: "Monthly CRM/scheduling subscription.",
    createdAt: "2026-06-01T20:00:00.000Z",
  },
  {
    id: "exp_calloway_supplies",
    organizationId: ORG_ID,
    jobId: "job_calloway_stair",
    vendor: "The Home Depot",
    category: "supplies",
    amountCents: 142,
    status: "approved",
    incurredDate: "2026-06-20",
    notes: "Tackless strip, adhesive, tacks.",
    createdAt: "2026-06-20T20:00:00.000Z",
  },
  {
    id: "exp_whitfield_equipment",
    organizationId: ORG_ID,
    jobId: "job_whitfield_lvp",
    vendor: "United Rentals",
    category: "equipment",
    amountCents: 180,
    status: "approved",
    incurredDate: "2026-06-05",
    notes: "100lb floor roller rental.",
    createdAt: "2026-06-05T20:00:00.000Z",
  },
  {
    // Draft created FROM a pending receipt — still needs human review.
    id: "exp_whitfield_transitions",
    organizationId: ORG_ID,
    jobId: "job_whitfield_lvp",
    vendor: "LL Flooring",
    category: "materials",
    amountCents: 210,
    status: "draft",
    incurredDate: "2026-06-22",
    receiptId: "receipt_ll_transitions",
    notes: "Auto-drafted from receipt OCR — verify before approving.",
    createdAt: "2026-06-22T20:00:00.000Z",
  },
  {
    id: "exp_vance_saw",
    organizationId: ORG_ID,
    jobId: "job_vance_repair",
    vendor: "Star Rentals",
    category: "equipment",
    amountCents: 75,
    status: "draft",
    incurredDate: "2026-05-01",
    notes: "Tile saw rental — pending receipt match.",
    createdAt: "2026-05-01T20:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Receipts pending review (OCR/AI drafts — never auto-finalized)
// ---------------------------------------------------------------------------

export const sampleReceiptDrafts: ReceiptDraft[] = [
  {
    id: "receipt_ll_transitions",
    organizationId: ORG_ID,
    fileId: "file_receipt_transitions",
    expenseId: "exp_whitfield_transitions",
    jobId: "job_whitfield_lvp",
    vendor: "LL Flooring",
    amountCents: 20947,
    category: "materials",
    incurredDate: "2026-06-22",
    ocrConfidence: 0.92,
    ocrRaw: {
      vendor: "LL Flooring",
      total: 209.47,
      tax: 13.0,
      lineItems: [
        { description: "T-Molding - Driftwood", qty: 4, price: 32.99 },
        { description: "Reducer - Driftwood", qty: 6, price: 12.49 },
      ],
    },
    reviewStatus: "pending_review",
    createdAt: "2026-06-22T20:00:00.000Z",
    updatedAt: "2026-06-22T20:00:00.000Z",
  },
  {
    id: "receipt_shell_fuel",
    organizationId: ORG_ID,
    fileId: "file_receipt_fuel",
    vendor: "Shell",
    amountCents: 5218,
    category: "fuel",
    incurredDate: "2026-06-25",
    ocrConfidence: 0.71,
    ocrRaw: { vendor: "Shell", total: 52.18, pump: 7 },
    reviewStatus: "pending_review",
    createdAt: "2026-06-25T20:00:00.000Z",
    updatedAt: "2026-06-25T20:00:00.000Z",
  },
  {
    id: "receipt_unreadable",
    organizationId: ORG_ID,
    fileId: "file_receipt_blurry",
    jobId: "job_vance_repair",
    // amountCents intentionally omitted: OCR could not read the total.
    ocrConfidence: 0.4,
    ocrRaw: { vendor: null, total: null, note: "image too blurry to parse" },
    reviewStatus: "needs_edits",
    createdAt: "2026-06-24T20:00:00.000Z",
    updatedAt: "2026-06-24T20:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

export const sampleFiles: FileAsset[] = [
  {
    id: "file_receipt_transitions",
    organizationId: ORG_ID,
    jobId: "job_whitfield_lvp",
    kind: "receipt",
    name: "LL-Flooring-06-22.jpg",
    storagePath: "orgs/the-flooring-folks/jobs/whitfield/receipts/ll-06-22.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 842_310,
    uploadedBy: "profile_ryan",
    createdAt: "2026-06-22T20:00:00.000Z",
  },
  {
    id: "file_receipt_fuel",
    organizationId: ORG_ID,
    kind: "receipt",
    name: "shell-06-25.jpg",
    storagePath: "orgs/the-flooring-folks/expenses/shell-06-25.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 410_982,
    uploadedBy: "profile_ryan",
    createdAt: "2026-06-25T20:00:00.000Z",
  },
  {
    id: "file_receipt_blurry",
    organizationId: ORG_ID,
    jobId: "job_vance_repair",
    kind: "receipt",
    name: "receipt-blurry.png",
    storagePath: "orgs/the-flooring-folks/jobs/vance/receipts/blurry.png",
    mimeType: "image/png",
    sizeBytes: 728_114,
    uploadedBy: "profile_ryan",
    createdAt: "2026-06-24T20:00:00.000Z",
  },
  {
    id: "file_whitfield_progress",
    organizationId: ORG_ID,
    jobId: "job_whitfield_lvp",
    customerId: "cust_whitfield",
    kind: "photo",
    name: "lvp-progress-day-3.jpg",
    storagePath: "orgs/the-flooring-folks/jobs/whitfield/photos/day-3.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 2_104_556,
    uploadedBy: "profile_ryan",
    createdAt: "2026-06-12T22:00:00.000Z",
  },
  {
    id: "file_calloway_contract",
    organizationId: ORG_ID,
    jobId: "job_calloway_stair",
    customerId: "cust_calloway",
    kind: "contract",
    name: "calloway-stair-runner-agreement.pdf",
    storagePath:
      "orgs/the-flooring-folks/jobs/calloway/contracts/agreement.pdf",
    mimeType: "application/pdf",
    sizeBytes: 318_204,
    uploadedBy: "profile_ryan",
    createdAt: "2026-06-19T16:20:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Activity log
// ---------------------------------------------------------------------------

export const sampleActivity: ActivityEntry[] = [
  {
    id: "activity_1",
    organizationId: ORG_ID,
    actorId: "profile_ryan",
    actorName: "Ryan Benson",
    entityType: "invoice",
    entityId: "inv_whitfield",
    action: "invoice.payment_received",
    summary: "Received $60.00 deposit on INV-1044 (Whitfield LVP).",
    createdAt: "2026-06-10T18:00:00.000Z",
  },
  {
    id: "activity_2",
    organizationId: ORG_ID,
    actorId: "profile_ryan",
    actorName: "Ryan Benson",
    entityType: "estimate",
    entityId: "est_nguyen",
    action: "estimate.sent",
    summary: "Sent EST-209 to Sandra Nguyen ($41.41).",
    createdAt: "2026-06-22T15:00:00.000Z",
  },
  {
    id: "activity_3",
    organizationId: ORG_ID,
    actorId: "profile_ryan",
    actorName: "Ryan Benson",
    entityType: "receipt",
    entityId: "receipt_ll_transitions",
    action: "receipt.imported",
    summary: "Receipt imported from photo — awaiting review (92% confident).",
    createdAt: "2026-06-22T20:00:00.000Z",
  },
  {
    id: "activity_4",
    organizationId: ORG_ID,
    actorId: "profile_ryan",
    actorName: "Ryan Benson",
    entityType: "job",
    entityId: "job_holloway_laminate",
    action: "job.scheduled",
    summary: "Scheduled Holloway laminate replacement for 7/6.",
    createdAt: "2026-06-24T17:30:00.000Z",
  },
  {
    id: "activity_5",
    organizationId: ORG_ID,
    actorName: "System",
    entityType: "invoice",
    entityId: "inv_vance",
    action: "invoice.overdue",
    summary: "INV-1041 (Vance) is overdue — $4.28 balance outstanding.",
    createdAt: "2026-05-21T12:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Support access grants
// ---------------------------------------------------------------------------

export const sampleSupportGrants: SupportAccessGrant[] = [
  {
    id: "grant_accountant",
    organizationId: ORG_ID,
    granteeEmail: "pat@brightpathaccounting.com",
    grantedBy: "profile_ryan",
    status: "active",
    scope: "invoices:read,payments:read,expenses:read,reports:read",
    expiresAt: "2026-12-31T23:59:59.000Z",
    createdAt: "2026-01-05T15:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Derived: per-job profit + dashboard summary
// ---------------------------------------------------------------------------

export interface SampleJobProfit {
  jobId: string;
  jobTitle: string;
  customerName: string;
  status: Job["status"];
  profit: JobProfit;
}

const customerNameById = new Map(
  sampleCustomers.map((c) => [c.id, `${c.firstName} ${c.lastName}`]),
);

/** Per-job profitability for every non-lead job (derived from raw records). */
export const sampleJobProfits: SampleJobProfit[] = sampleJobs
  .filter((job) => job.status !== "lead")
  .map((job) => ({
    jobId: job.id,
    jobTitle: job.title,
    customerName: customerNameById.get(job.customerId) ?? "—",
    status: job.status,
    profit: jobProfit(job, sampleInvoices, sampleExpenses),
  }));

/**
 * The headline cockpit metrics for the demo tenant, computed over the trailing
 * 30 days ending on the demo "today" (2026-06-26).
 */
export const sampleDashboardSummary = computeDashboardSummary({
  period: {
    start: new Date("2026-05-27T00:00:00.000Z"),
    end: new Date(SAMPLE_TODAY),
  },
  asOf: new Date(SAMPLE_TODAY),
  jobs: sampleJobs,
  invoices: sampleInvoices,
  payments: samplePayments,
  expenses: sampleExpenses,
  estimates: sampleEstimates,
  receipts: sampleReceiptDrafts,
});

/** Convenience bundle of the entire demo dataset. */
export const sampleData = {
  organization: sampleOrganization,
  profiles: sampleProfiles,
  members: sampleMembers,
  businessSettings: sampleBusinessSettings,
  lineItemTemplates: sampleLineItemTemplates,
  customers: sampleCustomers,
  jobs: sampleJobs,
  estimates: sampleEstimates,
  invoices: sampleInvoices,
  payments: samplePayments,
  expenses: sampleExpenses,
  receipts: sampleReceiptDrafts,
  files: sampleFiles,
  activity: sampleActivity,
  supportGrants: sampleSupportGrants,
  jobProfits: sampleJobProfits,
  dashboardSummary: sampleDashboardSummary,
} as const;

export type SampleData = typeof sampleData;
