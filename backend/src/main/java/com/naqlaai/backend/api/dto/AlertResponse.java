package com.naqlaai.backend.api.dto;

import java.time.OffsetDateTime;

public record AlertResponse(
	Long id,
	Long shipmentId,
	String trackingNumber,
	String alertType,
	String severity,
	String message,
	String status,
	OffsetDateTime createdAt
) {
}
