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
import com.naqlaai.backend.data.repository.LogisticsReadRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ShipmentServiceImpl implements ShipmentService {

	private final LogisticsReadRepository logisticsReadRepository;

	public ShipmentServiceImpl(LogisticsReadRepository logisticsReadRepository) {
		this.logisticsReadRepository = logisticsReadRepository;
	}

	@Override
	public String sampleStatusMessage() {
		return "Shipment service is reachable";
	}

	@Override
	public PageResponse<ShipmentListItemResponse> listShipments(Authentication authentication, ShipmentQueryFilter filter) {
		AccessScope scope = AccessScope.from(authentication);
		String regionFilter = scope.manager() && !scope.admin() ? scope.regionCity() : null;
		List<ShipmentListItemResponse> rows = logisticsReadRepository.findShipments(filter, regionFilter);
		long total = logisticsReadRepository.countShipments(filter, regionFilter);
		return new PageResponse<>(rows, total, filter.page(), filter.size());
	}

	@Override
	public ShipmentDetailsResponse shipmentDetails(Authentication authentication, Long shipmentId) {
		AccessScope scope = AccessScope.from(authentication);
		String regionFilter = scope.manager() && !scope.admin() ? scope.regionCity() : null;
		return logisticsReadRepository.findShipmentById(shipmentId, regionFilter)
			.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Shipment not found"));
	}

	@Override
	public List<DriverMetricResponse> driverMetrics(Authentication authentication) {
		AccessScope scope = AccessScope.from(authentication);
		String regionFilter = scope.manager() && !scope.admin() ? scope.regionCity() : null;
		return logisticsReadRepository.driverMetrics(regionFilter);
	}

	@Override
	public List<RouteSummaryResponse> routeSummaries(Authentication authentication) {
		AccessScope scope = AccessScope.from(authentication);
		String regionFilter = scope.manager() && !scope.admin() ? scope.regionCity() : null;
		return logisticsReadRepository.routeSummaries(regionFilter);
	}

	@Override
	public List<RouteSummaryResponse> routeSummariesByDay(Authentication authentication, LocalDate day) {
		AccessScope scope = AccessScope.from(authentication);
		String regionFilter = scope.manager() && !scope.admin() ? scope.regionCity() : null;
		return logisticsReadRepository.routeSummariesByDay(regionFilter, day);
	}

	@Override
	public List<AlertResponse> anomalies(Authentication authentication) {
		AccessScope scope = AccessScope.from(authentication);
		String regionFilter = scope.manager() && !scope.admin() ? scope.regionCity() : null;
		return logisticsReadRepository.anomalies(regionFilter);
	}

	@Override
	public DashboardKpiResponse dashboardKpis(Authentication authentication) {
		AccessScope scope = AccessScope.from(authentication);
		String regionFilter = scope.manager() && !scope.admin() ? scope.regionCity() : null;
		return logisticsReadRepository.dashboardKpis(regionFilter);
	}

	@Override
	public List<ShipmentMapItemResponse> mapShipments(Authentication authentication) {
		AccessScope scope = AccessScope.from(authentication);
		String regionFilter = scope.manager() && !scope.admin() ? scope.regionCity() : null;
		return logisticsReadRepository.shipmentMapItems(regionFilter);
	}

	@Override
	public List<LiveEventResponse> recentEvents(Authentication authentication, int limit) {
		AccessScope scope = AccessScope.from(authentication);
		String regionFilter = scope.manager() && !scope.admin() ? scope.regionCity() : null;
		return logisticsReadRepository.recentLiveEvents(regionFilter, limit);
	}
}
