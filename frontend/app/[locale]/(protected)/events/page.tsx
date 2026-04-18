import { LiveEventsPanel } from "@/components/dashboard/live-events-panel";

export default function EventsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Live Event Stream</h2>
      <LiveEventsPanel />
    </div>
  );
}
