"use client";

import { useAnomalies } from "@/hooks/use-dashboard-data";
import { Skeleton } from "@/components/ui/skeleton";

function severityTone(severity: string) {
  const normalized = severity.toUpperCase();
  if (normalized === "CRITICAL") return "border-red-200 bg-red-50 text-red-700";
  if (normalized === "HIGH") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
}

export function AnomalyFeed() {
  const { data, isLoading, error } = useAnomalies();

  if (isLoading) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <article key={idx} className="rounded-md border border-slate-100 p-3">
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1 h-3 w-3/4" />
            </article>
          ))}
        </div>
      </section>
    );
  }
  if (error || !data) {
    return (
      <article className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Failed to load anomalies.
      </article>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Anomaly Feed</h3>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
          {data.length} items
        </span>
      </div>
      <div className="max-h-104 space-y-2 overflow-y-auto pe-1">
        {data.length === 0 ? (
          <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
            No anomalies right now.
          </p>
        ) : null}
        {data.map((alert) => (
          <article key={alert.id} className="rounded-md border border-slate-100 bg-slate-50/50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">{alert.trackingNumber}</p>
              <span className="text-xs text-slate-500">{new Date(alert.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-1 text-sm text-slate-700">{alert.message}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">
                {alert.alertType}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${severityTone(alert.severity)}`}>
                {alert.severity}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
