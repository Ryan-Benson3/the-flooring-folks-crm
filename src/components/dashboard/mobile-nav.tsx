"use client";

import { useEffect, useState } from "react";
import { Brand } from "./brand";
import { IconClose, IconMenu } from "./icons";
import { SidebarNav } from "./sidebar-nav";
import { IconButton } from "./ui";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <IconButton
        label="Open menu"
        className="lg:hidden"
        onClick={() => setOpen(true)}
      >
        <IconMenu className="h-5 w-5" />
      </IconButton>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-xs flex-col border-r border-white/[0.06] bg-ink-900 shadow-2xl tff-rise">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <Brand />
              <IconButton label="Close menu" onClick={() => setOpen(false)}>
                <IconClose className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <SidebarNav onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
