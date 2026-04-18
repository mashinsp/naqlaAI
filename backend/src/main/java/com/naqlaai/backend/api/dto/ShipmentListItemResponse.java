package com.naqlaai.backend.api.dto;

import java.time.OffsetDateTime;

public record ShipmentListItemResponse(
	Long id,
	String trackingNumber,
	String status,
	String priority,
	String currentCity,
	String originCity,
	String destinationCity,
	String driverName,
	OffsetDateTime etaAt
) {
}
