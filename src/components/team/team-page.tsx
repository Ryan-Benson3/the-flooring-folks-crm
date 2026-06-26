"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button, Card, Chip } from "@/components/dashboard/ui";
import { IconUserPlus, IconCheck, IconClock } from "@/components/dashboard/icons";
import {
  sampleMembers,
  sampleProfiles,
  sampleOrganization,
  sampleSupportGrants,
} from "@/lib/sample-data";
import type { OrgRole } from "@/lib/domain";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const ROLE_LABELS: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  bookkeeper: "Bookkeeper",
};

const ROLE_TONES: Record<OrgRole, "wood" | "sage" | "clay" | "neutral"> = {
  owner: "wood",
  admin: "sage",
  member: "neutral",
  bookkeeper: "clay",
};

const ROLE_PERMISSIONS: Record<OrgRole, string[]> = {
  owner: ["Full access", "Manage billing", "Invite & remove", "Delete org"],
  admin: ["All except billing", "Invite members", "Manage settings", "Edit all records"],
  member: ["View all", "Edit assigned jobs", "Create estimates/invoices", "Upload files"],
  bookkeeper: ["View reports", "Manage expenses", "Approve receipts", "View invoices"],
};

function profileFor(profileId: string) {
  return sampleProfiles.find((p) => p.id === profileId);
}

function initials(first: string, last: string): string {
  return `${first[0]}${last[0]}`.toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatScope(scope: string): string[] {
  return scope.split(",").map((s) => s.trim());
}

/* -------------------------------------------------------------------------- */
/*  Page component                                                             */
/* -------------------------------------------------------------------------- */

export function TeamPage() {
  return (
    <DashboardShell activeNavId="roles">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-wood-300/80">
              TEAM &amp; ROLES
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">
              {sampleMembers.length} team members
            </h1>
            <p className="mt-1.5 text-sm text-ink-400">
              {sampleOrganization.name} · Manage who has access and what they can do
            </p>
          </div>
          <Button href="#" icon={<IconUserPlus />}>
            Invite member
          </Button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MiniKpi label="Members" value={`${sampleMembers.length}`} tone="wood" />
          <MiniKpi label="Admins" value={`${sampleMembers.filter((m) => m.role === "admin" || m.role === "owner").length}`} tone="sage" />
          <MiniKpi label="Active roles" value="4" tone="neutral" />
          <MiniKpi label="Support grants" value={`${sampleSupportGrants.filter((g) => g.status === "active").length}`} tone="clay" />
        </div>

        {/* Team members */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-300">Team members</h2>
          <div className="space-y-3">
            {sampleMembers.map((member) => {
              const profile = profileFor(member.profileId);
              if (!profile) return null;
              return (
                <Card key={member.id} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Identity */}
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-wood-300 to-wood-600 text-sm font-bold text-ink-950">
                        {initials(profile.firstName, profile.lastName)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-100">
                          {profile.firstName} {profile.lastName}
                        </p>
                        <p className="truncate text-xs text-ink-400">{profile.email}</p>
                      </div>
                    </div>

                    {/* Role + joined date */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-600">
                          Joined
                        </p>
                        <p className="text-xs text-ink-300">{formatDate(member.createdAt)}</p>
                      </div>
                      <Chip tone={ROLE_TONES[member.role]} dot>
                        {ROLE_LABELS[member.role]}
                      </Chip>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Role permissions matrix */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-300">Role permissions</h2>
          <Card className="overflow-hidden">
            <div className="hidden grid-cols-[1fr_3fr] gap-4 border-b border-white/[0.05] px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-600 sm:grid">
              <span>Role</span>
              <span>Permissions</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {(Object.keys(ROLE_LABELS) as OrgRole[]).map((role) => (
                <div
                  key={role}
                  className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[1fr_3fr] sm:items-start sm:gap-4"
                >
                  <div className="flex items-center gap-2">
                    <Chip tone={ROLE_TONES[role]} dot>
                      {ROLE_LABELS[role]}
                    </Chip>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ROLE_PERMISSIONS[role].map((perm) => (
                      <span
                        key={perm}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1 text-xs text-ink-300"
                      >
                        <IconCheck className="h-3 w-3 text-sage-400" />
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Support / external access */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-300">External access</h2>
          {sampleSupportGrants.length === 0 ? (
            <Card className="px-5 py-12 text-center">
              <p className="text-sm text-ink-400">No external access grants.</p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="hidden grid-cols-[2fr_2fr_1fr_1fr] gap-4 border-b border-white/[0.05] px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-600 sm:grid">
                <span>Grantee</span>
                <span>Scope</span>
                <span>Status</span>
                <span className="text-right">Expires</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {sampleSupportGrants.map((grant) => (
                  <div
                    key={grant.id}
                    className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[2fr_2fr_1fr_1fr] sm:items-center sm:gap-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink-100">{grant.granteeEmail}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {formatScope(grant.scope).map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center rounded-md bg-white/[0.03] px-2 py-0.5 text-[0.7rem] text-ink-400"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div>
                      {grant.status === "active" ? (
                        <Chip tone="sage" dot>Active</Chip>
                      ) : (
                        <Chip tone="clay" dot>{grant.status}</Chip>
                      )}
                    </div>
                    <div className="text-left text-xs text-ink-400 sm:text-right">
                      <span className="inline-flex items-center gap-1">
                        <IconClock className="h-3 w-3 text-ink-600" />
                        {formatDate(grant.expiresAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                             */
/* -------------------------------------------------------------------------- */

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
