export type TrendPoint = {
  day: string;
  onTime: number;
  delayed: number;
};

export type DashboardKpis = {
  onTimeRate: number;
  activeRoutes: number;
  delayedShipments: number;
  anomaliesToday: number;
  trend: TrendPoint[];
};

export type ShipmentItem = {
  id: number;
  trackingNumber: string;
  status: string;
  priority: string;
  currentCity: string;
  originCity: string;
  destinationCity: string;
  driverName: string | null;
  etaAt: string;
};

export type PageResponse<T> = {
  data: T[];
  total: number;
  page: number;
  size: number;
};

export type DriverMetric = {
  driverId: number;
  driverName: string;
  city: string;
  assignedShipments: number;
  delayedShipments: number;
  onTimeRatePercent: number;
};

export type RouteSummary = {
  routeCode: string;
  originCity: string;
  destinationCity: string;
  activeShipments: number;
  delayedShipments: number;
};

export type AlertItem = {
  id: number;
  shipmentId: number;
  trackingNumber: string;
  alertType: string;
  severity: string;
  message: string;
  status: string;
  createdAt: string;
};

export type MapShipment = {
  shipmentId: number;
  trackingNumber: string;
  status: string;
  currentCity: string;
  currentLat: number | null;
  currentLng: number | null;
  originCity: string;
  originLat: number | null;
  originLng: number | null;
  destinationCity: string;
  destinationLat: number | null;
  destinationLng: number | null;
};

export type LiveEvent = {
  eventType: string;
  severity: string;
  trackingNumber: string;
  message: string;
  timestamp: string;
};

export type AiQueryResponse = {
  language: "ar" | "en";
  intent: string;
  fromCache: boolean;
  answer: string;
  data: unknown;
};
