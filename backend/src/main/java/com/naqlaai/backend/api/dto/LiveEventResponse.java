package com.naqlaai.backend.api.dto;

import java.time.OffsetDateTime;

public record LiveEventResponse(
	String eventType,
	String severity,
	String trackingNumber,
	String message,
	OffsetDateTime timestamp
) {
}
