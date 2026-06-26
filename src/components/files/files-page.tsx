"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button, Card } from "@/components/dashboard/ui";
import { IconFolder, IconSearch, IconCamera } from "@/components/dashboard/icons";
import { sampleFiles, sampleJobs, sampleCustomers } from "@/lib/sample-data";
import type { FileKind } from "@/lib/domain";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const FILE_KIND_LABELS: Record<FileKind, string> = {
  photo: "Photo",
  document: "Document",
  contract: "Contract",
  receipt: "Receipt",
  invoice: "Invoice",
  other: "Other",
};

const KIND_TONES: Record<FileKind, { color: string; bg: string }> = {
  photo: { color: "#6fb386", bg: "rgba(111,179,134,0.12)" },
  document: { color: "#93a0b4", bg: "rgba(147,160,180,0.1)" },
  contract: { color: "#e6b46f", bg: "rgba(230,180,111,0.12)" },
  receipt: { color: "#e08a7c", bg: "rgba(224,138,124,0.12)" },
  invoice: { color: "#b294d6", bg: "rgba(178,148,214,0.12)" },
  other: { color: "#7d8597", bg: "rgba(125,133,151,0.1)" },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function jobName(jobId?: string): string | null {
  if (!jobId) return null;
  const job = sampleJobs.find((j) => j.id === jobId);
  return job ? job.title : null;
}

function customerName(customerId?: string): string | null {
  if (!customerId) return null;
  const c = sampleCustomers.find((x) => x.id === customerId);
  return c ? `${c.firstName} ${c.lastName}` : null;
}

function isImage(mime: string): boolean {
  return mime.startsWith("image/");
}

const PLACEHOLDER_GRADIENTS = [
  "from-wood-500/20 to-wood-700/10",
  "from-sage-500/20 to-sage-700/10",
  "from-clay-500/20 to-clay-700/10",
  "from-plum-500/20 to-plum-700/10",
];

function gradientForFile(index: number): string {
  return PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length];
}

/* -------------------------------------------------------------------------- */
/*  Page component                                                             */
/* -------------------------------------------------------------------------- */

type KindFilter = "all" | FileKind;

export function FilesPage() {
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");

  const kindCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of sampleFiles) counts[f.kind] = (counts[f.kind] ?? 0) + 1;
    return counts;
  }, []);

  const totalBytes = useMemo(
    () => sampleFiles.reduce((sum, f) => sum + f.sizeBytes, 0),
    [],
  );

  const filtered = useMemo(() => {
    let result = sampleFiles;
    if (kindFilter !== "all") result = result.filter((f) => f.kind === kindFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (jobName(f.jobId)?.toLowerCase().includes(q) ?? false) ||
          (customerName(f.customerId)?.toLowerCase().includes(q) ?? false),
      );
    }
    return [...result].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [query, kindFilter]);

  return (
    <DashboardShell activeNavId="files">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-wood-300/80">
              FILES &amp; PHOTOS
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">
              {sampleFiles.length} files
            </h1>
            <p className="mt-1.5 text-sm text-ink-400">
              {formatBytes(totalBytes)} total · {kindCounts.photo ?? 0} photos ·{" "}
              {kindCounts.contract ?? 0} contracts · {kindCounts.receipt ?? 0} receipts
            </p>
          </div>
          <Button href="#" icon={<IconCamera />}>
            Upload
          </Button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MiniKpi label="Total files" value={`${sampleFiles.length}`} tone="wood" />
          <MiniKpi label="Photos" value={`${kindCounts.photo ?? 0}`} tone="sage" />
          <MiniKpi label="Storage used" value={formatBytes(totalBytes)} tone="neutral" />
          <MiniKpi label="Linked to jobs" value={`${sampleFiles.filter((f) => f.jobId).length}`} tone="clay" />
        </div>

        {/* Search + kind filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500">
              <IconSearch className="h-[1.05rem] w-[1.05rem]" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, job, or customer…"
              className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-11 pr-4 text-sm text-ink-100 placeholder:text-ink-500 focus:border-wood-400/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-wood-400/20"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <KindPill
              active={kindFilter === "all"}
              onClick={() => setKindFilter("all")}
              count={sampleFiles.length}
            >
              All
            </KindPill>
            {(["photo", "document", "contract", "receipt", "other"] as const).map((kind) => {
              const count = kindCounts[kind] ?? 0;
              if (count === 0) return null;
              return (
                <KindPill
                  key={kind}
                  active={kindFilter === kind}
                  onClick={() => setKindFilter(kind)}
                  count={count}
                  color={KIND_TONES[kind].color}
                >
                  {FILE_KIND_LABELS[kind]}
                </KindPill>
              );
            })}
          </div>
        </div>

        {/* Gallery grid */}
        {filtered.length === 0 ? (
          <Card className="px-5 py-16 text-center">
            <p className="text-sm text-ink-400">No files match your filters.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((file, idx) => (
              <FileCard key={file.id} file={file} index={idx} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function FileCard({ file, index }: { file: (typeof sampleFiles)[number]; index: number }) {
  const tone = KIND_TONES[file.kind];
  const job = jobName(file.jobId);
  const customer = customerName(file.customerId);
  const image = isImage(file.mimeType);

  return (
    <Card className="group overflow-hidden transition hover:border-white/[0.12] hover:bg-white/[0.04]">
      {/* Thumbnail area */}
      <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${gradientForFile(index)}`}>
        {image ? (
          <div className="flex h-full w-full items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/30 text-ink-300 backdrop-blur-sm">
              <IconCamera className="h-6 w-6" />
            </span>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/30 text-ink-300 backdrop-blur-sm">
                <IconFolder className="h-6 w-6" />
              </span>
              <span className="text-xs font-medium uppercase tracking-wider text-ink-400">
                {file.mimeType.split("/").pop()}
              </span>
            </div>
          </div>
        )}
        {/* Kind badge */}
        <span
          className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium backdrop-blur-sm"
          style={{ backgroundColor: tone.bg, color: tone.color }}
        >
          {FILE_KIND_LABELS[file.kind]}
        </span>
        {/* Size badge */}
        <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[0.65rem] font-medium text-ink-300 backdrop-blur-sm">
          {formatBytes(file.sizeBytes)}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="truncate text-sm font-semibold text-ink-100 group-hover:text-white">
          {file.name}
        </p>
        <div className="mt-1.5 space-y-0.5">
          {job && (
            <p className="truncate text-xs text-ink-400">
              <span className="text-ink-600">Job:</span>{" "}
              <Link
                href={file.jobId ? `/jobs/${file.jobId}` : "#"}
                className="text-wood-300/80 hover:text-wood-200"
              >
                {job}
              </Link>
            </p>
          )}
          {customer && !job && (
            <p className="truncate text-xs text-ink-400">
              <span className="text-ink-600">Customer:</span>{" "}
              <Link
                href={file.customerId ? `/customers/${file.customerId}` : "#"}
                className="text-wood-300/80 hover:text-wood-200"
              >
                {customer}
              </Link>
            </p>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-3">
          <span className="text-[0.7rem] text-ink-600">{formatDate(file.createdAt)}</span>
          <svg
            className="h-4 w-4 text-ink-600 transition group-hover:translate-x-0.5 group-hover:text-ink-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Card>
  );
}

function MiniKpi({ label, value, tone }: { label: string; value: string; tone: "wood" | "sage" | "clay" | "neutral" }) {
  const tones = {
    wood: "text-wood-200",
    sage: "text-sage-300",
    clay: "text-clay-300",
    neutral: "text-ink-200",
  };
  return (
    <Card className="px-4 py-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">{label}</p>
      <p className={`mt-1 text-lg font-bold ${tones[tone]}`}>{value}</p>
    </Card>
  );
}

function KindPill({
  active,
  onClick,
  count,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-white/[0.08] text-ink-100 ring-1 ring-white/15"
          : "text-ink-400 hover:bg-white/[0.04] hover:text-ink-200"
      }`}
    >
      {color && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />}
      {children}
      <span className="text-ink-600">{count}</span>
    </button>
  );
}
