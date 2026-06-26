import { estimates, usd, usdCompact, type EstimateStatus } from "./data";
import { IconClipboard } from "./icons";
import { Card, Chip, SectionHeader, type Tone } from "./ui";

const statusTone: Record<EstimateStatus, Tone> = {
  "Follow-up": "clay",
  Viewed: "plum",
  Sent: "neutral",
  Accepted: "sage",
};

export function OpenEstimates() {
  const total = estimates
    .filter((e) => e.status !== "Accepted")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <Card className="p-5 sm:p-6">
      <SectionHeader
        title="Open estimates"
        subtitle="Awaiting a response"
        icon={<IconClipboard className="h-4 w-4" />}
      />

      <ul className="mt-4 flex flex-col gap-1.5">
        {estimates.map((est) => (
          <li
            key={est.id}
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.02]"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="nums text-[0.7rem] font-semibold text-ink-400">
                  {est.number}
                </span>
                <p className="truncate text-sm font-medium text-ink-100">
                  {est.customer}
                </p>
              </div>
              <p className="text-[0.7rem] text-ink-500">
                {est.status === "Accepted"
                  ? `Accepted ${est.daysOut}d ago`
                  : `Sent ${est.daysOut}d ago`}
              </p>
            </div>
            <span className="nums text-sm font-semibold text-ink-100">
              {usd(est.amount)}
            </span>
            <Chip tone={statusTone[est.status]} dot>
              {est.status}
            </Chip>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3 text-sm">
        <span className="text-ink-400">Open value</span>
        <span className="nums font-semibold text-ink-100">{usdCompact(total)}</span>
      </div>
    </Card>
  );
}
