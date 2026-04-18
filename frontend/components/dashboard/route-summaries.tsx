"use client";

import { useRouteSummaries } from "@/hooks/use-dashboard-data";

export function RouteSummaries() {
  const { data, isLoading, error } = useRouteSummaries();

  if (isLoading) return <p className="text-sm text-slate-500">Loading routes...</p>;
  if (error || !data) return <p className="text-sm text-red-600">Failed to load route summaries.</p>;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-4 text-base font-semibold">Route Summaries</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pe-4">Route</th>
              <th className="py-2 pe-4">Origin</th>
              <th className="py-2 pe-4">Destination</th>
              <th className="py-2 pe-4">Active</th>
              <th className="py-2 pe-4">Delayed</th>
            </tr>
          </thead>
          <tbody>
            {data.map((route) => (
              <tr key={route.routeCode} className="border-b border-slate-100">
                <td className="py-2 pe-4 font-medium">{route.routeCode}</td>
                <td className="py-2 pe-4">{route.originCity}</td>
                <td className="py-2 pe-4">{route.destinationCity}</td>
                <td className="py-2 pe-4">{route.activeShipments}</td>
                <td className="py-2 pe-4">{route.delayedShipments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
