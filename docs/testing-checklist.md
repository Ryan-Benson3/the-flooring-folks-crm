# Testing Checklist

Phase 1 has no automated test framework wired yet, so verification is a mix of CLI gates,
manual calculation checks, and visual QA. As modules land, the "Future" sections become
active work. Run the relevant items before calling any phase done.

---

## 1. CLI gates (every change)

- [ ] `pnpm lint` passes with no errors.
- [ ] `pnpm build` completes with no type errors.
- [ ] No stray `console.log` / `any` / `@ts-ignore` introduced without justification.
- [ ] No secrets committed (`.env*` is gitignored; only `.env.example` placeholders).

> AGENTS.md rule: run `pnpm lint` **and** `pnpm build` before claiming done.

---

## 2. Domain calculation checks

These exercise the pure helpers in `src/lib/domain.ts` against known sample-data inputs.
In Phase 1 these can be run as a scratch script or asserted by hand; later, port to unit tests.

### Currency & dates
- [ ] Currency formats as USD with 2 decimals, no floating artifacts (use integer cents or
      safe rounding — never raw float math for money).
- [ ] Dates render in the org's timezone, not server UTC drift.

### Job profit
- [ ] `jobProfit = jobRevenue − materials − labor − otherExpenses`.
- [ ] A job with $0 expenses but revenue shows full revenue as profit.
- [ ] A job whose expenses exceed revenue shows a **negative** profit (not hidden/clamped to 0).
- [ ] Expenses without a linked job are **excluded** from job profit (they're overhead).

### Invoice balance
- [ ] `invoiceBalance = total − sum(payments) − credits + writeOffs` (signs correct).
- [ ] Partial payment yields a correct remaining balance and `partially paid` status.
- [ ] Overpayment does not produce a negative balance bug; handle as credit/rounding per policy.
- [ ] Voided invoices contribute $0 to A/R and reports.

### Dashboard summary
- [ ] Revenue = sum of paid + invoiced (per defined window); matches reports.
- [ ] Outstanding A/R = sum of unpaid invoice balances; matches aging buckets.
- [ ] Open estimates total and count match the estimates list filtered to non-final statuses.
- [ ] "Receipts needing review" count matches the review queue length.
- [ ] Totals in cards reconcile to the underlying lists (no double-count across jobs).

---

## 3. Multi-tenant & RLS expectations

RLS is the security boundary. These must hold once Supabase is wired (validate in Phase 2+):

- [ ] Every tenant-owned table has an `organization_id` column + index.
- [ ] RLS is **enabled** on every tenant-owned table.
- [ ] Policies require `organization_id` membership via `organization_members`.
- [ ] A user in Org A cannot read or write Org B rows (positive **and** negative test).
- [ ] Storage buckets are org-scoped; a signed URL from Org A cannot fetch Org B files.
- [ ] `service_role` is server-only and never shipped to the browser
      (`SUPABASE_SERVICE_ROLE_KEY` is not `NEXT_PUBLIC_`).
- [ ] Portal tokens and support grants cannot escalate to broader org access.
- [ ] Anonymous (no session) requests return empty/401 for every protected route.

---

## 4. OCR / receipt draft-only behavior

The hard product rule: **OCR/AI never finalizes a financial record.**

- [ ] A receipt upload produces a **draft** expense, never an approved one.
- [ ] Drafts are isolated from reports, profit, and A/R until approved.
- [ ] Approval is an explicit human action and is recorded in `activity_log`.
- [ ] Rejecting a draft leaves no financial side effect.
- [ ] Editing OCR-suggested fields before approval persists the corrections.

---

## 5. Mobile & visual QA

The UI must feel premium and calm, not like a starter template.

### Responsive breakpoints
- [ ] Works at 360px (small phone), 390px, 768px (tablet), 1024px, 1440px.
- [ ] Sidebar collapses to a drawer/bottom nav on mobile; no horizontal scroll.
- [ ] Tap targets ≥ 44px; no hover-only actions on touch.
- [ ] Tables become cards or scroll horizontally without breaking layout.

### Visual quality
- [ ] Dark navy/charcoal base with warm flooring/wood accents — **no** generic SaaS blue.
- [ ] Consistent spacing scale, type hierarchy, and contrast (WCAG AA text).
- [ ] Currency/numbers right-aligned and tabular where it matters.
- [ ] Empty states and loading skeletons exist (no blank holes or raw spinners-only).
- [ ] Status pills (job/estimate/invoice) are color-coded and legible in light + dark.

### Browser checks
- [ ] Chrome, Safari (iOS), and Firefox render correctly.
- [ ] Fonts load via `next/font` with no layout shift.

---

## 6. Accessibility basics

- [ ] Semantic HTML (`nav`, `main`, `section`, headings in order).
- [ ] All interactive elements keyboard-reachable with visible focus rings.
- [ ] Form fields have associated labels; errors are announced.
- [ ] Color is not the only signal for status (icon + text too).
- [ ] Images and icon-only buttons have alt/`aria-label`.

---

## 7. Exports & documents (when implemented)

- [ ] CSV/Excel export row count and totals reconcile to the on-screen list.
- [ ] Estimate/invoice PDF totals match the record exactly.
- [ ] PDFs embed org branding from business settings.
- [ ] Date-range filters apply identically to screen, export, and PDF.

---

## 8. Future E2E flows (Playwright, added in later phases)

Skeleton scenarios to automate once the modules exist:

- [ ] **Onboarding (SaaS):** sign up → create org → land on empty dashboard.
- [ ] **Customer → job → invoice → payment:** create customer, job, estimate, convert to
      invoice, pay via Stripe, confirm balance $0 and profit updated.
- [ ] **Receipt to expense:** upload receipt → OCR draft appears in review queue → approve →
      expense appears on job and reports; reject path leaves no trace in totals.
- [ ] **Permissions:** member sees only assigned jobs; bookkeeper can export but not edit jobs;
      customer portal token can only view/pay their own invoice.
- [ ] **Cross-tenant isolation:** Org A user cannot reach Org B data via direct URL or API.
- [ ] **Offline (PWA):** capture a receipt photo offline → syncs when reconnected.

---

## 9. Manual smoke per module (Phase 1 dashboard)

Using sample data, confirm the dashboard shell:

- [ ] Revenue / expense / profit cards show plausible, mutually consistent numbers.
- [ ] Open estimates list and total render.
- [ ] Unpaid invoices + total A/R render.
- [ ] Receipts needing review queue renders with a clear "review" path.
- [ ] Job profitability preview shows top jobs with correct sign.
- [ ] Recent jobs list renders with status pills.
- [ ] Expense category visual sums to the expense total.
- [ ] Quick actions link to plausible targets.
- [ ] No console errors on load (dev tools).

## 10. Phase 2 — Settings manual QA

Settings is UI-only in Phase 2 (no live persistence). Verify it looks premium, works on
every breakpoint, and makes honest claims.

### Route & section coverage
- [ ] `/settings` renders the business-profile section (name, address, phone, email, tax rate).
- [ ] `/settings/branding` renders brand-mark placeholder + color/theme token controls.
- [ ] `/settings/invoice-defaults` renders terms, numbering scheme, default tax.
- [ ] `/settings/estimate-defaults` renders notes + labor/material markup defaults.
- [ ] `/settings/workflow` renders job statuses, line-item templates, default currency.
- [ ] `/settings/payment-expense` renders payment methods + expense categories.
- [ ] `/settings/account` renders the signed-in user's own profile/preferences.

### Editable-looking behavior
- [ ] Inputs are pre-filled from sample org data (no empty-looking forms).
- [ ] Controls look interactive (focus rings, hover) but are clearly demo state.
- [ ] UI copy is honest — no "saved"/"synced" claims that imply live persistence.

### Branding propagation
- [ ] Brand color/logo tokens visibly affect the dashboard/UI shell where wired.
- [ ] Falling back to defaults does not break layout or contrast.

### Responsive & visual QA
- [ ] Desktop (1024px, 1440px): settings layout, spacing, and hierarchy look premium.
- [ ] Tablet (768px): sections stack cleanly.
- [ ] Mobile (360px, 390px): no horizontal scroll; tap targets ≥ 44px; nav back to dashboard.
- [ ] Premium navy/charcoal + warm wood palette — no generic SaaS blue.

### Browser & build
- [ ] Chrome, Safari (iOS), and Firefox render correctly.
- [ ] DevTools console shows **0 errors** on load and when toggling sections.
- [ ] `pnpm lint` passes; `pnpm build` completes with no type errors.
