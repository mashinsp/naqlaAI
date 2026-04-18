package com.naqlaai.backend.api.dto;

public record RouteSummaryResponse(
	String routeCode,
	String originCity,
	String destinationCity,
	long activeShipments,
	long delayedShipments
) {
}
