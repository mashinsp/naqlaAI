package com.naqlaai.backend.api.dto;

public record AiActionResponse(
	String actionType,
	String status,
	String message
) {
}
