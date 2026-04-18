import { ShipmentMap } from "@/components/dashboard/shipment-map";

export default function MapPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Shipment Map</h2>
      <ShipmentMap />
    </div>
  );
}
