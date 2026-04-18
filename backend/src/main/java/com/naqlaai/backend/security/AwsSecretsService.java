package com.naqlaai.backend.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;

import java.util.Map;
import java.util.Optional;

@Service
public class AwsSecretsService {

	private final ObjectMapper objectMapper;
	private final boolean secretsEnabled;
	private final String secretName;

	public AwsSecretsService(
		ObjectMapper objectMapper,
		@Value("${app.secrets.enabled}") boolean secretsEnabled,
		@Value("${app.secrets.secret-name}") String secretName
	) {
		this.objectMapper = objectMapper;
		this.secretsEnabled = secretsEnabled;
		this.secretName = secretName;
	}

	public Optional<String> getValue(String key) {
		if (!secretsEnabled || secretName == null || secretName.isBlank()) {
			return Optional.empty();
		}

		try (SecretsManagerClient client = SecretsManagerClient.create()) {
			String secretString = client.getSecretValue(
				GetSecretValueRequest.builder().secretId(secretName).build()
			).secretString();
			if (secretString == null || secretString.isBlank()) {
				return Optional.empty();
			}
			Map<String, String> payload = objectMapper.readValue(secretString, new TypeReference<>() {
			});
			return Optional.ofNullable(payload.get(key));
		} catch (SdkException | java.io.IOException ex) {
			return Optional.empty();
		}
	}
}
