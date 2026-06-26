import { currentUser, organization } from "./data";
import { IconCalendar, IconPlus, IconScan } from "./icons";
import { Button } from "./ui";

export function PageHeader() {
  // Static greeting — good enough for the visual foundation.
  const today = "Friday, June 26";
  return (
    <section className="tff-rise">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-wood-300/80">
            <IconCalendar className="h-3.5 w-3.5" />
            {today}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">
            Good morning, {currentUser.name.split(" ")[0]}.
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-ink-400">
            {organization.name} is up <span className="font-semibold text-sage-300">12.4% </span>
            in revenue this month. Two invoices need a nudge and three receipts
            are waiting on review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button href="#" variant="ghost" icon={<IconScan />}>
            Scan receipt
          </Button>
          <Button href="#" icon={<IconPlus />}>
            New estimate
          </Button>
        </div>
      </div>
    </section>
  );
}
