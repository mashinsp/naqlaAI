package com.naqlaai.backend.ai;

import com.naqlaai.backend.api.dto.AiActionRequest;
import com.naqlaai.backend.api.dto.AiActionResponse;
import com.naqlaai.backend.data.repository.AgentOperationsRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ActionAgentService {

	private final AgentOperationsRepository agentOperationsRepository;

	public ActionAgentService(AgentOperationsRepository agentOperationsRepository) {
		this.agentOperationsRepository = agentOperationsRepository;
	}

	public AiActionResponse handleAction(Authentication authentication, AiActionRequest request) {
		String actionType = request.actionType().trim().toUpperCase();
		boolean admin = authentication.getAuthorities().stream()
			.map(GrantedAuthority::getAuthority)
			.anyMatch("ROLE_ADMIN"::equals);

		if (!admin && !request.approved()) {
			throw new ResponseStatusException(FORBIDDEN, "Action requires explicit approval for non-admin users.");
		}

		Long shipmentId = agentOperationsRepository.findShipmentIdByTrackingNumber(request.trackingNumber())
			.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Shipment not found"));

		return switch (actionType) {
			case "REASSIGN_DRIVER" -> reassignDriver(authentication, shipmentId, request);
			case "UPDATE_ROUTE" -> updateRoute(authentication, shipmentId, request);
			case "NOTIFY_STAKEHOLDER" -> notifyStakeholder(authentication, shipmentId, request);
			default -> throw new ResponseStatusException(BAD_REQUEST, "Unsupported action type: " + actionType);
		};
	}

	private AiActionResponse reassignDriver(Authentication authentication, Long shipmentId, AiActionRequest request) {
		if (request.driverId() == null) {
			throw new ResponseStatusException(BAD_REQUEST, "driverId is required for REASSIGN_DRIVER action.");
		}
		int updated = agentOperationsRepository.assignDriver(shipmentId, request.driverId());
		if (updated == 0) {
			throw new ResponseStatusException(BAD_REQUEST, "Driver reassignment failed.");
		}

		agentOperationsRepository.insertAction(
			shipmentId,
			"REASSIGN_DRIVER",
			Map.of("driverId", request.driverId(), "note", safe(request.note())),
			authentication.getName(),
			"COMPLETED"
		);
		return new AiActionResponse("REASSIGN_DRIVER", "COMPLETED", "Driver reassigned successfully.");
	}

	private AiActionResponse updateRoute(Authentication authentication, Long shipmentId, AiActionRequest request) {
		agentOperationsRepository.addShipmentNote(
			shipmentId,
			"[AI ROUTE UPDATE] " + safe(request.note())
		);
		agentOperationsRepository.insertAction(
			shipmentId,
			"UPDATE_ROUTE",
			Map.of("note", safe(request.note())),
			authentication.getName(),
			"COMPLETED"
		);
		return new AiActionResponse("UPDATE_ROUTE", "COMPLETED", "Route update note stored.");
	}

	private AiActionResponse notifyStakeholder(Authentication authentication, Long shipmentId, AiActionRequest request) {
		String message = safe(request.note()).isBlank()
			? "Stakeholder notification requested by AI action."
			: safe(request.note());

		agentOperationsRepository.insertAlert(shipmentId, "STAKEHOLDER_NOTIFICATION", "MEDIUM", message);
		agentOperationsRepository.insertAction(
			shipmentId,
			"NOTIFY_STAKEHOLDER",
			Map.of("message", message),
			authentication.getName(),
			"COMPLETED"
		);
		return new AiActionResponse("NOTIFY_STAKEHOLDER", "COMPLETED", "Stakeholder notification alert created.");
	}

	private String safe(String value) {
		return value == null ? "" : value.trim();
	}
}
