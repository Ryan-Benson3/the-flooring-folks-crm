import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobDetailPage } from "@/components/jobs/job-detail-page";
import { getEnrichedJob } from "@/lib/job-helpers";
import { sampleJobs } from "@/lib/sample-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = sampleJobs.find((j) => j.id === id);
  if (!job) return { title: "Job not found" };
  return {
    title: `${job.title} — The Flooring Folks CRM`,
    description: `Job details, expenses, and profitability for ${job.title}.`,
  };
}

export function generateStaticParams() {
  return sampleJobs.map((j) => ({ id: j.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = getEnrichedJob(id);
  if (!job) notFound();
  return <JobDetailPage job={job} />;
}
