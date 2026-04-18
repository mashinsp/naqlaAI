import { DriverPerformance } from "@/components/dashboard/driver-performance";

export default function DriversPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Driver Performance</h2>
      <DriverPerformance />
    </div>
  );
}
