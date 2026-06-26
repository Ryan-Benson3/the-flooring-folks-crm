You are Agent A working under Pike on The Flooring Folks CRM. Your lane is Phase 2 business settings/customization data model and schema ONLY.

Read AGENTS.md, README.md, docs/CRM-Dashboard-handoff.md, src/lib/domain.ts, src/lib/sample-data.ts, supabase/schema.sql.

Goal: add a practical organization-scoped settings/customization foundation for a contractor CRM/SaaS.

Allowed files:
- src/lib/domain.ts
- src/lib/sample-data.ts
- supabase/schema.sql
- docs/routes-and-permissions.md
- docs/build-roadmap.md

Forbidden files:
- Any src/components/** UI file
- src/app/** route/page/layout files
- package files

Requirements:
1. Expand BusinessSettings so it covers: legal/display name, contact info, address fields, website, logo/brand mark placeholder, brand colors, invoice terms, estimate notes, default tax rate, invoice/estimate numbering, expense categories, job statuses, payment methods, line item templates.
2. Keep every tenant-owned record organization-scoped.
3. Add sample settings for The Flooring Folks in sample data.
4. Add helper exports if useful for displaying settings cleanly.
5. Update Supabase schema with organization_settings and any child/template tables you think are necessary, but keep it sane for Phase 2.
6. Keep OCR guardrail intact: receipt/AI never finalizes money.
7. Do not overbuild billing/subscriptions yet.

Run no destructive commands. When done, summarize changed files and any assumptions.
