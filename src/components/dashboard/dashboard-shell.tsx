import type { ReactNode } from "react";
import { Brand } from "./brand";
import { SidebarNav } from "./sidebar-nav";
import { TopBar } from "./top-bar";
import { currentUser, organization } from "./data";

export function DashboardShell({
  activeNavId,
  children,
}: {
  activeNavId?: string;
  children: ReactNode;
}) {
  return (
    <div className="lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-white/[0.06] bg-ink-900/60 lg:flex">
        <div className="px-5 py-5">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <SidebarNav activeNavId={activeNavId} />
        </div>
        <div className="border-t border-white/[0.06] px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-wood-300 to-wood-600 text-xs font-bold text-ink-950">
              {currentUser.initials}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-semibold text-ink-100">
                {currentUser.name}
              </p>
              <p className="truncate text-[0.7rem] text-ink-400">
                {organization.name}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-col">
        <TopBar activeNavId={activeNavId} />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
