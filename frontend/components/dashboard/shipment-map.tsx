"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { useMapShipments } from "@/hooks/use-dashboard-data";

const ksaCenter: [number, number] = [24.7136, 46.6753];

export function ShipmentMap() {
  const { data, isLoading, error } = useMapShipments();

  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  if (isLoading) return <p className="text-sm text-slate-500">Loading map...</p>;
  if (error || !data) return <p className="text-sm text-red-600">Failed to load map data.</p>;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-4 text-base font-semibold">Live Shipment Map</h3>
      <div className="h-[420px] overflow-hidden rounded-lg">
        <MapContainer center={ksaCenter} zoom={6} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {data.map((shipment) => {
            const current = shipment.currentLat && shipment.currentLng ? [shipment.currentLat, shipment.currentLng] : null;
            const origin = shipment.originLat && shipment.originLng ? [shipment.originLat, shipment.originLng] : null;
            const destination =
              shipment.destinationLat && shipment.destinationLng ? [shipment.destinationLat, shipment.destinationLng] : null;

            return (
              <div key={shipment.shipmentId}>
                {current ? (
                  <Marker position={current as [number, number]}>
                    <Popup>
                      <strong>{shipment.trackingNumber}</strong>
                      <br />
                      {shipment.status} - {shipment.currentCity}
                    </Popup>
                  </Marker>
                ) : null}
                {origin && destination ? (
                  <Polyline positions={[origin as [number, number], destination as [number, number]]} color="#0ea5e9" />
                ) : null}
              </div>
            );
          })}
        </MapContainer>
      </div>
    </section>
  );
}
