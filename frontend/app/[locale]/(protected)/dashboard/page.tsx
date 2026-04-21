import { AnomalyFeed } from "@/components/dashboard/anomaly-feed";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { LiveEventsPanel } from "@/components/dashboard/live-events-panel";
import { TrendChart } from "@/components/dashboard/trend-chart";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Operations Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor KPIs, shipment trends, anomalies, and live operational events in one place.
        </p>
      </section>
      <KpiCards />
      <TrendChart />
      <div className="grid gap-6 lg:grid-cols-2">
        <AnomalyFeed />
        <LiveEventsPanel />
      </div>
    </div>
  );
}
