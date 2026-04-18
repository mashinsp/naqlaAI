package com.naqlaai.backend.api.dto;

import jakarta.validation.constraints.NotBlank;

public record AiActionRequest(
	@NotBlank String actionType,
	@NotBlank String trackingNumber,
	Long driverId,
	String note,
	boolean approved
) {
}
