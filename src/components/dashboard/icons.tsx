import type { SVGProps } from "react";

/**
 * Lightweight inline icon set (Lucide-style strokes).
 * No external UI package — keeps the bundle lean and the look consistent.
 */

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconGrid = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </Base>
);

export const IconUsers = (p: IconProps) => (
  <Base {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Base>
);

export const IconWrench = (p: IconProps) => (
  <Base {...p}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </Base>
);

export const IconClipboard = (p: IconProps) => (
  <Base {...p}>
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M9 12h6" />
    <path d="M9 16h6" />
  </Base>
);

export const IconInvoice = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8" />
    <path d="M8 17h5" />
  </Base>
);

export const IconScan = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 8V6a2 2 0 0 1 2-2h2" />
    <path d="M16 4h2a2 2 0 0 1 2 2v2" />
    <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
    <path d="M8 20H6a2 2 0 0 1-2-2v-2" />
    <path d="M4 12h16" />
  </Base>
);

export const IconDollar = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10" />
    <path d="M15 9.6c0-1.1-1.3-2-3-2s-3 .9-3 2 1.3 1.9 3 2 3 .9 3 2-1.3 2-3 2-3-.9-3-2" />
  </Base>
);

export const IconFolder = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </Base>
);

export const IconChart = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 4v15a1 1 0 0 0 1 1h15" />
    <rect x="7" y="11" width="3" height="6" rx="1" />
    <rect x="12" y="7" width="3" height="10" rx="1" />
    <rect x="17" y="13" width="3" height="4" rx="1" />
  </Base>
);

export const IconShield = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
    <path d="M9 12l2 2 4-4" />
  </Base>
);

export const IconSliders = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6h8" />
    <path d="M16 6h4" />
    <circle cx="14" cy="6" r="2" />
    <path d="M4 12h4" />
    <path d="M12 12h8" />
    <circle cx="10" cy="12" r="2" />
    <path d="M4 18h8" />
    <path d="M16 18h4" />
    <circle cx="14" cy="18" r="2" />
  </Base>
);

export const IconSearch = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Base>
);

export const IconBell = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </Base>
);

export const IconPlus = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Base>
);

export const IconMenu = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </Base>
);

export const IconClose = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </Base>
);

export const IconChevronRight = (p: IconProps) => (
  <Base {...p}>
    <path d="m9 6 6 6-6 6" />
  </Base>
);

export const IconArrowUpRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </Base>
);

export const IconArrowDownRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 7l10 10" />
    <path d="M17 8v9H8" />
  </Base>
);

export const IconCalendar = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
  </Base>
);

export const IconMapPin = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </Base>
);

export const IconClock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);

export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12l5 5 9-10" />
  </Base>
);

export const IconAlert = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 2.5 19.5h19z" />
    <path d="M12 10v4" />
    <path d="M12 17h.01" />
  </Base>
);

export const IconSparkle = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5l1.7 4.6 4.6 1.7-4.6 1.7L12 16.1l-1.7-4.6L5.7 9.8l4.6-1.7z" />
    <path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
  </Base>
);

export const IconDownload = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v10" />
    <path d="m8 9 4 4 4-4" />
    <path d="M4 19h16" />
  </Base>
);

export const IconFilePlus = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M12 12v6" />
    <path d="M9 15h6" />
  </Base>
);

export const IconUserPlus = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M18 8v6" />
    <path d="M15 11h6" />
  </Base>
);

export const IconCamera = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 8a2 2 0 0 1 2-2h2l1.4-2h5.2L18 6h0a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    <circle cx="12" cy="13" r="3.4" />
  </Base>
);

export const IconTrending = (p: IconProps) => (
  <Base {...p}>
    <path d="m3 16 6-6 4 4 8-8" />
    <path d="M15 6h6v6" />
  </Base>
);

export const IconWallet = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h12v4" />
    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a1 1 0 0 0-1-1H6" />
    <circle cx="16" cy="13" r="1.4" />
  </Base>
);
