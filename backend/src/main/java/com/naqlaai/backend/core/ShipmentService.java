package com.naqlaai.backend.core;

import com.naqlaai.backend.api.dto.AlertResponse;
import com.naqlaai.backend.api.dto.DashboardKpiResponse;
import com.naqlaai.backend.api.dto.DriverMetricResponse;
import com.naqlaai.backend.api.dto.LiveEventResponse;
import com.naqlaai.backend.api.dto.PageResponse;
import com.naqlaai.backend.api.dto.RouteSummaryResponse;
import com.naqlaai.backend.api.dto.ShipmentDetailsResponse;
import com.naqlaai.backend.api.dto.ShipmentListItemResponse;
import com.naqlaai.backend.api.dto.ShipmentMapItemResponse;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.util.List;

public interface ShipmentService {
	String sampleStatusMessage();

	PageResponse<ShipmentListItemResponse> listShipments(Authentication authentication, ShipmentQueryFilter filter);

	ShipmentDetailsResponse shipmentDetails(Authentication authentication, Long shipmentId);

	List<DriverMetricResponse> driverMetrics(Authentication authentication);

	List<RouteSummaryResponse> routeSummaries(Authentication authentication);

	List<RouteSummaryResponse> routeSummariesByDay(Authentication authentication, LocalDate day);

	List<AlertResponse> anomalies(Authentication authentication);

	DashboardKpiResponse dashboardKpis(Authentication authentication);

	List<ShipmentMapItemResponse> mapShipments(Authentication authentication);

	List<LiveEventResponse> recentEvents(Authentication authentication, int limit);
}
