import { quickActions, type QuickAction } from "./data";
import {
  IconDollar,
  IconFilePlus,
  IconInvoice,
  IconScan,
  IconUserPlus,
  IconWrench,
} from "./icons";
import { Card } from "./ui";

const actionIcon: Record<QuickAction["icon"], React.ReactNode> = {
  filePlus: <IconFilePlus className="h-[1.15rem] w-[1.15rem]" />,
  invoice: <IconInvoice className="h-[1.15rem] w-[1.15rem]" />,
  dollar: <IconDollar className="h-[1.15rem] w-[1.15rem]" />,
  scan: <IconScan className="h-[1.15rem] w-[1.15rem]" />,
  userPlus: <IconUserPlus className="h-[1.15rem] w-[1.15rem]" />,
  wrench: <IconWrench className="h-[1.15rem] w-[1.15rem]" />,
};

export function QuickActions() {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
          Quick actions
        </h2>
        <span className="hidden text-xs text-ink-500 sm:inline">
          Tap to jump straight in
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {quickActions.map((action) => (
          <a
            key={action.id}
            href={action.href}
            className="group flex flex-col items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-wood-400/30 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wood-300/60"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-wood-500/12 text-wood-300 transition group-hover:bg-wood-500/20">
              {actionIcon[action.icon]}
            </span>
            <span className="text-sm font-medium text-ink-100">
              {action.label}
            </span>
          </a>
        ))}
      </div>
    </Card>
  );
}
