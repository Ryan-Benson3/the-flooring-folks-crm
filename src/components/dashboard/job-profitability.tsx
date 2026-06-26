import { jobs, usd, type Job } from "./data";
import { IconArrowUpRight } from "./icons";
import { Card, SectionHeader } from "./ui";

function marginTone(pct: number): { label: string; profit: string; cost: string } {
  if (pct >= 35)
    return { label: "text-sage-300", profit: "bg-sage-400", cost: "bg-ink-600" };
  if (pct >= 20)
    return { label: "text-wood-300", profit: "bg-wood-400", cost: "bg-ink-600" };
  return { label: "text-clay-300", profit: "bg-clay-400", cost: "bg-ink-600" };
}

function ProfitRow({ job }: { job: Job }) {
  const profit = job.revenue - job.cost;
  const profitShare = (profit / job.revenue) * 100;
  const tone = marginTone(job.marginPct);

  return (
    <div className="rounded-xl p-3 transition hover:bg-white/[0.02]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="nums rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[0.65rem] font-semibold text-ink-300">
              {job.code}
            </span>
            <p className="truncate text-sm font-semibold text-ink-100">
              {job.customer}
            </p>
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-400">{job.type}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="nums text-sm font-semibold text-ink-100">
            {usd(job.revenue)}
          </p>
          <p className={`nums text-xs font-medium ${tone.label}`}>
            +{usd(profit)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-2 flex-1 overflow-hidden rounded-full bg-ink-700"
        >
          <span className={`${tone.cost} h-full`} style={{ width: `${100 - profitShare}%` }} />
          <span className={`${tone.profit} h-full`} style={{ width: `${profitShare}%` }} />
        </span>
        <span className={`nums w-12 shrink-0 text-right text-xs font-semibold ${tone.label}`}>
          {job.marginPct.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

export function JobProfitability() {
  const sorted = [...jobs].sort((a, b) => b.revenue - a.revenue).slice(0, 4);
  return (
    <Card className="p-5 sm:p-6">
      <SectionHeader
        title="Job profitability"
        subtitle="Top jobs by revenue · this month"
        action={
          <a
            href="#"
            className="inline-flex items-center gap-1 text-xs font-semibold text-wood-300 transition hover:text-wood-200"
          >
            View all
            <IconArrowUpRight className="h-3.5 w-3.5" />
          </a>
        }
      />

      <div className="mt-4 flex items-center gap-4 text-[0.7rem] text-ink-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ink-600" /> Cost
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sage-400" /> Profit
        </span>
      </div>

      <div className="mt-2 flex flex-col divide-y divide-white/[0.04]">
        {sorted.map((job) => (
          <ProfitRow key={job.id} job={job} />
        ))}
      </div>
    </Card>
  );
}
