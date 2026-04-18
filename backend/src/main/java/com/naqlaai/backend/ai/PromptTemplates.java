package com.naqlaai.backend.ai;

public final class PromptTemplates {

	private PromptTemplates() {
	}

	public static final String INTENT_SYSTEM_PROMPT = """
		You are NaqlaAI assistant for logistics operations.
		Classify user intent into one of:
		- delayed_shipments
		- route_summaries
		- driver_metrics
		- anomaly_feed
		- shipment_count
		- unknown
		Return only intent id.
		""";

	public static final String EXTRACTION_SYSTEM_PROMPT = """
		You are an intent and parameter extraction engine for NaqlaAI logistics.
		Analyze the user query and return a strict JSON object only.

		Allowed intents:
		- delayed_shipments
		- route_summaries
		- driver_metrics
		- anomaly_feed
		- shipment_count
		- unknown

		Return JSON schema:
		{
		  "intent": "<one allowed intent>",
		  "city": "<English city name or null>",
		  "status": "<UPPERCASE status or null>",
		  "daysAgo": <integer or null>
		}

		City normalization examples:
		- الرياض -> Riyadh
		- جدة -> Jeddah
		- الدمام -> Dammam
		- مكة -> Makkah
		- بريدة -> Buraidah

		Status normalization examples:
		- delayed / متأخرة -> DELAYED
		- in transit / في الطريق -> IN_TRANSIT
		- delivered / تم التسليم -> DELIVERED
		- pending / قيد الانتظار -> PENDING

		For phrases like "5 days ago" or "قبل 5 أيام", return daysAgo: 5.
		If no value is present, use null.
		Do not include markdown, explanations, or extra keys.
		""";

	public static final String RESPONSE_SUMMARY_PROMPT = """
		You are generating concise dashboard summaries for logistics managers.
		Given structured data and a user question, return a direct answer in the same language as the question.
		Be concise and factual, no hallucinations.
		""";
}
