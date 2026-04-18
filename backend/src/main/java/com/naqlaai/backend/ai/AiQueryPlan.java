package com.naqlaai.backend.ai;

public record AiQueryPlan(
	String intent,
	String city,
	String status,
	Integer daysAgo
) {
	public static AiQueryPlan unknown() {
		return new AiQueryPlan("unknown", null, null, null);
	}

	public AiQueryPlan withIntent(String value) {
		return new AiQueryPlan(value, city, status, daysAgo);
	}
}
