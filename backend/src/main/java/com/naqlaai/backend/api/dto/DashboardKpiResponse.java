package com.naqlaai.backend.api.dto;

import java.util.List;

public record DashboardKpiResponse(
	double onTimeRate,
	long activeRoutes,
	long delayedShipments,
	long anomaliesToday,
	List<TrendPoint> trend
) {
	public record TrendPoint(
		String day,
		long onTime,
		long delayed
	) {
	}
}
