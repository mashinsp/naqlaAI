package com.naqlaai.backend.core;

import java.time.OffsetDateTime;

public record ShipmentQueryFilter(
	String status,
	String city,
	Long driverId,
	OffsetDateTime etaFrom,
	OffsetDateTime etaTo,
	String search,
	int page,
	int size
) {
}
