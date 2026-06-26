import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EstimateDetailPage } from "@/components/estimates/estimate-detail-page";
import { getEnrichedEstimate } from "@/lib/estimate-helpers";
import { sampleEstimates } from "@/lib/sample-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const est = sampleEstimates.find((e) => e.id === id);
  if (!est) return { title: "Estimate not found" };
  return { title: `${est.number} — The Flooring Folks CRM` };
}

export function generateStaticParams() {
  return sampleEstimates.map((e) => ({ id: e.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const estimate = getEnrichedEstimate(id);
  if (!estimate) notFound();
  return <EstimateDetailPage estimate={estimate} />;
}
