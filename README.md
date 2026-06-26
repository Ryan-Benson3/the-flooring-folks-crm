# The Flooring Folks CRM

A premium contractor business cockpit for **The Flooring Folks**, built first as a
single-tenant operations tool and architected to become a multi-tenant SaaS later.

It is **not** a QuickBooks clone. The focus is job operations, customers, estimates,
invoices, expenses/receipts, files/photos, simple profit visibility, and clean exports —
the day-to-day cockpit a flooring crew actually opens every morning.

> **Status:** Phase 1 — Foundation. The app scaffold, multi-tenant domain model,
> database schema draft, sample data, and a premium dashboard UI shell are in progress.
> See [`docs/build-roadmap.md`](docs/build-roadmap.md) for the full plan.

---

## Stack

| Concern        | Choice                                              |
| -------------- | --------------------------------------------------- |
| Framework      | [Next.js 16](https://nextjs.org) (App Router)       |
| UI             | React 19, [Tailwind CSS v4](https://tailwindcss.com) |
| Language       | TypeScript (strict)                                 |
| Backend / DB   | Supabase (Postgres + Auth + Storage + RLS) — planned |
| Payments       | Stripe (invoices + SaaS subscriptions) — planned    |
| Receipt OCR/AI | Vendor-agnostic, drafts only — planned              |
| Package mgr    | pnpm                                                |
| Node           | 20+                                                 |

Server-safe plain TypeScript models and helpers live in `src/lib`. UI components live
under `src/components`. Database SQL lives under `supabase/`. All long-form docs live
under `docs/`.

---

## Project structure

```
src/
  app/              # Next.js App Router routes & layouts
    layout.tsx      # root layout (fonts, html shell)
    page.tsx        # dashboard / landing
    globals.css     # Tailwind v4 theme tokens
  components/       # small reusable UI components
  lib/              # server-safe domain models, helpers, sample data
docs/               # roadmap, route/permission map, testing checklist
supabase/           # schema.sql and migrations
public/             # static assets
```

---

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 10+ (`npm i -g pnpm`)
- A local `.env` file (copy from `.env.example`). **Phase 1 runs without secrets** —
  Supabase/Stripe/OCR keys are only needed once those phases are wired.

### Install & run

```bash
pnpm install        # install dependencies
cp .env.example .env # add your local values (optional for Phase 1 UI)
pnpm dev            # start the dev server at http://localhost:3000
```

### Scripts

| Command        | Description                                  |
| -------------- | -------------------------------------------- |
| `pnpm dev`     | Start the Next.js dev server                 |
| `pnpm build`   | Production build (run before claiming done)  |
| `pnpm start`   | Serve the production build                   |
| `pnpm lint`    | ESLint (Next + TypeScript) — run before done |

---

## Phase 1 scope (Foundation)

Phase 1 establishes the foundation everything else builds on. It does **not** yet wire
live Supabase auth, Stripe, or OCR.

- **App scaffold** — Next.js 16 App Router, Tailwind v4, strict TypeScript.
- **Multi-tenant domain model** (`src/lib/domain.ts`) — TypeScript types/enums for
  organizations, customers, jobs, expenses, receipts, estimates, invoices, payments,
  files, and helpers for currency/date formatting, job profit, invoice balance, and
  dashboard summary.
- **Sample data** (`src/lib/sample-data.ts`) — realistic Flooring Folks demo records so
  the UI is populated and calculations can be exercised.
- **Database schema draft** (`supabase/schema.sql`) — tables, enums, indexes, `updated_at`
  triggers, RLS enable + membership-based policy examples.
- **Premium dashboard UI shell** — responsive contractor cockpit: revenue/expense/profit
  cards, open estimates, unpaid invoices, receipts needing review, job profitability,
  recent jobs, expense category visual, quick actions.
- **Handoff docs** — this README, roadmap, route/permission map, testing checklist, env template.

**Out of scope for Phase 1:** live auth, real DB connection, payments, OCR, customer
portal, SaaS onboarding. Those are later phases.

---

## Architecture principles

1. **Multi-tenant from day one.** Every tenant-owned record carries
   `organizationId` / `organization_id`. Row-Level Security (RLS) is the source of truth
   for access — the app layer is a convenience, never the security boundary.
2. **Receipt OCR/AI creates reviewable drafts only.** It never silently finalizes a
   financial record. A human reviews and confirms.
3. **Premium, calm, mobile-first UI.** Dark navy/charcoal with warm flooring/wood
   accents — not generic SaaS blue. Easy to use on a phone at a job site.
4. **Server-safe, small, reusable code.** Plain TypeScript models in `src/lib`;
   components stay small and composable.
5. **Job operations over accounting.** No double-entry ledger. Simple, honest profit
   visibility and clean exports.

---

## Documentation

- [`docs/build-roadmap.md`](docs/build-roadmap.md) — phased build plan (Foundation → Hardening)
- [`docs/routes-and-permissions.md`](docs/routes-and-permissions.md) — planned routes and role access
- [`docs/testing-checklist.md`](docs/testing-checklist.md) — lint/build, RLS, calculations, visual QA
- [`docs/phase-1-foundation.md`](docs/phase-1-foundation.md) — Phase 1 data architecture detail
- [`.env.example`](.env.example) — environment variable template (no real secrets)

---

## License

Proprietary. © The Flooring Folks.
