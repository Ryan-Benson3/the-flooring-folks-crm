import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { KpiRow } from "@/components/dashboard/kpi-row";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { JobProfitability } from "@/components/dashboard/job-profitability";
import { RecentJobs } from "@/components/dashboard/recent-jobs";
import { OpenEstimates } from "@/components/dashboard/open-estimates";
import { UnpaidInvoices } from "@/components/dashboard/unpaid-invoices";
import { ReceiptsReview } from "@/components/dashboard/receipts-review";
import { ExpenseBreakdown } from "@/components/dashboard/expense-breakdown";

export default function Home() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 lg:gap-8">
        <PageHeader />
        <KpiRow />
        <QuickActions />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="flex flex-col gap-6 lg:col-span-2 lg:gap-8">
            <JobProfitability />
            <RecentJobs />
          </div>

          <div className="flex flex-col gap-6 lg:gap-8">
            <OpenEstimates />
            <UnpaidInvoices />
            <ReceiptsReview />
            <ExpenseBreakdown />
          </div>
        </div>

        <footer className="flex flex-col items-center justify-between gap-2 border-t border-white/[0.06] pt-6 text-xs text-ink-500 sm:flex-row">
          <p>The Flooring Folks · Business Cockpit · Phase 1 preview</p>
          <p>Figures are sample data — connect a data layer to go live.</p>
        </footer>
      </div>
    </DashboardShell>
  );
}
