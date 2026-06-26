import { cn } from "./data";

/**
 * Brand mark — stacked hardwood planks motif in warm wood tones.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl",
        "bg-gradient-to-br from-wood-400 to-wood-600 shadow-[0_8px_18px_-8px_rgba(189,120,44,0.8)] ring-1 ring-inset ring-white/25",
        className,
      )}
    >
      <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden="true">
        <g
          stroke="rgba(255,255,255,0.62)"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d="M6 13.5h28" />
          <path d="M6 20.5h28" />
          <path d="M6 27.5h28" />
        </g>
        <g
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d="M15 13.5v0.01" />
          <path d="M26 20.5v0.01" />
          <path d="M12 27.5v0.01" />
        </g>
      </svg>
    </span>
  );
}

export function Brand({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark />
      {showWordmark ? (
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight text-ink-100">
            The Flooring Folks
          </p>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-wood-300/80">
            Business Cockpit
          </p>
        </div>
      ) : null}
    </div>
  );
}
