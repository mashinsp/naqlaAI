package com.naqlaai.backend.ai;

import com.naqlaai.backend.security.AwsSecretsService;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAiConfig {

	@Bean
	@ConditionalOnProperty(prefix = "app.ai.openai", name = "enabled", havingValue = "true")
	public ChatModel chatModel(
		@Value("${app.ai.openai.api-key}") String apiKey,
		@Value("${app.ai.openai.model}") String modelName,
		@Value("${app.ai.openai.temperature}") double temperature,
		AwsSecretsService awsSecretsService
	) {
		String resolvedApiKey = (apiKey != null && !apiKey.isBlank())
			? apiKey
			: awsSecretsService.getValue("OPENAI_API_KEY").orElse("");
		if (resolvedApiKey.isBlank()) {
			throw new IllegalStateException(
				"OpenAI is enabled but no API key was provided. Set OPENAI_API_KEY or configure AWS secret."
			);
		}

		return OpenAiChatModel.builder()
			.apiKey(resolvedApiKey)
			.modelName(modelName)
			.temperature(temperature)
			.build();
	}
}
