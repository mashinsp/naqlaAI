"use client";

import { useDashboardKpis } from "@/hooks/use-dashboard-data";

export function KpiCards() {
  const { data, isLoading, error } = useDashboardKpis();

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading KPI data...</p>;
  }
  if (error || !data) {
    return <p className="text-sm text-red-600">Failed to load KPI data.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <KpiCard title="On-time Rate" value={`${data.onTimeRate}%`} />
      <KpiCard title="Active Routes" value={String(data.activeRoutes)} />
      <KpiCard title="Delayed Shipments" value={String(data.delayedShipments)} />
      <KpiCard title="Anomalies Today" value={String(data.anomaliesToday)} />
    </div>
  );
}

function KpiCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </article>
  );
}
