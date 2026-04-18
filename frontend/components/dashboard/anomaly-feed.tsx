"use client";

import { useAnomalies } from "@/hooks/use-dashboard-data";

export function AnomalyFeed() {
  const { data, isLoading, error } = useAnomalies();

  if (isLoading) return <p className="text-sm text-slate-500">Loading anomalies...</p>;
  if (error || !data) return <p className="text-sm text-red-600">Failed to load anomalies.</p>;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-4 text-base font-semibold">Anomaly Feed</h3>
      <div className="space-y-2">
        {data.map((alert) => (
          <article key={alert.id} className="rounded-md border border-slate-100 p-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">{alert.trackingNumber}</p>
              <span className="text-xs text-slate-500">{new Date(alert.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-1 text-sm text-slate-700">{alert.message}</p>
            <p className="mt-1 text-xs text-slate-500">
              {alert.alertType} • {alert.severity}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
