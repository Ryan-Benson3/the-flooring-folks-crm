import { expenseCategories, usd } from "./data";
import { IconDownload, IconWallet } from "./icons";
import { Button, Card, SectionHeader } from "./ui";

const toneBar: Record<string, string> = {
  wood: "bg-gradient-to-r from-wood-400 to-wood-300",
  sage: "bg-gradient-to-r from-sage-500 to-sage-300",
  clay: "bg-gradient-to-r from-clay-500 to-clay-300",
  plum: "bg-gradient-to-r from-plum-500 to-plum-300",
  neutral: "bg-gradient-to-r from-ink-500 to-ink-400",
};

const toneDot: Record<string, string> = {
  wood: "bg-wood-300",
  sage: "bg-sage-400",
  clay: "bg-clay-400",
  plum: "bg-plum-400",
  neutral: "bg-ink-400",
};

export function ExpenseBreakdown() {
  const total = expenseCategories.reduce((sum, c) => sum + c.amount, 0);
  const max = Math.max(...expenseCategories.map((c) => c.amount));

  return (
    <Card className="p-5 sm:p-6">
      <SectionHeader
        title="Expenses by category"
        subtitle="Where the month's spend went"
        icon={<IconWallet className="h-4 w-4" />}
      />

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs text-ink-400">Total this month</p>
          <p className="nums text-2xl font-semibold tracking-tight text-ink-100">
            {usd(total)}
          </p>
        </div>
        <Button href="#" variant="subtle" icon={<IconDownload />} className="py-2 text-xs">
          Export
        </Button>
      </div>

      <ul className="mt-5 flex flex-col gap-3.5">
        {expenseCategories.map((cat) => {
          const widthPct = (cat.amount / max) * 100;
          const sharePct = (cat.amount / total) * 100;
          return (
            <li key={cat.id}>
              <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                <span className="inline-flex items-center gap-2 text-ink-200">
                  <span className={`h-2 w-2 rounded-full ${toneDot[cat.tone]}`} />
                  {cat.label}
                </span>
                <span className="nums flex items-baseline gap-1.5">
                  <span className="font-semibold text-ink-100">
                    {usd(cat.amount)}
                  </span>
                  <span className="text-[0.7rem] text-ink-500">
                    {sharePct.toFixed(0)}%
                  </span>
                </span>
              </div>
              <span className="block h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
                <span
                  className={`block h-full rounded-full ${toneBar[cat.tone]}`}
                  style={{ width: `${Math.max(3, widthPct)}%` }}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
