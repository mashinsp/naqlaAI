package com.naqlaai.backend.api.dto;

public record DriverMetricResponse(
	Long driverId,
	String driverName,
	String city,
	long assignedShipments,
	long delayedShipments,
	double onTimeRatePercent
) {
}
