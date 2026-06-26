-- =============================================================================
-- The Flooring Folks CRM — Phase 1 database foundation
-- Target: PostgreSQL 15+ (Supabase). Multi-tenant from day one.
--
-- Money is stored as integer minor units (*_cents BIGINT) to avoid floating
-- point drift and to stay 1:1 with the TypeScript domain in src/lib/domain.ts.
--
-- Every tenant-owned table carries `organization_id` (denormalized onto child
-- rows like line items and payments) so Row-Level Security can be expressed as
-- a single uniform membership check rather than joins that fight recursion.
--
-- This is a foundation draft: it defines structure + baseline RLS. No secrets,
-- no service-role keys, no production data.
-- =============================================================================

-- Required extensions ---------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- =============================================================================
-- Enums
-- =============================================================================

create type org_role as enum ('owner', 'admin', 'member', 'bookkeeper');

create type job_status as enum (
  'lead', 'scheduled', 'in_progress', 'completed', 'on_hold', 'cancelled'
);

create type estimate_status as enum (
  'draft', 'sent', 'accepted', 'declined', 'expired'
);

create type invoice_status as enum (
  'draft', 'sent', 'paid', 'partial', 'overdue', 'void'
);

create type payment_method as enum (
  'cash', 'check', 'card', 'ach', 'transfer', 'other'
);

create type expense_category as enum (
  'materials', 'labor', 'subcontractor', 'equipment',
  'fuel', 'supplies', 'software', 'other'
);

create type expense_status as enum ('draft', 'reviewed', 'approved');

-- Receipts are AI/OCR drafts: a human must promote them to an expense.
create type receipt_review_status as enum (
  'pending_review', 'reviewed', 'needs_edits', 'rejected'
);

create type file_kind as enum (
  'photo', 'document', 'contract', 'receipt', 'invoice', 'other'
);

create type support_grant_status as enum ('active', 'revoked', 'expired');

-- =============================================================================
-- Identity / tenancy spine
-- =============================================================================

-- Supabase Auth owns auth.users. profiles extends it with display info and is
-- the join target for organization membership.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  first_name  text,
  last_name   text,
  email       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  timezone    text not null default 'America/New_York',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.organization_members (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  role            org_role not null default 'member',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (organization_id, profile_id)
);

-- One row per organization.
create table if not exists public.business_settings (
  organization_id     uuid primary key references public.organizations(id) on delete cascade,
  currency            text not null default 'USD',
  tax_rate_pct        numeric(5,2) not null default 0,
  invoice_prefix      text not null default 'INV',
  invoice_next_number integer not null default 1001,
  estimate_prefix     text not null default 'EST',
  estimate_next_number integer not null default 1001,
  legal_name          text,
  address             text,
  phone               text,
  email               text,
  brand_color         text,
  updated_at          timestamptz not null default now()
);

-- =============================================================================
-- Customers & jobs
-- =============================================================================

create table if not exists public.customers (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  first_name      text not null,
  last_name       text not null,
  email           text,
  phone           text,
  address         text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.jobs (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id     uuid not null references public.customers(id) on delete restrict,
  title           text not null,
  status          job_status not null default 'lead',
  address         text,
  scheduled_start timestamptz,
  completed_at    timestamptz,
  -- Target/budgeted revenue (cents) used until the job is fully invoiced.
  revenue_cents   bigint not null default 0,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =============================================================================
-- Files (declared before expenses/receipts to satisfy FK ordering)
-- =============================================================================

create table if not exists public.files (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  job_id          uuid references public.jobs(id) on delete set null,
  customer_id     uuid references public.customers(id) on delete set null,
  kind            file_kind not null default 'other',
  name            text not null,
  -- Storage object path (Supabase Storage / S3 key). Never a public URL.
  storage_path    text not null,
  mime_type       text not null default 'application/octet-stream',
  size_bytes      bigint not null default 0 check (size_bytes >= 0),
  uploaded_by     uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =============================================================================
-- Receipts (OCR/AI drafts) — declared before expenses.
-- The expense_id FK is added below via ALTER because expenses also references
-- receipts (the two tables reference each other, so one direction must be deferred).
-- =============================================================================

create table if not exists public.receipts (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  file_id         uuid not null references public.files(id) on delete cascade,
  -- expense_id FK added below (circular with expenses).
  expense_id      uuid,
  job_id          uuid references public.jobs(id) on delete set null,
  vendor          text,
  -- NULLABLE: OCR may be too uncertain to read a total. See product rule.
  amount_cents    bigint check (amount_cents is null or amount_cents >= 0),
  category        expense_category,
  incurred_date   date,
  ocr_confidence  numeric(4,3) check (ocr_confidence is null or ocr_confidence between 0 and 1),
  ocr_raw         jsonb,
  review_status   receipt_review_status not null default 'pending_review',
  reviewed_by     uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =============================================================================
-- Expenses — references receipts (already declared above).
-- =============================================================================

create table if not exists public.expenses (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  job_id          uuid references public.jobs(id) on delete set null,
  vendor          text not null,
  category        expense_category not null default 'other',
  amount_cents    bigint not null check (amount_cents >= 0),
  status          expense_status not null default 'draft',
  incurred_date   date not null default current_date,
  receipt_id      uuid references public.receipts(id) on delete set null,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Close the receipts <-> expenses loop now that both tables exist.
alter table public.receipts
  add constraint receipts_expense_id_fkey
  foreign key (expense_id) references public.expenses(id) on delete set null;

-- =============================================================================
-- Estimates & invoices
-- =============================================================================

create table if not exists public.estimates (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  number          text not null,
  customer_id     uuid not null references public.customers(id) on delete restrict,
  job_id          uuid references public.jobs(id) on delete set null,
  status          estimate_status not null default 'draft',
  issue_date      date not null default current_date,
  expiry_date     date,
  tax_rate_pct    numeric(5,2) not null default 0,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (organization_id, number)
);

create table if not exists public.estimate_items (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  estimate_id     uuid not null references public.estimates(id) on delete cascade,
  description     text not null,
  quantity        numeric(12,3) not null default 1 check (quantity >= 0),
  unit_price_cents bigint not null default 0,
  position        integer not null default 0
);

create table if not exists public.invoices (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  number          text not null,
  customer_id     uuid not null references public.customers(id) on delete restrict,
  job_id          uuid references public.jobs(id) on delete set null,
  estimate_id     uuid references public.estimates(id) on delete set null,
  status          invoice_status not null default 'draft',
  issue_date      date not null default current_date,
  due_date        date not null,
  tax_rate_pct    numeric(5,2) not null default 0,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (organization_id, number)
);

create table if not exists public.invoice_items (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id      uuid not null references public.invoices(id) on delete cascade,
  description     text not null,
  quantity        numeric(12,3) not null default 1 check (quantity >= 0),
  unit_price_cents bigint not null default 0,
  position        integer not null default 0
);

create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id      uuid not null references public.invoices(id) on delete cascade,
  amount_cents    bigint not null check (amount_cents >= 0),
  method          payment_method not null default 'other',
  paid_at         timestamptz not null default now(),
  reference       text,
  notes           text,
  created_at      timestamptz not null default now()
);

-- =============================================================================
-- Activity log (files declared above with expenses/receipts)
-- =============================================================================

create table if not exists public.activity_log (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id        uuid references public.profiles(id) on delete set null,
  actor_name      text,
  entity_type     text not null,
  entity_id       uuid,
  action          text not null,
  summary         text not null,
  metadata        jsonb,
  created_at      timestamptz not null default now()
);

create table if not exists public.support_access_grants (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  grantee_email   text not null,
  granted_by      uuid not null references public.profiles(id) on delete set null,
  status          support_grant_status not null default 'active',
  scope           text not null default '',
  expires_at      timestamptz not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =============================================================================
-- Indexes
-- =============================================================================

create index if not exists idx_profiles_email on public.profiles (email);

create index if not exists idx_organization_members_org
  on public.organization_members (organization_id);
create index if not exists idx_organization_members_profile
  on public.organization_members (profile_id);

-- Tenant scoping: the single most-used predicate is `organization_id = ?`.
create index if not exists idx_customers_org on public.customers (organization_id);
create index if not exists idx_jobs_org_customer on public.jobs (organization_id, customer_id);
create index if not exists idx_jobs_org_status on public.jobs (organization_id, status);
create index if not exists idx_expenses_org_job on public.expenses (organization_id, job_id);
create index if not exists idx_expenses_org_date on public.expenses (organization_id, incurred_date);
create index if not exists idx_receipts_org_status on public.receipts (organization_id, review_status);
create index if not exists idx_estimates_org_customer on public.estimates (organization_id, customer_id);
create index if not exists idx_estimates_org_status on public.estimates (organization_id, status);
create index if not exists idx_estimate_items_estimate on public.estimate_items (estimate_id);
create index if not exists idx_invoices_org_customer on public.invoices (organization_id, customer_id);
create index if not exists idx_invoices_org_status on public.invoices (organization_id, status);
create index if not exists idx_invoices_org_due on public.invoices (organization_id, due_date);
create index if not exists idx_invoice_items_invoice on public.invoice_items (invoice_id);
create index if not exists idx_payments_org_invoice on public.payments (organization_id, invoice_id);
create index if not exists idx_payments_org_paid on public.payments (organization_id, paid_at);
create index if not exists idx_files_org_job on public.files (organization_id, job_id);
create index if not exists idx_activity_log_org_created on public.activity_log (organization_id, created_at desc);
create index if not exists idx_support_grants_org_status on public.support_access_grants (organization_id, status);

-- =============================================================================
-- updated_at trigger
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare
  t text;
  mutable text[] := array[
    'profiles','organizations','organization_members','business_settings',
    'customers','jobs','expenses','receipts','estimates','invoices',
    'files','support_access_grants'
  ];
begin
  foreach t in array mutable
  loop
    execute format(
      'drop trigger if exists trg_%1$s_updated_at on public.%1$I;'
      'create trigger trg_%1$s_updated_at before update on public.%1$I '
      'for each row execute function public.set_updated_at();',
      t
    );
  end loop;
end $$;

-- =============================================================================
-- Row-Level Security
-- =============================================================================
--
-- Strategy: a SECURITY DEFINER helper answers "is the current user a member of
-- this organization?" without recursing through RLS on organization_members.
-- Every tenant table then gets identical SELECT/INSERT/UPDATE/DELETE policies
-- gated on that check. Special-case tables (organizations, organization_members,
-- profiles) get explicit policies below.
--
-- NOTE: SECURITY DEFINER functions concentrate trust — review and unit-test
-- is_org_member() before relying on it in production. Consider Supabase's
-- `auth.uid()` + a generated `auth.organizations()` claim for higher-scale
-- deployments.

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.business_settings enable row level security;
alter table public.customers enable row level security;
alter table public.jobs enable row level security;
alter table public.expenses enable row level security;
alter table public.receipts enable row level security;
alter table public.estimates enable row level security;
alter table public.estimate_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.files enable row level security;
alter table public.activity_log enable row level security;
alter table public.support_access_grants enable row level security;

-- Membership helper -----------------------------------------------------------
create or replace function public.is_org_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = org
      and m.profile_id = auth.uid()
  );
$$;

-- Special-case policies -------------------------------------------------------

-- A user can read/update only their own profile.
create policy "profiles_self_read"
  on public.profiles for select
  using (auth.uid() = id);
create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Read an organization if you are a member of it.
create policy "orgs_member_read"
  on public.organizations for select
  using (public.is_org_member(id));

-- Read/update organization settings if you are a member.
create policy "settings_member_read"
  on public.business_settings for select
  using (public.is_org_member(organization_id));
create policy "settings_member_update"
  on public.business_settings for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Membership roster: visible to members of the same org.
create policy "members_member_read"
  on public.organization_members for select
  using (public.is_org_member(organization_id));
-- Only owners/admins of the org may manage membership. (Role check inline.)
create policy "members_owner_admin_insert"
  on public.organization_members for insert
  with check (
    public.is_org_member(organization_id)
    and exists (
      select 1 from public.organization_members me
      where me.organization_id = organization_id
        and me.profile_id = auth.uid()
        and me.role in ('owner','admin')
    )
  );
create policy "members_owner_admin_delete"
  on public.organization_members for delete
  using (
    exists (
      select 1 from public.organization_members me
      where me.organization_id = organization_id
        and me.profile_id = auth.uid()
        and me.role in ('owner','admin')
    )
  );

-- Standard CRUD for all remaining tenant tables -------------------------------
-- Every row is owned by organization_id, so the same four policies apply.
do $$
declare
  t text;
  tenant_tables text[] := array[
    'customers','jobs','expenses','receipts','estimates','estimate_items',
    'invoices','invoice_items','payments','files','activity_log',
    'support_access_grants'
  ];
begin
  foreach t in array tenant_tables
  loop
    execute format(
      'create policy %1$I_read   on public.%1$I for select using (public.is_org_member(organization_id));'
      'create policy %1$I_insert on public.%1$I for insert with check (public.is_org_member(organization_id));'
      'create policy %1$I_update on public.%1$I for update using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));'
      'create policy %1$I_delete on public.%1$I for delete using (public.is_org_member(organization_id));',
      t
    );
  end loop;
end $$;

-- =============================================================================
-- TODO (post-Phase-1, intentionally out of scope here)
-- -----------------------------------------------------------------------------
-- * INSERT trigger to bump business_settings.invoice_next_number /
--   estimate_next_number and stamp human-readable numbers.
-- * Computed/denormalized invoice subtotal_cents / tax_cents / total_cents with
--   a trigger that re-sums invoice_items on change.
-- * automated overpayment protection + invoice status reconciliation trigger.
-- * Storage bucket policies for public.files.storage_path.
-- =============================================================================
