# Build Roadmap

The Flooring Folks CRM is built in phases. Each phase has a clear goal, deliverables,
dependencies, and exit criteria. Phase 1 (Foundation) is complete and locally verified; **Phase 2 (Business Settings) is in progress.** Later phases remain planned.

> Architectural guardrails apply to every phase:
> - Multi-tenant from day one — every tenant record carries `organization_id`.
> - RLS is the security boundary; the app layer only shapes UX.
> - Receipt OCR/AI produces **reviewable drafts only** — never auto-finalizes money.
> - UI stays premium, calm, mobile-first (navy/charcoal + warm wood accents).
> - `pnpm lint` and `pnpm build` must pass before a phase is "done".

---

## Phase summary

| #  | Phase                  | Status        | Depends on            |
| -- | ---------------------- | ------------- | --------------------- |
| 1  | Foundation             | ✅ Complete      | —                     |
| 2  | Business Settings      | 🚧 In progress   | 1                     |
| 3  | Customers              | Planned       | 1                     |
| 4  | Jobs                   | Planned       | 3                     |
| 5  | Files & Photos         | Planned       | 4                     |
| 6  | Expenses               | Planned       | 4                     |
| 7  | Receipts & OCR         | Planned       | 6                     |
| 8  | Estimates              | Planned       | 3, 4                  |
| 9  | Invoices               | Planned       | 4, 8                  |
| 10 | Dashboard & Reports    | Planned       | 4, 6, 8, 9            |
| 11 | PDFs & Exports         | Planned       | 8, 9                  |
| 12 | Audit & Activity Log   | Planned       | 2–9                   |
| 13 | Team Access & Roles    | Planned       | 2                     |
| 14 | Customer Portal        | Planned       | 8, 9                  |
| 15 | Stripe (Payments)      | Planned       | 9, 14                 |
| 16 | SaaS Onboarding        | Planned       | 2, 15                 |
| 17 | Platform Admin         | Planned       | 16                    |
| 18 | AI Assist              | Planned       | 7, 8                  |
| 19 | PWA & Offline          | Planned       | 10                    |
| 20 | Hardening              | Planned       | All                   |

---

## Phase 1 — Foundation ✅

**Goal:** Establish the app scaffold, multi-tenant domain model, database schema draft,
sample data, and a premium dashboard UI shell so every later phase has solid ground.

**Deliverables**

- Next.js 16 App Router + Tailwind v4 + strict TypeScript scaffold.
- `src/lib/domain.ts` — types, enums, and helpers (currency/date, job profit, invoice
  balance, dashboard summary).
- `src/lib/sample-data.ts` — realistic Flooring Folks demo data.
- `supabase/schema.sql` — tables, enums, indexes, `updated_at` triggers, RLS enable +
  membership policy examples.
- Premium responsive dashboard UI shell using sample data.
- Handoff docs: README, roadmap, route/permission map, testing checklist, `.env.example`.

**Depends on:** nothing (this is the start).

**Exit criteria**

- `pnpm lint` and `pnpm build` pass.
- Dashboard renders on mobile and desktop with populated sample data.
- Domain helpers are unit-checkable (job profit, invoice balance, dashboard summary).
- Schema draft documents every core table with `organization_id` and RLS enabled.

---

## Phase 2 — Business Settings 🚧

**Goal:** Let The Flooring Folks make the cockpit look and read like *their* business —
identity, branding, and module defaults — with editable-looking sections now and live
persistence later.

**Scope (this phase).** Phase 2 ships the **UI and form sections** for business settings.
It does **not** wire live Supabase auth or persistence yet: values are seeded from sample
data and stay demo-only until a later phase connects the database. This keeps the settings
surface real and reviewable without faking a working backend.

**Deliverables**

- Business profile — name, address, phone, email, tax rate.
- Brand — logo/brand-mark placeholder, colors & theme tokens (feed PDFs + portal later).
- Invoice defaults — terms, numbering scheme, default tax.
- Estimate defaults — notes, labor/material markup defaults.
- Workflow defaults — job statuses, line-item templates, default currency.
- Payment & expense defaults — payment methods, expense categories.
- Self-service `/settings/account` — own profile / preferences (read-mostly).
- Settings route/page shell under the `(app)` route group (see
  `docs/routes-and-permissions.md`).

**Phase 2 checklist**

- [ ] `/settings` + sub-routes render (profile, brand, invoice/estimate defaults, workflow,
      payment/expense, account).
- [ ] Each section shows editable-looking inputs pre-filled from sample org data.
- [ ] Branding tokens visibly affect the dashboard/UI shell where wired.
- [ ] Mobile layout is clean (no horizontal scroll); nav returns to the dashboard.
- [ ] UI copy is honest — no "saved"/"synced" wording that implies live persistence.
- [ ] `pnpm lint` and `pnpm build` pass.
- [ ] Browser QA: 0 console errors; desktop + mobile visual check.

**Depends on:** Phase 1.

**Exit criteria**

- All Phase 2 settings sections render on mobile and desktop with sample-backed data.
- Branding tokens are wired into at least the dashboard/UI shell.
- `pnpm lint` and `pnpm build` pass with 0 console errors.
- Docs (roadmap, routes/permissions, testing checklist) reflect Phase 2 scope.
- **No live Supabase persistence is claimed or shipped** — persistence is explicitly a
  later-phase item.

**Explicitly NOT in Phase 2:** live Supabase auth/DB writes, Stripe, OCR, and team
invites/role enforcement. Settings do not yet persist across sessions or devices.

**Next recommended phase → Phase 3 (Customers).** Customers are referenced by every job,
estimate, and invoice, so they unblock the most downstream modules. Before building
Customers, stand up a small auth/persistence prerequisite — Supabase auth (org-scoped
session) plus an `organization_settings` table with RLS — so Phase 2 settings save to real
per-org rows instead of staying demo-only. That same prerequisite makes Phase 3 immediately
useful (real customers persist) rather than stacking more sample-data-only screens.

---

## Phase 3 — Customers

**Goal:** Full customer lifecycle (not just a contact list).

**Deliverables**

- Customers list, detail, create/edit with search and filter.
- Customer 360: linked jobs, estimates, invoices, payments, files, notes.
- Address + job-site address handling (often different for flooring).
- Tags/segments (e.g., residential, commercial, referral source).

**Depends on:** 1. **Exit:** customers are first-class and referenced by all downstream modules.

---

## Phase 4 — Jobs

**Goal:** The operational core — track flooring jobs end to end.

**Deliverables**

- Jobs list (board + table views) with status pipeline
  (`lead → scheduled → in progress → completed → invoiced → paid`).
- Job detail: scope, materials (carpet, LVP, hardwood, tile), labor, square footage,
  crew, schedule, linked customer, files, expenses, estimates, invoices.
- Job profitability: revenue − materials − labor − other expenses.
- Schedule / calendar view.

**Depends on:** 3. **Exit:** jobs carry cost and revenue and feed profit reporting.

---

## Phase 5 — Files & Photos

**Goal:** Job-site evidence, before/after photos, and documents attached to records.

**Deliverables**

- Upload to Supabase Storage with thumbnails.
- Attach files to jobs, customers, estimates, invoices, expenses.
- Before/after pairing, captions, date/location stamps.
- Per-org storage isolation.

**Depends on:** 4. **Exit:** files are attachable and org-scoped in storage.

---

## Phase 6 — Expenses

**Goal:** Track job and overhead costs simply and honestly.

**Deliverables**

- Expenses list with category (materials, labor, subcontractor, tools, fuel, other),
  amount, vendor, date, linked job (optional).
- Manual entry + bulk edit.
- Expense-by-job and expense-by-category rollups.

**Depends on:** 4. **Exit:** expenses feed job profit and reports.

---

## Phase 7 — Receipts & OCR

**Goal:** Capture receipts by photo/upload and turn them into **reviewable drafts**.

**Deliverables**

- Receipt upload (photo/PDF) → Supabase Storage.
- OCR/AI extracts vendor, date, totals, line items, tax → draft expense.
- **Human review queue** — nothing is finalized without confirmation (hard rule).
- Draft → approved expense promotion with audit trail.

**Depends on:** 6. **Exit:** receipts become reviewable drafts only; approval is a manual gate.

---

## Phase 8 — Estimates

**Goal:** Turn job scope into clear, professional estimates.

**Deliverables**

- Estimates with line items (material, labor, other), quantities, unit price, markup.
- Status pipeline: `draft → sent → accepted → rejected → expired → converted`.
- Customer-facing view (later in portal) and PDF.
- Convert accepted estimate → job + invoice scaffolding.

**Depends on:** 3, 4. **Exit:** estimates are convertible into jobs and invoices.

---

## Phase 9 — Invoices

**Goal:** Bill work cleanly and track what's owed.

**Deliverables**

- Invoices from jobs/estimates with line items, tax, terms.
- Status pipeline: `draft → sent → partially paid → paid → overdue → void`.
- Payments recording, balance calculation, write-offs/credits.
- Aging view (current, 1–30, 31–60, 60+).

**Depends on:** 4, 8. **Exit:** invoice balance and aging are accurate.

---

## Phase 10 — Dashboard & Reports

**Goal:** Replace the Phase 1 sample dashboard with real numbers and add reporting.

**Deliverables**

- Live dashboard: revenue, expenses, profit, cash in, outstanding A/R, open estimates,
  receipts needing review.
- Reports: profit by job, revenue by month, expense by category, sales pipeline, tax-ready
  exports.
- Date-range and crew filters.

**Depends on:** 4, 6, 8, 9. **Exit:** dashboard and reports match domain helper calculations.

---

## Phase 11 — PDFs & Exports

**Goal:** Professional, on-brand documents and clean data exports.

**Deliverables**

- PDF estimate, invoice, receipt, statement with branding from Phase 2.
- CSV/Excel export of jobs, expenses, invoices, payments for accountant hand-off.
- Tax-ready summary export.

**Depends on:** 8, 9. **Exit:** documents render correctly and exports reconcile to totals.

---

## Phase 12 — Audit & Activity Log

**Goal:** Know who did what, especially around money.

**Deliverables**

- Append-only `activity_log` for creates/updates/deletes and status changes.
- Special logging for financial mutations (invoices, payments, expenses, approvals).
- Filterable activity feed per record and per org.

**Depends on:** 2–9. **Exit:** key actions are auditable and immutable.

---

## Phase 13 — Team Access & Roles

**Goal:** Let the owner bring on crew, managers, and a bookkeeper safely.

**Deliverables**

- Invite flow, `organization_members` with roles (owner, admin, manager, member,
  bookkeeper).
- Route-level + action-level permission checks consistent with
  `docs/routes-and-permissions.md`.
- Per-member scoping (e.g., member sees only assigned jobs).

**Depends on:** 2. **Exit:** RBAC is enforced in app and verified against RLS.

---

## Phase 14 — Customer Portal

**Goal:** Let customers view and accept estimates, view invoices, and pay — no login friction.

**Deliverables**

- Magic-link / signed-token portal scoped to one customer.
- View estimate → accept/reject; view invoice → pay; view shared documents/photos.

**Depends on:** 8, 9. **Exit:** customers can act on their own estimates/invoices.

---

## Phase 15 — Stripe (Payments + Subscriptions)

**Goal:** Collect invoice payments and (later) bill SaaS tenants.

**Deliverables**

- Stripe payment intents on invoices via portal; webhook handling with idempotency.
- Payment method save/reuse.
- (SaaS) subscription billing for tenant plans.

**Depends on:** 9, 14. **Exit:** payments reconcile to invoice balances; webhooks are safe.

---

## Phase 16 — SaaS Onboarding

**Goal:** Turn the single-tenant tool into sign-up-and-go multi-tenant SaaS.

**Deliverables**

- Public signup → create organization → owner onboarding wizard.
- Plan selection + Stripe checkout; trial handling.
- Per-org isolation verified across all tables and storage.

**Depends on:** 2, 15. **Exit:** a brand-new org is fully isolated and functional.

---

## Phase 17 — Platform Admin

**Goal:** Internal tools to support tenants safely.

**Deliverables**

- Platform admin view of organizations, members, usage.
- **Scoped support access** via time-boxed `support_access_grants` (consented, logged,
  revocable) — never blanket service-role access to live data.

**Depends on:** 16. **Exit:** support access is auditable and bounded.

---

## Phase 18 — AI Assist

**Goal:** Reduce manual work with AI that always defers to a human.

**Deliverables**

- Smarter receipt OCR + auto-categorization (still draft-only).
- Estimate line suggestions from job scope/materials.
- Anomaly flags (e.g., expense out of pattern).

**Depends on:** 7, 8. **Exit:** AI proposes; humans approve; nothing auto-finalizes.

---

## Phase 19 — PWA & Offline

**Goal:** Usable on a phone at a job site with flaky signal.

**Deliverables**

- Installable PWA, offline-tolerant caching, background sync for uploads/receipts.
- Fast mobile capture flow (photo → draft).

**Depends on:** 10. **Exit:** core flows work offline and sync when reconnected.

---

## Phase 20 — Hardening

**Goal:** Production-grade security, reliability, and recoverability.

**Deliverables**

- Full RLS audit + policy tests per table.
- Rate limiting, input validation, CSRF/replay protection, secrets hygiene.
- Backups, restore drill, uptime/observability, error monitoring.
- Pen-test / security review pass.

**Depends on:** all. **Exit:** security review passes; backups restore cleanly.
