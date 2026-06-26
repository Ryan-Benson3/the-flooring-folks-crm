import { invoices, usd, type InvoiceStatus } from "./data";
import { IconArrowUpRight, IconInvoice } from "./icons";
import { Button, Card, Chip, SectionHeader, type Tone } from "./ui";

const statusTone: Record<InvoiceStatus, Tone> = {
  Overdue: "clay",
  Partial: "wood",
  Unpaid: "neutral",
};

function dueLabel(days: number) {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  return `Due in ${days}d`;
}

export function UnpaidInvoices() {
  const total = invoices.reduce((sum, inv) => sum + inv.balance, 0);

  return (
    <Card className="p-5 sm:p-6">
      <SectionHeader
        title="Unpaid invoices"
        subtitle="Collections focus"
        icon={<IconInvoice className="h-4 w-4" />}
        action={
          <a
            href="#"
            className="inline-flex items-center gap-1 text-xs font-semibold text-wood-300 transition hover:text-wood-200"
          >
            All invoices
            <IconArrowUpRight className="h-3.5 w-3.5" />
          </a>
        }
      />

      <div className="mt-4 flex items-end justify-between rounded-xl border border-clay-400/15 bg-clay-500/[0.06] p-3">
        <div>
          <p className="text-xs text-ink-400">Outstanding balance</p>
          <p className="nums text-xl font-semibold text-ink-100">{usd(total)}</p>
        </div>
        <span className="nums inline-flex items-center gap-1 rounded-full bg-clay-500/15 px-2.5 py-1 text-xs font-semibold text-clay-200">
          {invoices.length} open
        </span>
      </div>

      <ul className="mt-3 flex flex-col gap-1.5">
        {invoices.map((inv) => (
          <li
            key={inv.id}
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.02]"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="nums text-[0.7rem] font-semibold text-ink-400">
                  {inv.number}
                </span>
                <p className="truncate text-sm font-medium text-ink-100">
                  {inv.customer}
                </p>
              </div>
              <p
                className={`text-[0.7rem] ${inv.status === "Overdue" ? "font-semibold text-clay-300" : "text-ink-500"}`}
              >
                {dueLabel(inv.dueInDays)}
                {inv.status === "Partial"
                  ? ` · ${usd(inv.amount - inv.balance)} paid`
                  : ""}
              </p>
            </div>
            <span className="nums text-sm font-semibold text-ink-100">
              {usd(inv.balance)}
            </span>
            <Chip tone={statusTone[inv.status]} dot>
              {inv.status}
            </Chip>
          </li>
        ))}
      </ul>

      <Button href="#" variant="ghost" icon={<IconArrowUpRight />} className="mt-3 w-full">
        Send reminders
      </Button>
    </Card>
  );
}
