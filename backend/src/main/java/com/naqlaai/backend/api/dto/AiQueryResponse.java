package com.naqlaai.backend.api.dto;

public record AiQueryResponse(
	String language,
	String intent,
	boolean fromCache,
	String answer,
	Object data
) {
}
