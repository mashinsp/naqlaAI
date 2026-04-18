"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProxy } from "@/lib/http";
import { AlertItem, DashboardKpis, DriverMetric, LiveEvent, MapShipment, PageResponse, RouteSummary, ShipmentItem } from "@/types/api";

export function useDashboardKpis() {
  return useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: () => fetchProxy<DashboardKpis>("dashboard/kpis"),
  });
}

export function useShipments(searchParams: URLSearchParams) {
  const path = `shipments?${searchParams.toString()}`;
  return useQuery({
    queryKey: ["shipments", path],
    queryFn: () => fetchProxy<PageResponse<ShipmentItem>>(path),
  });
}

export function useDriverMetrics() {
  return useQuery({
    queryKey: ["driver-metrics"],
    queryFn: () => fetchProxy<DriverMetric[]>("drivers/metrics"),
  });
}

export function useRouteSummaries() {
  return useQuery({
    queryKey: ["route-summaries"],
    queryFn: () => fetchProxy<RouteSummary[]>("routes/summaries"),
  });
}

export function useAnomalies() {
  return useQuery({
    queryKey: ["anomalies"],
    queryFn: () => fetchProxy<AlertItem[]>("alerts/anomalies"),
  });
}

export function useMapShipments() {
  return useQuery({
    queryKey: ["map-shipments"],
    queryFn: () => fetchProxy<MapShipment[]>("map/shipments"),
  });
}

export function useRecentEvents(limit = 20) {
  return useQuery({
    queryKey: ["events", limit],
    queryFn: () => fetchProxy<LiveEvent[]>(`events/live?limit=${limit}`),
  });
}
