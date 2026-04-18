package com.naqlaai.backend.ai;

import com.naqlaai.backend.api.dto.AlertResponse;
import com.naqlaai.backend.api.dto.DriverMetricResponse;
import com.naqlaai.backend.api.dto.RouteSummaryResponse;
import com.naqlaai.backend.api.dto.ShipmentListItemResponse;
import com.naqlaai.backend.core.ShipmentQueryFilter;
import com.naqlaai.backend.core.ShipmentService;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiToolService {

	private final ShipmentService shipmentService;
	private final ActionAgentService actionAgentService;

	public AiToolService(ShipmentService shipmentService, ActionAgentService actionAgentService) {
		this.shipmentService = shipmentService;
		this.actionAgentService = actionAgentService;
	}

	public List<ShipmentListItemResponse> queryDelayedShipments(Authentication authentication, String city) {
		var page = shipmentService.listShipments(
			authentication,
			new ShipmentQueryFilter("DELAYED", city, null, null, null, null, 0, 20)
		);
		return page.data();
	}

	public List<RouteSummaryResponse> queryRouteSummaries(Authentication authentication) {
		return shipmentService.routeSummaries(authentication);
	}

	public List<RouteSummaryResponse> queryRouteSummariesByDay(Authentication authentication, LocalDate day) {
		return shipmentService.routeSummariesByDay(authentication, day);
	}

	public List<DriverMetricResponse> queryDriverMetrics(Authentication authentication) {
		return shipmentService.driverMetrics(authentication);
	}

	public List<AlertResponse> queryAnomalies(Authentication authentication) {
		return shipmentService.anomalies(authentication);
	}

	public List<Map<String, Object>> queryShipmentCount(
		Authentication authentication,
		String city,
		String status,
		LocalDate day
	) {
		OffsetDateTime etaFrom = null;
		OffsetDateTime etaTo = null;
		if (day != null) {
			etaFrom = day.atStartOfDay().atOffset(ZoneOffset.UTC);
			etaTo = day.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);
		}

		var result = shipmentService.listShipments(
			authentication,
			new ShipmentQueryFilter(status, city, null, etaFrom, etaTo, null, 0, 1)
		);

		Map<String, Object> row = new LinkedHashMap<>();
		row.put("city", city);
		row.put("status", status);
		row.put("day", day == null ? null : day.toString());
		row.put("count", result.total());
		return List.of(row);
	}

	public ActionAgentService actionTool() {
		return actionAgentService;
	}
}
