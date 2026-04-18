package com.naqlaai.backend.api;

import com.naqlaai.backend.core.ShipmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class SecureController {

	private final ShipmentService shipmentService;

	public SecureController(ShipmentService shipmentService) {
		this.shipmentService = shipmentService;
	}

	@GetMapping("/secure/ping")
	public ResponseEntity<Map<String, String>> securePing(Authentication authentication) {
		return ResponseEntity.ok(
			Map.of(
				"status", "authenticated",
				"user", authentication.getName(),
				"message", shipmentService.sampleStatusMessage()
			)
		);
	}

	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping("/admin/ping")
	public ResponseEntity<Map<String, String>> adminPing(Authentication authentication) {
		return ResponseEntity.ok(
			Map.of(
				"status", "admin-only",
				"user", authentication.getName()
			)
		);
	}
}
