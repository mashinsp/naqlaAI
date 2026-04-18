"use client";

import { useDashboardKpis } from "@/hooks/use-dashboard-data";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TrendChart() {
  const { data, isLoading, error } = useDashboardKpis();

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading trend chart...</p>;
  }
  if (error || !data) {
    return <p className="text-sm text-red-600">Failed to load trend data.</p>;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-4 text-base font-semibold">Shipment Trend (7 days)</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="onTime" stroke="#0ea5e9" strokeWidth={2} />
            <Line type="monotone" dataKey="delayed" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
