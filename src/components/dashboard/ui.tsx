import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "./data";

/* --------------------------------- Card --------------------------------- */

export function Card({
  as,
  className,
  children,
  ...props
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & ComponentPropsWithoutRef<"div">) {
  const Comp: ElementType = as ?? "div";
  return (
    <Comp
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-ink-850/70 shadow-[0_28px_56px_-40px_rgba(0,0,0,0.8)] backdrop-blur-sm",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

/* ------------------------------ SectionHead ----------------------------- */

export function SectionHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-wood-300">
            {icon}
          </span>
        ) : null}
        <div>
          <h2 className="text-[0.95rem] font-semibold tracking-tight text-ink-100">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-xs text-ink-400">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* -------------------------------- Button -------------------------------- */

type ButtonVariant = "primary" | "ghost" | "subtle";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-b from-wood-300 to-wood-500 text-ink-950 shadow-[0_10px_22px_-10px_rgba(217,154,72,0.7)] ring-1 ring-inset ring-white/25 hover:from-wood-200 hover:to-wood-400",
  ghost:
    "border border-white/10 bg-white/[0.03] text-ink-100 hover:bg-white/[0.07] hover:text-white",
  subtle:
    "border border-white/10 bg-white/[0.03] text-ink-200 hover:bg-white/[0.08] hover:text-white",
};

export function Button({
  variant = "primary",
  className,
  children,
  icon,
  ...props
}: {
  variant?: ButtonVariant;
  icon?: ReactNode;
} & ComponentPropsWithoutRef<"a">) {
  return (
    <a
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wood-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900",
        buttonVariants[variant],
        className,
      )}
      {...props}
    >
      {icon ? <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span> : null}
      {children}
    </a>
  );
}

export function IconButton({
  className,
  children,
  label,
  ...props
}: {
  label: string;
} & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-ink-200 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wood-300/60",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* --------------------------------- Chip --------------------------------- */

export type Tone = "wood" | "sage" | "clay" | "plum" | "neutral";

const chipTones: Record<Tone, { wrap: string; dot: string }> = {
  wood: { wrap: "bg-wood-500/12 text-wood-200 ring-wood-400/20", dot: "bg-wood-300" },
  sage: { wrap: "bg-sage-500/12 text-sage-300 ring-sage-400/20", dot: "bg-sage-400" },
  clay: { wrap: "bg-clay-500/12 text-clay-200 ring-clay-400/20", dot: "bg-clay-400" },
  plum: { wrap: "bg-plum-500/12 text-plum-300 ring-plum-400/20", dot: "bg-plum-400" },
  neutral: { wrap: "bg-white/[0.05] text-ink-200 ring-white/10", dot: "bg-ink-300" },
};

export function Chip({
  tone = "neutral",
  dot = false,
  className,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const t = chipTones[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        t.wrap,
        className,
      )}
    >
      {dot ? <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} /> : null}
      {children}
    </span>
  );
}

/* -------------------------------- Meter --------------------------------- */

const meterFill: Record<Tone, string> = {
  wood: "bg-gradient-to-r from-wood-400 to-wood-300",
  sage: "bg-gradient-to-r from-sage-500 to-sage-300",
  clay: "bg-gradient-to-r from-clay-500 to-clay-300",
  plum: "bg-gradient-to-r from-plum-500 to-plum-300",
  neutral: "bg-gradient-to-r from-ink-500 to-ink-400",
};

export function Meter({
  value,
  tone = "wood",
  className,
}: {
  value: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "block h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]",
        className,
      )}
      aria-hidden="true"
    >
      <span
        className={cn("block h-full rounded-full", meterFill[tone])}
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </span>
  );
}

/* ------------------------------ Sparkline ------------------------------- */

const sparkColor: Record<Tone, string> = {
  wood: "#e6b46f",
  sage: "#6fb386",
  clay: "#e08a7c",
  plum: "#b294d6",
  neutral: "#93a0b4",
};

export function Sparkline({
  data,
  tone = "wood",
  className,
}: {
  data: number[];
  tone?: Tone;
  className?: string;
}) {
  const w = 120;
  const h = 36;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((d, i) => {
    const x = i * step;
    const y = h - ((d - min) / span) * (h - 6) - 3;
    return [x, y] as const;
  });
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const color = sparkColor[tone];
  // Unique gradient id so multiple sparklines don't collide.
  const gid = `spark-${tone}-${data.length}-${Math.round(data[0] ?? 0)}`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("h-9 w-full", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
