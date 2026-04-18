import { AnomalyFeed } from "@/components/dashboard/anomaly-feed";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { LiveEventsPanel } from "@/components/dashboard/live-events-panel";
import { TrendChart } from "@/components/dashboard/trend-chart";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <KpiCards />
      <TrendChart />
      <div className="grid gap-6 lg:grid-cols-2">
        <AnomalyFeed />
        <LiveEventsPanel />
      </div>
    </div>
  );
}
