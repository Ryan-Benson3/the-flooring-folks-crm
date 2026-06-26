import { kpis, signedPct, usd, type Kpi } from "./data";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconDollar,
  IconWallet,
  IconTrending,
  IconInvoice,
} from "./icons";
import { Card, Sparkline } from "./ui";

const accentRing: Record<Kpi["tone"], string> = {
  wood: "text-wood-300",
  sage: "text-sage-400",
  clay: "text-clay-400",
  neutral: "text-ink-300",
};

const kpiIcon: Record<Kpi["id"], React.ReactNode> = {
  revenue: <IconTrending className="h-4 w-4" />,
  expenses: <IconWallet className="h-4 w-4" />,
  profit: <IconDollar className="h-4 w-4" />,
  receivables: <IconInvoice className="h-4 w-4" />,
};

function StatCard({ kpi }: { kpi: Kpi }) {
  const up = kpi.trend === "up";
  const favorable =
    (up && kpi.id !== "receivables") ||
    (!up && kpi.id === "receivables");
  const Arrow = up ? IconArrowUpRight : IconArrowDownRight;
  const deltaTone = favorable ? "text-sage-300" : "text-clay-300";

  return (
    <Card className="tff-rise p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-ink-400">{kpi.label}</p>
          <p className="nums mt-2 text-2xl font-semibold tracking-tight text-ink-100">
            {usd(kpi.value)}
          </p>
        </div>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] ${accentRing[kpi.tone]}`}
        >
          {kpiIcon[kpi.id]}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`nums inline-flex items-center gap-0.5 text-xs font-semibold ${deltaTone}`}
        >
          <Arrow className="h-3.5 w-3.5" />
          {signedPct(Math.abs(kpi.deltaPct))}
        </span>
        <span className="truncate text-xs text-ink-400">{kpi.sublabel}</span>
      </div>

      <div className="mt-3">
        <Sparkline data={kpi.spark} tone={kpi.tone} />
      </div>
    </Card>
  );
}

export function KpiRow() {
  return (
    <section
      aria-label="Key metrics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {kpis.map((kpi) => (
        <StatCard key={kpi.id} kpi={kpi} />
      ))}
    </section>
  );
}
