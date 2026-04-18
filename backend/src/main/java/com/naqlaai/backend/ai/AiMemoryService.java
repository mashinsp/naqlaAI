package com.naqlaai.backend.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.naqlaai.backend.api.dto.AiQueryResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class AiMemoryService {

	private final StringRedisTemplate redisTemplate;
	private final ObjectMapper objectMapper;
	private final Duration memoryTtl;
	private final Duration cacheTtl;

	public AiMemoryService(
		StringRedisTemplate redisTemplate,
		ObjectMapper objectMapper,
		@Value("${app.ai.memory.ttl-minutes}") long memoryTtlMinutes,
		@Value("${app.ai.cache.ttl-minutes}") long cacheTtlMinutes
	) {
		this.redisTemplate = redisTemplate;
		this.objectMapper = objectMapper;
		this.memoryTtl = Duration.ofMinutes(memoryTtlMinutes);
		this.cacheTtl = Duration.ofMinutes(cacheTtlMinutes);
	}

	public Optional<AiQueryResponse> getCachedResponse(String cacheKey) {
		String cached = redisTemplate.opsForValue().get("ai:cache:" + digest(cacheKey));
		if (cached == null || cached.isBlank()) {
			return Optional.empty();
		}
		try {
			return Optional.of(objectMapper.readValue(cached, AiQueryResponse.class));
		} catch (JsonProcessingException ex) {
			return Optional.empty();
		}
	}

	public void putCachedResponse(String cacheKey, AiQueryResponse response) {
		try {
			String value = objectMapper.writeValueAsString(response);
			redisTemplate.opsForValue().set("ai:cache:" + digest(cacheKey), value, cacheTtl);
		} catch (JsonProcessingException ex) {
			// Keep request flow healthy even if cache serialization fails.
		}
	}

	public Optional<String> getConversationContext(String conversationKey) {
		return Optional.ofNullable(redisTemplate.opsForValue().get("ai:memory:" + digest(conversationKey)));
	}

	public void saveConversationContext(String conversationKey, String value) {
		redisTemplate.opsForValue().set("ai:memory:" + digest(conversationKey), value, memoryTtl);
	}

	private String digest(String value) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(hash);
		} catch (NoSuchAlgorithmException ex) {
			throw new IllegalStateException("SHA-256 is not available", ex);
		}
	}
}
