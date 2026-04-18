package com.naqlaai.backend.api.dto;

import jakarta.validation.constraints.NotBlank;

public record AiQueryRequest(
	@NotBlank String question,
	String conversationId
) {
}
