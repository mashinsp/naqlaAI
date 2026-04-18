import { AnomalyFeed } from "@/components/dashboard/anomaly-feed";

export default function AlertsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Anomalies and Alerts</h2>
      <AnomalyFeed />
    </div>
  );
}
