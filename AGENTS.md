<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: The Flooring Folks CRM

Build this as a premium contractor business cockpit for The Flooring Folks first, architected for multi-tenant SaaS later.

## Product rules
- Core modules: dashboard, customers, jobs, expenses/receipts, estimates, invoices, files/photos, reports, business settings, roles.
- Do not build a QuickBooks clone or full accounting ledger. Focus on job operations, receipts, expenses, simple profit visibility, and clean exports.
- Every tenant-owned data model must include `organizationId` / `organization_id` in TypeScript/docs/schema.
- Receipt OCR/AI must create reviewable drafts only; never silently finalize financial records.
- UI should feel premium, calm, mobile-friendly, and hard to mess up. Avoid generic starter-template visuals.

## Tech rules
- Next.js App Router, TypeScript, Tailwind CSS v4.
- Prefer server-safe plain TypeScript models/helpers in `src/lib`.
- Keep components reusable and small.
- Run `pnpm lint` and `pnpm build` before claiming done.
- If adding docs/schema, put them under `docs/` or `supabase/`.
