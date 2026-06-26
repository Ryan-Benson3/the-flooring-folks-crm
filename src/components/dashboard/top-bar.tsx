"use client";

import { useState } from "react";
import { MobileNav } from "./mobile-nav";
import { currentUser } from "./data";
import {
  IconBell,
  IconFilePlus,
  IconPlus,
  IconSearch,
  IconScan,
} from "./icons";
import { Button, IconButton } from "./ui";
import { createClient } from "@/lib/supabase/client";

export function TopBar({ activeNavId }: { activeNavId?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-900/80 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <MobileNav activeNavId={activeNavId} />

        {/* Search */}
        <label className="relative hidden flex-1 max-w-md items-center md:flex">
          <span className="pointer-events-none absolute left-3 text-ink-400">
            <IconSearch className="h-[1.05rem] w-[1.05rem]" />
          </span>
          <input
            type="search"
            placeholder="Search jobs, customers, invoices…"
            className="h-10 w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-10 pr-16 text-sm text-ink-100 placeholder:text-ink-400 focus:border-wood-400/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-wood-400/20"
          />
          <kbd className="nums pointer-events-none absolute right-3 hidden rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[0.65rem] text-ink-400 lg:inline">
            ⌘K
          </kbd>
        </label>

        <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
          <Button
            href="#"
            variant="ghost"
            icon={<IconScan />}
            className="hidden sm:inline-flex"
          >
            Scan receipt
          </Button>
          <Button href="#" icon={<IconFilePlus />} className="hidden sm:inline-flex">
            New estimate
          </Button>

          {/* Compact new action on very small screens */}
          <Button href="#" icon={<IconPlus />} className="sm:hidden" aria-label="New">
            New
          </Button>

          <IconButton label="Notifications" className="relative">
            <IconBell className="h-[1.2rem] w-[1.2rem]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-clay-400 ring-2 ring-ink-900" />
          </IconButton>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="ml-1 flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] py-1 pl-1 pr-1 text-left transition hover:bg-white/[0.06] sm:pr-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-wood-300 to-wood-600 text-xs font-bold text-ink-950">
                {currentUser.initials}
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-xs font-semibold text-ink-100">
                  {currentUser.name}
                </span>
                <span className="block text-[0.7rem] text-ink-400">
                  {currentUser.role}
                </span>
              </span>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/[0.08] bg-ink-850 shadow-2xl">
                  <a
                    href="/settings"
                    className="block px-4 py-2.5 text-sm text-ink-200 transition hover:bg-white/[0.05]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Business Settings
                  </a>
                  <hr className="border-white/[0.06]" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2.5 text-left text-sm text-ink-300 transition hover:bg-white/[0.05]"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
