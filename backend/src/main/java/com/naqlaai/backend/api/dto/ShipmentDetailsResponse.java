package com.naqlaai.backend.api.dto;

import java.time.OffsetDateTime;

public record ShipmentDetailsResponse(
	Long id,
	String trackingNumber,
	String referenceNumber,
	String status,
	String priority,
	String currentCity,
	String routeCode,
	String originWarehouse,
	String destinationWarehouse,
	String driverName,
	OffsetDateTime scheduledPickupAt,
	OffsetDateTime etaAt,
	OffsetDateTime deliveredAt,
	Double lastLocationLat,
	Double lastLocationLng,
	String notes
) {
}
