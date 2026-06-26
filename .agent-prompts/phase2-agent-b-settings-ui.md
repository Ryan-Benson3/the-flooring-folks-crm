You are Agent B working under Pike on The Flooring Folks CRM. Your lane is Phase 2 business settings UI ONLY.

Read AGENTS.md, README.md, docs/CRM-Dashboard-handoff.md, src/app/page.tsx, src/components/dashboard/*, src/lib/sample-data.ts.

Goal: create a polished, premium, mobile-friendly Settings page that looks like an editable business customization cockpit, but can use static/sample data for Phase 2.

Allowed files:
- src/app/settings/page.tsx
- src/components/settings/**
- src/components/dashboard/nav-items.ts (only href/active handling if necessary)
- src/components/dashboard/sidebar-nav.tsx (only if needed for active link)
- src/components/dashboard/mobile-nav.tsx (only if needed for active link)
- src/components/dashboard/top-bar.tsx (only if needed)

Forbidden files:
- src/lib/domain.ts
- src/lib/sample-data.ts
- supabase/schema.sql
- package files

Requirements:
1. Add /settings route using the existing DashboardShell.
2. Page sections: business profile, brand appearance, estimate/invoice defaults, workflow defaults, payment/expense defaults, support/admin access note.
3. It should look editable with form controls/cards/toggles/chips, but no persistence needed yet.
4. Use plain language and “old lady test” labels.
5. Keep visuals premium and consistent with existing dashboard: dark navy, warm wood accents, clean cards, no cheap SaaS blue.
6. Make desktop and mobile layout sane.
7. Avoid actual client interactivity unless necessary; prefer server components/static fields.

Run no destructive commands. When done, summarize changed files and any assumptions.
