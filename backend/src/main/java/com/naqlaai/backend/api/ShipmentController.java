package com.naqlaai.backend.api;

import com.naqlaai.backend.api.dto.AlertResponse;
import com.naqlaai.backend.api.dto.DashboardKpiResponse;
import com.naqlaai.backend.api.dto.DriverMetricResponse;
import com.naqlaai.backend.api.dto.LiveEventResponse;
import com.naqlaai.backend.api.dto.PageResponse;
import com.naqlaai.backend.api.dto.RouteSummaryResponse;
import com.naqlaai.backend.api.dto.ShipmentDetailsResponse;
import com.naqlaai.backend.api.dto.ShipmentListItemResponse;
import com.naqlaai.backend.api.dto.ShipmentMapItemResponse;
import com.naqlaai.backend.core.ShipmentQueryFilter;
import com.naqlaai.backend.core.ShipmentService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ShipmentController {

	private final ShipmentService shipmentService;

	public ShipmentController(ShipmentService shipmentService) {
		this.shipmentService = shipmentService;
	}

	@GetMapping("/shipments")
	@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
	public PageResponse<ShipmentListItemResponse> listShipments(
		Authentication authentication,
		@RequestParam(required = false) String status,
		@RequestParam(required = false) String city,
		@RequestParam(required = false) Long driverId,
		@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime etaFrom,
		@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime etaTo,
		@RequestParam(required = false) String search,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "20") int size
	) {
		ShipmentQueryFilter filter = new ShipmentQueryFilter(status, city, driverId, etaFrom, etaTo, search, page, size);
		return shipmentService.listShipments(authentication, filter);
	}

	@GetMapping("/shipments/{shipmentId}")
	@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
	public ShipmentDetailsResponse shipmentDetails(
		Authentication authentication,
		@PathVariable Long shipmentId
	) {
		return shipmentService.shipmentDetails(authentication, shipmentId);
	}

	@GetMapping("/drivers/metrics")
	@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
	public List<DriverMetricResponse> driverMetrics(Authentication authentication) {
		return shipmentService.driverMetrics(authentication);
	}

	@GetMapping("/routes/summaries")
	@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
	public List<RouteSummaryResponse> routeSummaries(Authentication authentication) {
		return shipmentService.routeSummaries(authentication);
	}

	@GetMapping("/alerts/anomalies")
	@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
	public List<AlertResponse> anomalies(Authentication authentication) {
		return shipmentService.anomalies(authentication);
	}

	@GetMapping("/dashboard/kpis")
	@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
	public DashboardKpiResponse dashboardKpis(Authentication authentication) {
		return shipmentService.dashboardKpis(authentication);
	}

	@GetMapping("/map/shipments")
	@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
	public List<ShipmentMapItemResponse> mapShipments(Authentication authentication) {
		return shipmentService.mapShipments(authentication);
	}

	@GetMapping("/events/live")
	@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
	public List<LiveEventResponse> liveEvents(
		Authentication authentication,
		@RequestParam(defaultValue = "20") int limit
	) {
		return shipmentService.recentEvents(authentication, limit);
	}
}
