import { jobs, usd, type JobStatus } from "./data";
import { IconArrowUpRight, IconClock, IconMapPin } from "./icons";
import { Card, Chip, SectionHeader, type Tone } from "./ui";

const statusTone: Record<JobStatus, Tone> = {
  "In progress": "wood",
  Scheduled: "plum",
  "On hold": "clay",
  Completed: "sage",
};

function relative(hoursAgo: number) {
  if (hoursAgo < 24) return `${hoursAgo}h ago`;
  const days = Math.round(hoursAgo / 24);
  return `${days}d ago`;
}

export function RecentJobs() {
  const recent = [...jobs].sort((a, b) => a.updatedHoursAgo - b.updatedHoursAgo);
  return (
    <Card className="p-5 sm:p-6">
      <SectionHeader
        title="Recent jobs"
        subtitle="Latest activity across the board"
        action={
          <a
            href="#"
            className="inline-flex items-center gap-1 text-xs font-semibold text-wood-300 transition hover:text-wood-200"
          >
            All jobs
            <IconArrowUpRight className="h-3.5 w-3.5" />
          </a>
        }
      />

      <ul className="mt-4 flex flex-col divide-y divide-white/[0.04]">
        {recent.map((job) => (
          <li key={job.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-1">
            <span className="nums hidden w-14 shrink-0 text-xs font-semibold text-ink-400 sm:block">
              {job.code}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-100">
                {job.customer}
              </p>
              <p className="flex items-center gap-1 truncate text-xs text-ink-400">
                <IconMapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{job.address}</span>
              </p>
            </div>

            <div className="hidden text-right md:block">
              <p className="nums text-sm font-semibold text-ink-100">
                {usd(job.revenue)}
              </p>
              <p className="flex items-center justify-end gap-1 text-[0.7rem] text-ink-500">
                <IconClock className="h-3 w-3" />
                {relative(job.updatedHoursAgo)}
              </p>
            </div>

            <Chip tone={statusTone[job.status]} dot>
              {job.status}
            </Chip>
          </li>
        ))}
      </ul>
    </Card>
  );
}
