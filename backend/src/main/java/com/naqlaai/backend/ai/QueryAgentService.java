package com.naqlaai.backend.ai;

import com.naqlaai.backend.api.dto.AiQueryRequest;
import com.naqlaai.backend.api.dto.AiQueryResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
public class QueryAgentService {

	private static final Logger log = LoggerFactory.getLogger(QueryAgentService.class);
	private static final String CACHE_SCHEMA_VERSION = "v2";

	private final AiToolService aiToolService;
	private final AiMemoryService aiMemoryService;
	private final LlmService llmService;

	public QueryAgentService(
		AiToolService aiToolService,
		AiMemoryService aiMemoryService,
		LlmService llmService
	) {
		this.aiToolService = aiToolService;
		this.aiMemoryService = aiMemoryService;
		this.llmService = llmService;
	}

	public AiQueryResponse handleQuery(Authentication authentication, AiQueryRequest request) {
		String normalized = request.question().trim();
		String language = isArabic(normalized) ? "ar" : "en";
		String cacheKey = CACHE_SCHEMA_VERSION + "|" + authentication.getName() + "|" + normalized.toLowerCase(Locale.ROOT);

		var cached = aiMemoryService.getCachedResponse(cacheKey);
		if (cached.isPresent()) {
			log.info("AI cache hit for user={} question='{}'", authentication.getName(), normalized);
			AiQueryResponse cachedResponse = cached.get();
			return new AiQueryResponse(
				cachedResponse.language(),
				cachedResponse.intent(),
				true,
				cachedResponse.answer(),
				cachedResponse.data()
			);
		}

		AiQueryPlan plan = resolvePlan(normalized);
		String intent = plan.intent();
		log.info(
			"AI plan resolved user={} modelAvailable={} intent={} city={} status={} daysAgo={}",
			authentication.getName(),
			llmService.isModelAvailable(),
			plan.intent(),
			plan.city(),
			plan.status(),
			plan.daysAgo()
		);
		Object data = executeIntent(authentication, plan);
		String fallbackAnswer = fallbackAnswer(intent, data, language);
		String answer = llmService.summarize(normalized, data, fallbackAnswer);
		AiQueryResponse response = new AiQueryResponse(language, intent, false, answer, data);

		aiMemoryService.putCachedResponse(cacheKey, response);
		if (request.conversationId() != null && !request.conversationId().isBlank()) {
			aiMemoryService.saveConversationContext(request.conversationId(), answer);
		}

		return response;
	}

	private AiQueryPlan resolvePlan(String question) {
		AiQueryPlan plan = llmService.extractQueryPlan(question);
		String fallbackIntent = llmService.classifyIntent(question);
		String extractedIntent = plan.intent() == null ? "unknown" : plan.intent();
		String intent = switch (extractedIntent) {
			case "delayed_shipments", "route_summaries", "driver_metrics", "anomaly_feed", "shipment_count" -> plan.intent();
			default -> fallbackIntent;
		};
		String normalizedIntent = switch (intent) {
			case "delayed_shipments", "route_summaries", "driver_metrics", "anomaly_feed", "shipment_count" -> intent;
			default -> "unknown";
		};
		if ("unknown".equals(normalizedIntent)) {
			log.warn("AI intent unresolved for question='{}'", question);
		}
		return new AiQueryPlan(
			normalizedIntent,
			normalizeCity(plan.city()),
			plan.status(),
			plan.daysAgo()
		);
	}

	private Object executeIntent(Authentication authentication, AiQueryPlan plan) {
		LocalDate requestedDay = parseRequestedDay(plan.daysAgo());
		return switch (plan.intent()) {
			case "delayed_shipments" -> aiToolService.queryDelayedShipments(authentication, plan.city());
			case "route_summaries" -> {
				if (requestedDay != null) {
					yield aiToolService.queryRouteSummariesByDay(authentication, requestedDay);
				}
				yield aiToolService.queryRouteSummaries(authentication);
			}
			case "driver_metrics" -> aiToolService.queryDriverMetrics(authentication);
			case "anomaly_feed" -> aiToolService.queryAnomalies(authentication);
			case "shipment_count" -> aiToolService.queryShipmentCount(authentication, plan.city(), plan.status(), requestedDay);
			default -> List.of();
		};
	}

	private LocalDate parseRequestedDay(Integer daysAgo) {
		if (daysAgo == null || daysAgo < 0) {
			return null;
		}
		return LocalDate.now().minusDays(daysAgo);
	}

	private String fallbackAnswer(String intent, Object data, String language) {
		if ("shipment_count".equals(intent) && data instanceof List<?> list && !list.isEmpty()) {
			Object row = list.getFirst();
			if (row instanceof java.util.Map<?, ?> map) {
				Object countValue = map.get("count");
				long count = (countValue instanceof Number number) ? number.longValue() : 0L;
				return language.equals("ar")
					? "عدد الشحنات هو " + count + "."
					: "Shipment count is " + count + ".";
			}
		}

		if (data instanceof List<?> list) {
			return language.equals("ar")
				? "تم العثور على " + list.size() + " نتائج لطلبك."
				: "Found " + list.size() + " results for your request.";
		}
		return language.equals("ar")
			? "لم أفهم الطلب بالكامل. جرّب سؤالاً عن الشحنات المتأخرة أو عدد الشحنات أو المسارات."
			: "I could not fully map the request. Try asking about delayed shipments, shipment count, or routes.";
	}

	private String normalizeCity(String city) {
		if (city == null || city.isBlank()) {
			return null;
		}
		String lower = city.trim().toLowerCase(Locale.ROOT);
		return switch (lower) {
			case "riyadh", "الرياض" -> "Riyadh";
			case "jeddah", "جدة" -> "Jeddah";
			case "dammam", "الدمام" -> "Dammam";
			case "makkah", "mecca", "مكة", "مكه" -> "Makkah";
			case "buraidah", "buraydah", "بريدة" -> "Buraidah";
			default -> city.trim();
		};
	}

	private boolean isArabic(String text) {
		return text.chars().anyMatch(c -> Character.UnicodeBlock.of(c) == Character.UnicodeBlock.ARABIC);
	}
}
