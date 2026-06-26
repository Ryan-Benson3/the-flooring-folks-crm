"use client";

import Link from "next/link";
import { cn } from "./data";
import {
  ACTIVE_NAV_ID,
  primaryNav,
  secondaryNav,
  type NavItem,
} from "./nav-items";

function NavRow({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const active = item.id === ACTIVE_NAV_ID;
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
        active
          ? "bg-white/[0.06] text-ink-100"
          : "text-ink-300 hover:bg-white/[0.04] hover:text-ink-100",
      )}
    >
      {active ? (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-wood-300 to-wood-500"
        />
      ) : null}
      <Icon
        className={cn(
          "h-[1.15rem] w-[1.15rem] shrink-0 transition",
          active ? "text-wood-300" : "text-ink-400 group-hover:text-ink-200",
        )}
      />
      <span className="flex-1">{item.label}</span>
      {item.badge ? (
        <span
          className={cn(
            "nums rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold leading-none",
            active
              ? "bg-wood-500/20 text-wood-200"
              : "bg-white/[0.07] text-ink-300",
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {primaryNav.map((item) => (
        <NavRow key={item.id} item={item} onNavigate={onNavigate} />
      ))}
      <p className="px-3 pb-1 pt-5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-500">
        Manage
      </p>
      {secondaryNav.map((item) => (
        <NavRow key={item.id} item={item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}
