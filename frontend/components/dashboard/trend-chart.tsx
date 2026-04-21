"use client";

import { useDashboardKpis } from "@/hooks/use-dashboard-data";
import { Skeleton } from "@/components/ui/skeleton";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TrendChart() {
  const { data, isLoading, error } = useDashboardKpis();

  if (isLoading) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <Skeleton className="h-5 w-52" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-72 w-full" />
        </div>
      </section>
    );
  }
  if (error || !data) {
    return (
      <article className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Failed to load trend data.
      </article>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-slate-900">Shipment Trend (7 days)</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.trend}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
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
