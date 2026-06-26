# Routes & Permissions

Planned App Router routes for The Flooring Folks CRM and which roles can access each.
This is the **target map** used during build; not every route exists yet (Phase 1 is
Foundation). Route enforcement in the app must always be backed by **Row-Level Security
(RLS)** in Postgres — the app checks are UX, the database is the security boundary.

> Convention: tenant-owned app routes live under `(app)` route group and require an
> authenticated, org-scoped session. Every tenant query filters by `organization_id`.

---

## Roles

| Role            | Who                                                       | Scope                                                       |
| --------------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| `owner`         | Business owner                                            | Everything incl. billing, team, deletion, plan              |
| `admin`         | Trusted manager / partner                                 | All operations; no SaaS billing/plan cancellation           |
| `manager`       | Crew lead / office manager                                | Jobs, customers, estimates, invoices, scheduling            |
| `member`        | Installer / crew / technician                             | Assigned jobs, log expenses, upload photos, view customers  |
| `bookkeeper`    | Accountant / bookkeeper                                   | Expenses, receipts, invoices, reports, exports (read-mostly)|
| `customer`      | Customer (portal only)                                    | Own estimates, invoices, documents, payments                |
| `platform_admin`| SaaS operator (support)                                   | Cross-tenant support via time-boxed, consented grants only  |

Access key: ✓ = allowed · — = denied · (✓) = allowed only within assigned scope/records.

---

## Auth & public

| Route             | Purpose                       | owner | admin | manager | member | bookkeeper | customer | platform |
| ----------------- | ----------------------------- | :---: | :---: | :-----: | :----: | :--------: | :------: | :------: |
| `/login`          | Sign in / magic link          |   ✓   |   ✓   |    ✓    |   ✓    |     ✓      |    —     |    ✓     |
| `/auth/callback`  | OAuth / magic-link callback   |   ✓   |   ✓   |    ✓    |   ✓    |     ✓      |    —     |    ✓     |
| `/invite/[token]` | Accept team invite            |   ✓   |   ✓   |    ✓    |   ✓    |     ✓      |    —     |    —     |

---

## App — Dashboard & core

| Route        | Purpose                                  | owner | admin | manager | member | bookkeeper |
| ------------ | ---------------------------------------- | :---: | :---: | :-----: | :----: | :--------: |
| `/dashboard` | KPIs, open estimates, unpaid invoices    |   ✓   |   ✓   |    ✓    | (✓)    |     ✓      |
| `/activity`  | Audit / activity feed                    |   ✓   |   ✓   |    —    |   —    |     ✓      |

---

## App — Customers

| Route              | Purpose            | owner | admin | manager | member | bookkeeper |
| ------------------ | ------------------ | :---: | :---: | :-----: | :----: | :--------: |
| `/customers`       | List / search      |   ✓   |   ✓   |    ✓    | (✓)    |     ✓      |
| `/customers/new`   | Create customer    |   ✓   |   ✓   |    ✓    |   —    |     —      |
| `/customers/[id]`  | Detail / 360       |   ✓   |   ✓   |    ✓    | (✓)    |     ✓      |
| `/customers/[id]/edit` | Edit           |   ✓   |   ✓   |    ✓    |   —    |     —      |

---

## App — Jobs

| Route                       | Purpose                     | owner | admin | manager | member | bookkeeper |
| --------------------------- | --------------------------- | :---: | :---: | :-----: | :----: | :--------: |
| `/jobs`                     | List / board / calendar     |   ✓   |   ✓   |    ✓    | (✓)    |     ✓      |
| `/jobs/new`                 | Create job                  |   ✓   |   ✓   |    ✓    |   —    |     —      |
| `/jobs/[id]`                | Detail, scope, profit       |   ✓   |   ✓   |    ✓    | (✓)    |     ✓      |
| `/jobs/[id]/edit`           | Edit job                    |   ✓   |   ✓   |    ✓    |   —    |     —      |
| `/jobs/[id]/expenses`       | Job expenses                |   ✓   |   ✓   |    ✓    | (✓)    |     ✓      |
| `/jobs/[id]/files`          | Job files/photos            |   ✓   |   ✓   |    ✓    | (✓)    |     —      |

---

## App — Estimates

| Route                       | Purpose            | owner | admin | manager | member | bookkeeper |
| --------------------------- | ------------------ | :---: | :---: | :-----: | :----: | :--------: |
| `/estimates`                | List               |   ✓   |   ✓   |    ✓    |   —    |     ✓      |
| `/estimates/new`            | Create             |   ✓   |   ✓   |    ✓    |   —    |     —      |
| `/estimates/[id]`           | View               |   ✓   |   ✓   |    ✓    | (✓)    |     ✓      |
| `/estimates/[id]/edit`      | Edit (draft only)  |   ✓   |   ✓   |    ✓    |   —    |     —      |
| `/estimates/[id]/pdf`       | Download PDF       |   ✓   |   ✓   |    ✓    |   —    |     ✓      |

---

## App — Invoices

| Route                       | Purpose            | owner | admin | manager | member | bookkeeper |
| --------------------------- | ------------------ | :---: | :---: | :-----: | :----: | :--------: |
| `/invoices`                 | List / aging       |   ✓   |   ✓   |    ✓    |   —    |     ✓      |
| `/invoices/new`             | Create             |   ✓   |   ✓   |    ✓    |   —    |     —      |
| `/invoices/[id]`            | View               |   ✓   |   ✓   |    ✓    |   —    |     ✓      |
| `/invoices/[id]/edit`       | Edit (draft only)  |   ✓   |   ✓   |    ✓    |   —    |     —      |
| `/invoices/[id]/pdf`        | Download PDF       |   ✓   |   ✓   |    ✓    |   —    |     ✓      |

---

## App — Expenses & Receipts

| Route                | Purpose                              | owner | admin | manager | member | bookkeeper |
| -------------------- | ------------------------------------ | :---: | :---: | :-----: | :----: | :--------: |
| `/expenses`          | List / categorize                    |   ✓   |   ✓   |    ✓    | (✓)    |     ✓      |
| `/expenses/new`      | Create expense                       |   ✓   |   ✓   |    ✓    | (✓)    |     —      |
| `/receipts`          | Review queue (OCR drafts)            |   ✓   |   ✓   |    ✓    |   —    |     ✓      |
| `/receipts/[id]`     | Review & approve/reject draft        |   ✓   |   ✓   |    ✓    |   —    |     ✓      |

> **Hard rule:** `/receipts/[id]` only ever promotes a draft to an expense after explicit
> human approval. OCR/AI never finalizes a financial record on its own.

---

## App — Files & Reports

| Route             | Purpose                | owner | admin | manager | member | bookkeeper |
| ----------------- | ---------------------- | :---: | :---: | :-----: | :----: | :--------: |
| `/files`          | Browse all files       |   ✓   |   ✓   |    ✓    | (✓)    |     —      |
| `/reports`        | Profit, revenue, taxes |   ✓   |   ✓   |    —    |   —    |     ✓      |
| `/reports/export` | CSV/Excel downloads    |   ✓   |   ✓   |    —    |   —    |     ✓      |

---

## App — Settings

`/settings` is the business-settings hub. In Phase 2 it surfaces an **editable-looking**
business profile, branding, and module defaults so the cockpit reads like *The Flooring
Folks'* own. Phase 2 ships the **form sections only** — values are seeded from sample data
and **persistence is wired in a later phase** once Supabase auth is active (see
`docs/build-roadmap.md`). Editing is restricted to org owners/admins; everyone else is
denied except their own `/settings/account`.

> Convention: `/settings` and its sub-routes live under the `(app)` route group and require
> an authenticated, org-scoped session. Every tenant query filters by `organization_id`.

### Business settings (Phase 2)

| Route                            | Purpose                                              | owner | admin | manager | member | bookkeeper |
| -------------------------------- | ---------------------------------------------------- | :---: | :---: | :-----: | :----: | :--------: |
| `/settings`                      | Business profile (name, address, phone, email, tax rate) |   ✓   |   ✓   |    —    |   —    |     —      |
| `/settings/branding`             | Brand mark/logo placeholder, colors & theme tokens   |   ✓   |   ✓   |    —    |   —    |     —      |
| `/settings/invoice-defaults`     | Invoice terms, numbering scheme, default tax         |   ✓   |   ✓   |    —    |   —    |     —      |
| `/settings/estimate-defaults`    | Estimate notes, labor/material markup defaults       |   ✓   |   ✓   |    —    |   —    |     —      |
| `/settings/workflow`             | Job statuses, line-item templates, default currency  |   ✓   |   ✓   |    —    |   —    |     —      |
| `/settings/payment-expense`      | Payment methods, expense categories                  |   ✓   |   ✓   |    —    |   —    |     —      |

> Phase 2 = editable-looking sections only; **not yet persisted to Supabase.** Branding
> tokens feed PDFs and the customer portal once those phases land.

### Admin settings (later phases)

| Route                          | Purpose                          | owner | admin | manager | member | bookkeeper | Phase |
| ------------------------------ | -------------------------------- | :---: | :---: | :-----: | :----: | :--------: | :---: |
| `/settings/team`               | Members & invites                |   ✓   |   ✓   |    —    |   —    |     —      |  13   |
| `/settings/roles`              | Role assignments                 |   ✓   |   —   |    —    |   —    |     —      |  13   |
| `/settings/integrations`       | Stripe, OCR/AI connections       |   ✓   |   —   |    —    |   —    |     —      | 15/18 |
| `/settings/billing`            | SaaS plan & invoices (tenant)    |   ✓   |   —   |    —    |   —    |     —      |  16   |
| `/settings/account`            | Own profile / preferences        |   ✓   |   ✓   |    ✓    |   ✓    |     ✓      |  2*   |

> Note: `/settings/account` (own profile/preferences) is read-mostly and open to every
> signed-in user. Self-service edits (display name, avatar) can ship in Phase 2 as a
> low-risk editable-looking section; password/auth changes follow auth wiring.

---

## Customer portal (scoped to one customer)

| Route                    | Purpose                          | customer |
| ------------------------ | -------------------------------- | :------: |
| `/portal/[token]`        | Landing for a signed-token link  |    ✓     |
| `/portal/[token]/estimates/[id]` | View / accept / reject     |    ✓     |
| `/portal/[token]/invoices/[id]`  | View / pay                 |    ✓     |
| `/portal/[token]/files`         | Shared documents/photos    |    ✓     |

> Portal uses signed, expiring tokens (or magic link). A customer can see **only** their
> own records. Payment routes hand off to Stripe; no card data touches our servers.

---

## Platform admin (SaaS operator)

| Route                            | Purpose                                  | platform |
| -------------------------------- | ---------------------------------------- | :------: |
| `/admin`                         | Orgs overview, usage                     |    ✓     |
| `/admin/orgs/[id]`               | Tenant detail                            |    ✓     |
| `/admin/support/grants`          | Active/revoked support access grants     |    ✓     |
| `/admin/support/grants/new`      | Open a time-boxed, consented support session |  ✓    |

> **Support access** is never a blanket service-role key into live data. It uses
> `support_access_grants`: consented, time-boxed, fully logged in `activity_log`, and
> revocable.

---

## Enforcement model

1. **App layer (UX):** middleware + server components check the session's role and
   `organization_id`; redirect unauthorized requests.
2. **Data layer (security):** Postgres RLS policies enforce the same rules per row using
   `organization_id` membership and (for members) assignment join tables. This is the
   boundary that actually protects data.
3. **Financial safety:** receipt drafts, voiding, and deletions require elevated roles and
   are always written to `activity_log`.
4. **Portal & support:** least-privilege, token-scoped, and time-boxed respectively — no
   standing broad access.
