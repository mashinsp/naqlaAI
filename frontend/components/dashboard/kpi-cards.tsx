"use client";

import { useDashboardKpis } from "@/hooks/use-dashboard-data";
import { Skeleton } from "@/components/ui/skeleton";

export function KpiCards() {
  const { data, isLoading, error } = useDashboardKpis();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <article key={idx} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-9 w-20" />
            <Skeleton className="mt-3 h-3 w-full" />
          </article>
        ))}
      </div>
    );
  }
  if (error || !data) {
    return (
      <article className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Failed to load KPI data.
      </article>
    );
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
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </article>
  );
}
