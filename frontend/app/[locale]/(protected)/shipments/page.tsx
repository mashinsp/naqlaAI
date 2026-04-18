import { ShipmentTable } from "@/components/dashboard/shipment-table";

export default function ShipmentsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Shipments</h2>
      <ShipmentTable />
    </div>
  );
}
