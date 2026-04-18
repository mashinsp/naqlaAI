package com.naqlaai.backend.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class LlmService {

	private static final Logger log = LoggerFactory.getLogger(LlmService.class);

	private final ChatModel model;
	private final ObjectMapper objectMapper;

	public LlmService(ObjectProvider<ChatModel> modelProvider, ObjectMapper objectMapper) {
		this.model = modelProvider.getIfAvailable();
		this.objectMapper = objectMapper;
		log.info("LLM model initialized: {}", this.model != null);
	}

	public String classifyIntent(String question) {
		if (model == null) {
			log.warn("LLM classifyIntent fallback: model unavailable");
			return "unknown";
		}
		String output = model.chat(PromptTemplates.INTENT_SYSTEM_PROMPT + "\nQuestion: " + question);
		return output == null ? "unknown" : output.trim().toLowerCase();
	}

	public AiQueryPlan extractQueryPlan(String question) {
		if (model == null) {
			log.warn("LLM extractQueryPlan fallback: model unavailable");
			return AiQueryPlan.unknown();
		}

		String output = model.chat(PromptTemplates.EXTRACTION_SYSTEM_PROMPT + "\nQuestion: " + question);
		if (output == null || output.isBlank()) {
			return AiQueryPlan.unknown();
		}

		String json = extractJsonObject(output);
		try {
			AiQueryPlan parsed = objectMapper.readValue(json, AiQueryPlan.class);
			String intent = parsed.intent() == null ? "unknown" : parsed.intent().trim().toLowerCase(Locale.ROOT);
			String city = parsed.city() == null || parsed.city().isBlank() ? null : parsed.city().trim();
			String status = parsed.status() == null || parsed.status().isBlank()
				? null
				: parsed.status().trim().toUpperCase(Locale.ROOT);
			Integer daysAgo = parsed.daysAgo();
			if (daysAgo != null && daysAgo < 0) {
				daysAgo = null;
			}
			log.info("LLM extracted plan intent={} city={} status={} daysAgo={}", intent, city, status, daysAgo);
			return new AiQueryPlan(intent, city, status, daysAgo);
		} catch (Exception ex) {
			log.warn("LLM plan parse failed, fallback to unknown. raw={}", output);
			return AiQueryPlan.unknown();
		}
	}

	public String summarize(String question, Object data, String fallback) {
		if (model == null) {
			return fallback;
		}
		String prompt = PromptTemplates.RESPONSE_SUMMARY_PROMPT
			+ "\nQuestion: " + question
			+ "\nData: " + data
			+ "\nAnswer:";
		String output = model.chat(prompt);
		return (output == null || output.isBlank()) ? fallback : output.trim();
	}

	public boolean isModelAvailable() {
		return model != null;
	}

	private String extractJsonObject(String output) {
		Pattern codeBlock = Pattern.compile("```(?:json)?\\s*(\\{.*?\\})\\s*```", Pattern.DOTALL);
		Matcher codeBlockMatch = codeBlock.matcher(output);
		if (codeBlockMatch.find()) {
			return codeBlockMatch.group(1);
		}

		int first = output.indexOf('{');
		int last = output.lastIndexOf('}');
		if (first >= 0 && last > first) {
			return output.substring(first, last + 1);
		}
		return output;
	}
}
