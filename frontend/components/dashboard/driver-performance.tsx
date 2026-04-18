"use client";

import { useDriverMetrics } from "@/hooks/use-dashboard-data";

export function DriverPerformance() {
  const { data, isLoading, error } = useDriverMetrics();

  if (isLoading) return <p className="text-sm text-slate-500">Loading driver metrics...</p>;
  if (error || !data) return <p className="text-sm text-red-600">Failed to load driver metrics.</p>;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-4 text-base font-semibold">Driver Performance</h3>
      <div className="space-y-3">
        {data.map((driver) => (
          <article key={driver.driverId} className="rounded-md border border-slate-100 p-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{driver.driverName}</h4>
              <span className="text-xs text-slate-500">{driver.city}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Assigned: {driver.assignedShipments} • Delayed: {driver.delayedShipments} • On-time:{" "}
              {driver.onTimeRatePercent}%
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
