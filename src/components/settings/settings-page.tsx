import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  IconCheck,
  IconClipboard,
  IconDollar,
  IconMapPin,
  IconShield,
  IconSliders,
  IconSparkle,
  IconWrench,
} from "@/components/dashboard/icons";
import { Button, Card, Chip, SectionHeader } from "@/components/dashboard/ui";
import {
  sampleBusinessSettings,
  sampleLineItemTemplates,
} from "@/lib/sample-data";
import {
  formatAddress,
  formatCurrency,
  formatPhone,
  nextDocumentNumber,
} from "@/lib/domain";

const settings = sampleBusinessSettings;

function Field({
  label,
  value,
  helper,
}: {
  label: string;
  value?: string | number;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
        {label}
      </span>
      <span className="flex min-h-11 items-center rounded-xl border border-white/[0.08] bg-white/[0.035] px-3.5 py-2.5 text-sm font-medium text-ink-100 ring-1 ring-inset ring-transparent transition hover:border-wood-400/25 hover:bg-white/[0.055]">
        {value || "—"}
      </span>
      {helper ? <span className="mt-1.5 block text-xs text-ink-500">{helper}</span> : null}
    </label>
  );
}

function SettingsCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <SectionHeader title={title} subtitle={subtitle} icon={icon} />
      <div className="mt-5">{children}</div>
    </Card>
  );
}

function ColorSwatch({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
      <div className="flex items-center gap-3">
        <span
          className="h-11 w-11 rounded-xl border border-white/15 shadow-inner"
          style={{ backgroundColor: value }}
        />
        <div>
          <p className="text-sm font-semibold text-ink-100">{label}</p>
          <p className="nums text-xs text-ink-400">{value}</p>
        </div>
      </div>
    </div>
  );
}

function OptionList({
  items,
}: {
  items: { label: string; enabled?: boolean; color?: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-ink-200"
        >
          {item.color ? (
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
          ) : null}
          {item.label}
          {item.enabled === false ? <span className="text-ink-500">off</span> : null}
        </span>
      ))}
    </div>
  );
}

export function SettingsPage() {
  const address = formatAddress(settings.address);
  const primaryColor = settings.brand.primaryColor ?? "#d99a48";
  const accentColor = settings.brand.accentColor ?? "#6fb386";

  return (
    <DashboardShell activeNavId="settings">
      <div className="flex flex-col gap-6 lg:gap-8">
        <section className="tff-rise overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-ink-850 via-ink-900 to-ink-950 p-5 shadow-[0_36px_80px_-50px_rgba(0,0,0,0.9)] sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-wood-300/80">
                <IconSliders className="h-3.5 w-3.5" />
                Business settings
              </p>
              <h1 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">
                Make the cockpit feel like The Flooring Folks.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-400">
                Phase 2 adds the settings surface now: profile, brand, invoice terms,
                estimate notes, workflows, and defaults. These fields are sample-backed
                until Supabase persistence is wired in a later phase.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone="wood" dot>Preview only</Chip>
              <Chip tone="sage" dot>Owner/admin</Chip>
              <Button href="/" variant="ghost">Back to dashboard</Button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] lg:gap-8">
          <div className="flex flex-col gap-6 lg:gap-8">
            <SettingsCard
              title="Business profile"
              subtitle="The information printed on estimates, invoices, and customer docs."
              icon={<IconMapPin className="h-4 w-4" />}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Display name" value={settings.displayName} />
                <Field label="Legal name" value={settings.legalName} />
                <Field label="Phone" value={formatPhone(settings.phone)} />
                <Field label="Email" value={settings.email} />
                <Field label="Website" value={settings.website} />
                <Field label="Default tax" value={`${settings.taxRatePct}%`} />
                <div className="sm:col-span-2">
                  <Field label="Business address" value={address} />
                </div>
              </div>
            </SettingsCard>

            <SettingsCard
              title="Estimate & invoice defaults"
              subtitle="Keep documents consistent without retyping terms every job."
              icon={<IconClipboard className="h-4 w-4" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Next invoice number"
                  value={nextDocumentNumber(settings.invoiceNumbering)}
                  helper="Used when a new invoice is created."
                />
                <Field
                  label="Next estimate number"
                  value={nextDocumentNumber(settings.estimateNumbering)}
                  helper="Used when a new estimate is created."
                />
                <div className="md:col-span-2">
                  <Field label="Invoice terms" value={settings.invoiceTerms} />
                </div>
                <div className="md:col-span-2">
                  <Field label="Estimate notes" value={settings.estimateNotes} />
                </div>
              </div>
            </SettingsCard>

            <SettingsCard
              title="Workflow defaults"
              subtitle="Statuses, line-item templates, and the simple choices Ryan uses every day."
              icon={<IconWrench className="h-4 w-4" />}
            >
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                    Job statuses
                  </p>
                  <OptionList items={settings.jobStatuses} />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                    Line item templates
                  </p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {sampleLineItemTemplates.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"
                      >
                        <p className="text-sm font-semibold text-ink-100">{item.name}</p>
                        <p className="mt-1 text-xs leading-5 text-ink-400">
                          {item.description}
                        </p>
                        <p className="nums mt-3 text-xs font-semibold text-wood-200">
                          {formatCurrency(item.defaultUnitPriceCents)} / {item.unit.replace("_", " ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SettingsCard>
          </div>

          <aside className="flex flex-col gap-6 lg:gap-8">
            <SettingsCard
              title="Brand appearance"
              subtitle="The colors and mark that will feed PDFs and the customer portal later."
              icon={<IconSparkle className="h-4 w-4" />}
            >
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black text-ink-950 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
                    >
                      FF
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink-100">{settings.displayName}</p>
                      <p className="text-xs text-ink-400">Logo placeholder · ready for upload later</p>
                    </div>
                  </div>
                </div>
                <ColorSwatch label="Primary wood" value={primaryColor} />
                <ColorSwatch label="Accent sage" value={accentColor} />
              </div>
            </SettingsCard>

            <SettingsCard
              title="Payment & expense defaults"
              subtitle="Keep daily entry fast and consistent."
              icon={<IconDollar className="h-4 w-4" />}
            >
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                    Payment methods
                  </p>
                  <OptionList items={settings.paymentMethods} />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                    Expense categories
                  </p>
                  <OptionList items={settings.expenseCategories} />
                </div>
              </div>
            </SettingsCard>

            <SettingsCard
              title="Support access"
              subtitle="Safe help without handing over the keys."
              icon={<IconShield className="h-4 w-4" />}
            >
              <div className="rounded-2xl border border-sage-400/15 bg-sage-500/10 p-4">
                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-400/15 text-sage-300">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-sage-200">
                      Future support sessions are time-boxed and logged.
                    </p>
                    <p className="mt-1 text-xs leading-5 text-ink-400">
                      Pike/Adam support access will use explicit grants, not a permanent back door. This is documented now; enforcement ships with team roles.
                    </p>
                  </div>
                </div>
              </div>
            </SettingsCard>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}
