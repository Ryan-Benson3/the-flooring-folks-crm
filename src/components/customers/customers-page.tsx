"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button, Card } from "@/components/dashboard/ui";
import { IconPlus, IconSearch } from "@/components/dashboard/icons";
import {
  getEnrichedCustomers,
  searchCustomers,
  type CustomerEnriched,
} from "@/lib/customer-helpers";
import { formatCurrency, formatCurrencyCompact } from "@/lib/domain";

export function CustomersPage() {
  const allCustomers = useMemo(() => getEnrichedCustomers(), []);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "revenue" | "recent">("recent");

  const filtered = useMemo(() => {
    let result = searchCustomers(allCustomers, query);
    switch (sortBy) {
      case "name":
        result = [...result].sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`,
          ),
        );
        break;
      case "revenue":
        result = [...result].sort(
          (a, b) => b.totalRevenueCents - a.totalRevenueCents,
        );
        break;
      case "recent":
        result = [...result].sort(
          (a, b) =>
            new Date(b.lastActivity ?? 0).getTime() -
            new Date(a.lastActivity ?? 0).getTime(),
        );
        break;
    }
    return result;
  }, [allCustomers, query, sortBy]);

  const totalRevenue = allCustomers.reduce(
    (s, c) => s + c.totalRevenueCents,
    0,
  );
  const totalOutstanding = allCustomers.reduce(
    (s, c) => s + c.outstandingCents,
    0,
  );

  return (
    <DashboardShell activeNavId="customers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-wood-300/80">
              CUSTOMERS
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">
              {allCustomers.length} customers
            </h1>
            <p className="mt-1.5 text-sm text-ink-400">
              {formatCurrency(totalRevenue)} lifetime revenue ·{" "}
              <span className="text-clay-300">
                {formatCurrency(totalOutstanding)} outstanding
              </span>
            </p>
          </div>
          <Button href="#" icon={<IconPlus />}>
            Add customer
          </Button>
        </div>

        {/* Search + sort bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500">
              <IconSearch className="h-[1.05rem] w-[1.05rem]" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, phone, or address…"
              className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-11 pr-4 text-sm text-ink-100 placeholder:text-ink-500 focus:border-wood-400/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-wood-400/20"
            />
          </label>
          <div className="flex items-center gap-2">
            {(["recent", "name", "revenue"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ${
                  sortBy === key
                    ? "bg-wood-500/15 text-wood-200 ring-1 ring-wood-400/25"
                    : "text-ink-400 hover:bg-white/[0.05] hover:text-ink-200"
                }`}
              >
                {key === "recent"
                  ? "Recent"
                  : key === "name"
                    ? "Name"
                    : "Revenue"}
              </button>
            ))}
          </div>
        </div>

        {/* Customer table */}
        <Card className="overflow-hidden">
          {/* Desktop table header */}
          <div className="hidden grid-cols-[2fr_1.5fr_1fr_1fr_1fr_0.5fr] gap-4 border-b border-white/[0.06] px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-500 md:grid">
            <span>Customer</span>
            <span>Contact</span>
            <span className="text-right">Revenue</span>
            <span className="text-right">Outstanding</span>
            <span>Jobs</span>
            <span></span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/[0.04]">
            {filtered.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <p className="text-sm text-ink-400">
                  No customers match &ldquo;{query}&rdquo;
                </p>
              </div>
            ) : (
              filtered.map((c) => (
                <CustomerRow key={c.id} customer={c} />
              ))
            )}
          </div>
        </Card>

        {filtered.length > 0 && (
          <p className="text-center text-xs text-ink-600">
            Showing {filtered.length} of {allCustomers.length} customers
          </p>
        )}
      </div>
    </DashboardShell>
  );
}

function CustomerRow({ customer }: { customer: CustomerEnriched }) {
  const fullName = `${customer.firstName} ${customer.lastName}`;
  const initials = `${customer.firstName[0] ?? ""}${customer.lastName[0] ?? ""}`.toUpperCase();

  return (
    <Link
      href={`/customers/${customer.id}`}
      className="group grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-white/[0.025] md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_0.5fr] md:items-center md:gap-4"
    >
      {/* Name + avatar */}
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sage-500/30 to-sage-700/30 text-sm font-bold text-sage-200 ring-1 ring-sage-400/15">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-100 group-hover:text-white">
            {fullName}
          </p>
          {customer.address && (
            <p className="truncate text-xs text-ink-500">{customer.address}</p>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="min-w-0">
        {customer.email && (
          <p className="truncate text-xs text-ink-300">{customer.email}</p>
        )}
        {customer.phone && (
          <p className="text-xs text-ink-500">
            {formatPhone(customer.phone)}
          </p>
        )}
      </div>

      {/* Revenue */}
      <div className="text-right">
        <p className="text-sm font-semibold text-sage-300">
          {formatCurrencyCompact(customer.totalRevenueCents)}
        </p>
      </div>

      {/* Outstanding */}
      <div className="text-right">
        {customer.outstandingCents > 0 ? (
          <p className="text-sm font-semibold text-clay-300">
            {formatCurrencyCompact(customer.outstandingCents)}
          </p>
        ) : (
          <p className="text-sm text-ink-600">—</p>
        )}
      </div>

      {/* Jobs */}
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-ink-300">
          {customer.jobCount} {customer.jobCount === 1 ? "job" : "jobs"}
        </span>
      </div>

      {/* Arrow */}
      <div className="hidden text-right text-ink-600 transition group-hover:text-wood-300 md:block">
        <svg
          className="ml-auto h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}
