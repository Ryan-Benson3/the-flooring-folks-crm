# CRM Dashboard — Handoff Checkpoint

Saved: 2026-06-26 08:21 CDT
Project: The Flooring Folks CRM / CRM Dashboard
Path: `/home/ryan-benson/Documents/Projects/the-flooring-folks-crm`
Git checkpoint before this handoff: `12591d4 Build phase 1 CRM foundation`

## Current status

Phase 1 foundation is complete and locally verified.

Built:

- Next.js 16 + TypeScript + Tailwind v4 scaffold.
- Premium dashboard UI shell for The Flooring Folks.
- Contractor CRM dashboard sections:
  - key metrics
  - quick actions
  - job profitability
  - recent jobs
  - open estimates
  - unpaid invoices
  - receipts to review
  - expenses by category
- Server-safe domain model in `src/lib/domain.ts`.
- Realistic sample data in `src/lib/sample-data.ts`.
- Supabase schema draft in `supabase/schema.sql`.
- Project docs:
  - `README.md`
  - `docs/build-roadmap.md`
  - `docs/routes-and-permissions.md`
  - `docs/testing-checklist.md`
- Local `.env.example` with placeholders only.
- Project rules in `AGENTS.md` / `CLAUDE.md`.

## Verification already run

- `pnpm lint` passed.
- `pnpm build` passed.
- Browser loaded at `http://127.0.0.1:3100`.
- Browser console showed 0 JS errors.
- Visual check passed for Phase 1 dashboard polish.

## Important GLM / Hermes setup context

Pike/default is configured for:

- Main Pike model: `openai-codex / gpt-5.5`.
- Delegation/subagents: `zai / glm-5.2`.
- Delegation reasoning effort: `max`.
- Global fallbacks: `zai / glm-5.1`, then `zai / glm-5`.
- Direct wrapper: `~/.hermes/scripts/glm-subagent.sh`.
  - Tries `glm-5.2 -> glm-5.1 -> glm-5`.
  - Uses Pi CLI `--thinking xhigh`, because Pi accepts `xhigh` as the highest CLI level, not the word `max`.

After gateway restart, built-in Hermes delegation should pick up the updated config.

## Known caveat from Phase 1

Direct `pi --provider zai --model glm-5.2` prints:

`Warning: Model "glm-5.2" not found for provider "zai". Using custom model id.`

But sanity tests succeeded. The wrapper treats real model/access errors as failures and falls back automatically.

Some first-wave GLM subagents wrote usable files but hung instead of exiting. Pike inspected, patched, verified, and committed the usable work manually.

## Restart instruction

Ryan planned to restart the default gateway after this checkpoint.

From a separate terminal, run:

`systemctl --user restart hermes-gateway.service`

Do not run gateway restart from inside Telegram; Hermes blocks that because it would kill the running command mid-session.

## Next recommended phase

Phase 2: Business settings + customization system.

Build editable organization settings for:

- business name
- logo/brand mark placeholder
- colors/theme tokens
- phone/email/address
- invoice terms
- estimate notes
- expense categories
- job statuses
- payment methods
- line item templates

Recommended Phase 2 implementation path:

1. Add settings domain types and sample organization settings.
2. Add settings route/page shell.
3. Add editable-looking form sections first; wire persistence later after Supabase auth is active.
4. Keep dashboard reading from settings-backed organization data where practical.
5. Verify with `pnpm lint`, `pnpm build`, browser QA, and visual inspection.
6. Commit a local Phase 2 checkpoint.

## Quick resume commands

```bash
cd /home/ryan-benson/Documents/Projects/the-flooring-folks-crm
pnpm install
pnpm dev
```

Verification commands:

```bash
pnpm lint
pnpm build
```
