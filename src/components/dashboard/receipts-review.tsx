import { receipts, usd, type Receipt } from "./data";
import { IconAlert, IconArrowUpRight, IconScan, IconSparkle } from "./icons";
import { Button, Card, Meter, SectionHeader } from "./ui";

function confidenceTone(c: number): "sage" | "wood" | "clay" {
  if (c >= 0.9) return "sage";
  if (c >= 0.75) return "wood";
  return "clay";
}

function ReceiptRow({ receipt }: { receipt: Receipt }) {
  const tone = confidenceTone(receipt.confidence);
  return (
    <li className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-100">
            {receipt.vendor}
          </p>
          <p className="text-[0.7rem] text-ink-400">
            {receipt.capturedAt} · {receipt.category}
          </p>
        </div>
        <p className="nums text-sm font-semibold text-ink-100">
          {usd(receipt.amount, { cents: true })}
        </p>
      </div>

      <div className="mt-2.5 flex items-center gap-2.5">
        <span className="inline-flex items-center gap-1 text-[0.7rem] text-ink-400">
          <IconSparkle className="h-3 w-3 text-plum-400" />
          AI draft
        </span>
        <Meter value={receipt.confidence * 100} tone={tone} className="flex-1" />
        <span className="nums text-[0.7rem] font-medium text-ink-300">
          {Math.round(receipt.confidence * 100)}%
        </span>
      </div>

      <Button
        href="#"
        variant="subtle"
        icon={<IconArrowUpRight />}
        className="mt-2.5 w-full py-2 text-xs"
      >
        Review &amp; approve
      </Button>
    </li>
  );
}

export function ReceiptsReview() {
  return (
    <Card className="p-5 sm:p-6">
      <SectionHeader
        title="Receipts to review"
        subtitle="Scanned drafts · nothing posts until approved"
        icon={<IconScan className="h-4 w-4" />}
        action={
          <span className="nums inline-flex items-center gap-1 rounded-full bg-plum-500/15 px-2.5 py-1 text-xs font-semibold text-plum-300">
            <IconSparkle className="h-3 w-3" />
            OCR
          </span>
        }
      />

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-plum-400/15 bg-plum-500/[0.06] p-3 text-xs text-ink-300">
        <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-plum-300" />
        <p>
          These are AI-captured drafts. Edit the category or amount, then approve
          to record an expense. Unapproved receipts never hit your books.
        </p>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {receipts.map((r) => (
          <ReceiptRow key={r.id} receipt={r} />
        ))}
      </ul>
    </Card>
  );
}
