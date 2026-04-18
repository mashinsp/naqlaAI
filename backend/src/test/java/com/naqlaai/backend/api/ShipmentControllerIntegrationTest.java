package com.naqlaai.backend.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.naqlaai.backend.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class ShipmentControllerIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	void managerOnlySeesRiyadhScopedShipments() throws Exception {
		String token = loginAndGetToken("manager_riyadh", "manager123");

		MvcResult result = mockMvc.perform(
				get("/api/v1/shipments")
					.header("Authorization", "Bearer " + token)
			)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.total").isNumber())
			.andReturn();

		JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
		for (JsonNode shipment : root.path("data")) {
			String origin = shipment.path("originCity").asText();
			String destination = shipment.path("destinationCity").asText();
			String current = shipment.path("currentCity").asText();
			assertThat(origin.equals("Riyadh") || destination.equals("Riyadh") || current.equals("Riyadh"))
				.isTrue();
		}
	}

	@Test
	void viewerCanReadButCannotAccessAdminEndpoint() throws Exception {
		String token = loginAndGetToken("viewer", "viewer123");

		mockMvc.perform(
				get("/api/v1/shipments")
					.header("Authorization", "Bearer " + token)
			)
			.andExpect(status().isOk());

		mockMvc.perform(
				get("/api/v1/admin/ping")
					.header("Authorization", "Bearer " + token)
			)
			.andExpect(status().isForbidden());
	}

	private String loginAndGetToken(String username, String password) throws Exception {
		String body = """
			{
			  "username": "%s",
			  "password": "%s"
			}
			""".formatted(username, password);

		MvcResult loginResult = mockMvc.perform(
				post("/api/v1/auth/login")
					.contentType(MediaType.APPLICATION_JSON)
					.content(body)
			)
			.andExpect(status().isOk())
			.andReturn();

		JsonNode root = objectMapper.readTree(loginResult.getResponse().getContentAsString());
		return root.path("token").asText();
	}
}
