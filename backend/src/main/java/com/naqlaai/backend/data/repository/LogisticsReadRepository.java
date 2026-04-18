package com.naqlaai.backend.data.repository;

import com.naqlaai.backend.api.dto.AlertResponse;
import com.naqlaai.backend.api.dto.DashboardKpiResponse;
import com.naqlaai.backend.api.dto.DriverMetricResponse;
import com.naqlaai.backend.api.dto.LiveEventResponse;
import com.naqlaai.backend.api.dto.RouteSummaryResponse;
import com.naqlaai.backend.api.dto.ShipmentDetailsResponse;
import com.naqlaai.backend.api.dto.ShipmentListItemResponse;
import com.naqlaai.backend.api.dto.ShipmentMapItemResponse;
import com.naqlaai.backend.core.ShipmentQueryFilter;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

@Repository
public class LogisticsReadRepository {

	private final NamedParameterJdbcTemplate jdbcTemplate;

	public LogisticsReadRepository(NamedParameterJdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public long countShipments(ShipmentQueryFilter filter, String regionCity) {
		String sql = """
			SELECT COUNT(*)
			FROM shipments s
			JOIN warehouses ow ON ow.id = s.origin_warehouse_id
			JOIN warehouses dw ON dw.id = s.destination_warehouse_id
			WHERE s.deleted_at IS NULL
			  AND s.status = COALESCE(:status, s.status)
			  AND s.current_city = COALESCE(:city, s.current_city)
			  AND s.driver_id IS NOT DISTINCT FROM COALESCE(:driverId, s.driver_id)
			  AND s.eta_at >= COALESCE(:etaFrom, s.eta_at)
			  AND s.eta_at <= COALESCE(:etaTo, s.eta_at)
			  AND (
			       COALESCE(:search, '') = ''
			       OR s.tracking_number ILIKE :search
			       OR COALESCE(s.reference_number, '') ILIKE :search
			  )
			  AND (
			       COALESCE(:regionCity, '') = ''
			       OR s.current_city = :regionCity
			       OR ow.city = :regionCity
			       OR dw.city = :regionCity
			  )
			""";
		return jdbcTemplate.queryForObject(sql, shipmentParams(filter, regionCity), Long.class);
	}

	public List<ShipmentListItemResponse> findShipments(ShipmentQueryFilter filter, String regionCity) {
		String sql = """
			SELECT s.id,
			       s.tracking_number,
			       s.status,
			       s.priority,
			       s.current_city,
			       ow.city AS origin_city,
			       dw.city AS destination_city,
			       d.full_name AS driver_name,
			       s.eta_at
			FROM shipments s
			JOIN warehouses ow ON ow.id = s.origin_warehouse_id
			JOIN warehouses dw ON dw.id = s.destination_warehouse_id
			LEFT JOIN drivers d ON d.id = s.driver_id
			WHERE s.deleted_at IS NULL
			  AND s.status = COALESCE(:status, s.status)
			  AND s.current_city = COALESCE(:city, s.current_city)
			  AND s.driver_id IS NOT DISTINCT FROM COALESCE(:driverId, s.driver_id)
			  AND s.eta_at >= COALESCE(:etaFrom, s.eta_at)
			  AND s.eta_at <= COALESCE(:etaTo, s.eta_at)
			  AND (
			       COALESCE(:search, '') = ''
			       OR s.tracking_number ILIKE :search
			       OR COALESCE(s.reference_number, '') ILIKE :search
			  )
			  AND (
			       COALESCE(:regionCity, '') = ''
			       OR s.current_city = :regionCity
			       OR ow.city = :regionCity
			       OR dw.city = :regionCity
			  )
			ORDER BY s.created_at DESC
			LIMIT :limit OFFSET :offset
			""";
		return jdbcTemplate.query(sql, shipmentParams(filter, regionCity), SHIPMENT_LIST_MAPPER);
	}

	public Optional<ShipmentDetailsResponse> findShipmentById(Long id, String regionCity) {
		String sql = """
			SELECT s.id,
			       s.tracking_number,
			       s.reference_number,
			       s.status,
			       s.priority,
			       s.current_city,
			       r.code AS route_code,
			       ow.name AS origin_warehouse,
			       dw.name AS destination_warehouse,
			       d.full_name AS driver_name,
			       s.scheduled_pickup_at,
			       s.eta_at,
			       s.delivered_at,
			       s.last_location_lat,
			       s.last_location_lng,
			       s.notes
			FROM shipments s
			JOIN routes r ON r.id = s.route_id
			JOIN warehouses ow ON ow.id = s.origin_warehouse_id
			JOIN warehouses dw ON dw.id = s.destination_warehouse_id
			LEFT JOIN drivers d ON d.id = s.driver_id
			WHERE s.id = :id
			  AND s.deleted_at IS NULL
			  AND (
			       COALESCE(:regionCity, '') = ''
			       OR s.current_city = :regionCity
			       OR ow.city = :regionCity
			       OR dw.city = :regionCity
			  )
			""";
		List<ShipmentDetailsResponse> results = jdbcTemplate.query(
			sql,
			new MapSqlParameterSource()
				.addValue("id", id)
				.addValue("regionCity", regionCity),
			SHIPMENT_DETAILS_MAPPER
		);
		return results.stream().findFirst();
	}

	public List<DriverMetricResponse> driverMetrics(String regionCity) {
		String sql = """
			SELECT d.id AS driver_id,
			       d.full_name AS driver_name,
			       d.city,
			       COUNT(s.id) FILTER (WHERE s.deleted_at IS NULL) AS assigned_shipments,
			       COUNT(s.id) FILTER (WHERE s.status = 'DELAYED' AND s.deleted_at IS NULL) AS delayed_shipments,
			       CASE
			           WHEN COUNT(s.id) FILTER (WHERE s.deleted_at IS NULL) = 0 THEN 0
			           ELSE ROUND(
			               100.0 * COUNT(s.id) FILTER (WHERE s.status IN ('DELIVERED', 'IN_TRANSIT') AND s.deleted_at IS NULL)
			               / COUNT(s.id) FILTER (WHERE s.deleted_at IS NULL),
			               2
			           )
			       END AS on_time_rate_percent
			FROM drivers d
			LEFT JOIN shipments s ON s.driver_id = d.id
			WHERE d.deleted_at IS NULL
			  AND (COALESCE(:regionCity, '') = '' OR d.city = :regionCity)
			GROUP BY d.id, d.full_name, d.city
			ORDER BY assigned_shipments DESC, d.full_name
			""";
		return jdbcTemplate.query(sql, new MapSqlParameterSource("regionCity", regionCity), DRIVER_METRIC_MAPPER);
	}

	public List<RouteSummaryResponse> routeSummaries(String regionCity) {
		String sql = """
			SELECT r.code AS route_code,
			       ow.city AS origin_city,
			       dw.city AS destination_city,
			       COUNT(s.id) FILTER (WHERE s.deleted_at IS NULL AND s.status IN ('PENDING', 'IN_TRANSIT')) AS active_shipments,
			       COUNT(s.id) FILTER (WHERE s.deleted_at IS NULL AND s.status = 'DELAYED') AS delayed_shipments
			FROM routes r
			JOIN warehouses ow ON ow.id = r.origin_warehouse_id
			JOIN warehouses dw ON dw.id = r.destination_warehouse_id
			LEFT JOIN shipments s ON s.route_id = r.id
			WHERE r.deleted_at IS NULL
			  AND (COALESCE(:regionCity, '') = '' OR ow.city = :regionCity OR dw.city = :regionCity)
			GROUP BY r.code, ow.city, dw.city
			ORDER BY delayed_shipments DESC, active_shipments DESC
			""";
		return jdbcTemplate.query(sql, new MapSqlParameterSource("regionCity", regionCity), ROUTE_SUMMARY_MAPPER);
	}

	public List<RouteSummaryResponse> routeSummariesByDay(String regionCity, LocalDate day) {
		OffsetDateTime dayStart = day.atStartOfDay().atOffset(ZoneOffset.UTC);
		OffsetDateTime dayEnd = day.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);
		String sql = """
			SELECT r.code AS route_code,
			       ow.city AS origin_city,
			       dw.city AS destination_city,
			       COUNT(s.id) FILTER (WHERE s.status IN ('PENDING', 'IN_TRANSIT')) AS active_shipments,
			       COUNT(s.id) FILTER (WHERE s.status = 'DELAYED') AS delayed_shipments
			FROM routes r
			JOIN warehouses ow ON ow.id = r.origin_warehouse_id
			JOIN warehouses dw ON dw.id = r.destination_warehouse_id
			LEFT JOIN shipments s
			       ON s.route_id = r.id
			      AND s.deleted_at IS NULL
			      AND s.scheduled_pickup_at >= :dayStart
			      AND s.scheduled_pickup_at < :dayEnd
			WHERE r.deleted_at IS NULL
			  AND (COALESCE(:regionCity, '') = '' OR ow.city = :regionCity OR dw.city = :regionCity)
			GROUP BY r.code, ow.city, dw.city
			ORDER BY delayed_shipments DESC, active_shipments DESC
			""";
		return jdbcTemplate.query(
			sql,
			new MapSqlParameterSource()
				.addValue("regionCity", regionCity)
				.addValue("dayStart", dayStart)
				.addValue("dayEnd", dayEnd),
			ROUTE_SUMMARY_MAPPER
		);
	}

	public List<AlertResponse> anomalies(String regionCity) {
		String sql = """
			SELECT a.id,
			       a.shipment_id,
			       s.tracking_number,
			       a.alert_type,
			       a.severity,
			       a.message,
			       a.status,
			       a.created_at
			FROM alerts a
			LEFT JOIN shipments s ON s.id = a.shipment_id
			LEFT JOIN warehouses ow ON ow.id = s.origin_warehouse_id
			LEFT JOIN warehouses dw ON dw.id = s.destination_warehouse_id
			WHERE a.deleted_at IS NULL
			  AND a.status = 'OPEN'
			  AND (
			       COALESCE(:regionCity, '') = ''
			       OR s.current_city = :regionCity
			       OR ow.city = :regionCity
			       OR dw.city = :regionCity
			  )
			ORDER BY a.created_at DESC
			LIMIT 100
			""";
		return jdbcTemplate.query(sql, new MapSqlParameterSource("regionCity", regionCity), ALERT_MAPPER);
	}

	public DashboardKpiResponse dashboardKpis(String regionCity) {
		String summarySql = """
			SELECT
				COUNT(*) FILTER (WHERE s.deleted_at IS NULL) AS total_shipments,
				COUNT(*) FILTER (WHERE s.deleted_at IS NULL AND s.status IN ('DELIVERED', 'IN_TRANSIT')) AS on_time_shipments,
				COUNT(*) FILTER (WHERE s.deleted_at IS NULL AND s.status = 'DELAYED') AS delayed_shipments,
				COUNT(DISTINCT s.route_id) FILTER (WHERE s.deleted_at IS NULL AND s.status IN ('IN_TRANSIT', 'PENDING')) AS active_routes,
				COUNT(a.id) FILTER (
					WHERE a.deleted_at IS NULL
					  AND a.status = 'OPEN'
					  AND a.created_at >= date_trunc('day', NOW())
				) AS anomalies_today
			FROM shipments s
			LEFT JOIN alerts a ON a.shipment_id = s.id
			LEFT JOIN warehouses ow ON ow.id = s.origin_warehouse_id
			LEFT JOIN warehouses dw ON dw.id = s.destination_warehouse_id
			WHERE s.deleted_at IS NULL
			  AND (
			       COALESCE(:regionCity, '') = ''
			       OR s.current_city = :regionCity
			       OR ow.city = :regionCity
			       OR dw.city = :regionCity
			  )
			""";

		MapSqlParameterSource params = new MapSqlParameterSource("regionCity", regionCity);
		var summary = jdbcTemplate.queryForMap(summarySql, params);
		long total = number(summary.get("total_shipments"));
		long onTime = number(summary.get("on_time_shipments"));
		double onTimeRate = total == 0 ? 0.0 : Math.round((onTime * 10000.0) / total) / 100.0;

		String trendSql = """
			SELECT to_char(date_trunc('day', s.created_at), 'Dy') AS day,
			       COUNT(*) FILTER (WHERE s.status IN ('DELIVERED', 'IN_TRANSIT')) AS on_time,
			       COUNT(*) FILTER (WHERE s.status = 'DELAYED') AS delayed
			FROM shipments s
			LEFT JOIN warehouses ow ON ow.id = s.origin_warehouse_id
			LEFT JOIN warehouses dw ON dw.id = s.destination_warehouse_id
			WHERE s.deleted_at IS NULL
			  AND s.created_at >= NOW() - INTERVAL '7 days'
			  AND (
			       COALESCE(:regionCity, '') = ''
			       OR s.current_city = :regionCity
			       OR ow.city = :regionCity
			       OR dw.city = :regionCity
			  )
			GROUP BY date_trunc('day', s.created_at)
			ORDER BY date_trunc('day', s.created_at)
			""";

		List<DashboardKpiResponse.TrendPoint> trend = jdbcTemplate.query(
			trendSql,
			params,
			(rs, rowNum) -> new DashboardKpiResponse.TrendPoint(
				rs.getString("day"),
				rs.getLong("on_time"),
				rs.getLong("delayed")
			)
		);

		return new DashboardKpiResponse(
			onTimeRate,
			number(summary.get("active_routes")),
			number(summary.get("delayed_shipments")),
			number(summary.get("anomalies_today")),
			trend
		);
	}

	public List<ShipmentMapItemResponse> shipmentMapItems(String regionCity) {
		String sql = """
			SELECT s.id AS shipment_id,
			       s.tracking_number,
			       s.status,
			       s.current_city,
			       s.last_location_lat AS current_lat,
			       s.last_location_lng AS current_lng,
			       ow.city AS origin_city,
			       ow.latitude AS origin_lat,
			       ow.longitude AS origin_lng,
			       dw.city AS destination_city,
			       dw.latitude AS destination_lat,
			       dw.longitude AS destination_lng
			FROM shipments s
			JOIN warehouses ow ON ow.id = s.origin_warehouse_id
			JOIN warehouses dw ON dw.id = s.destination_warehouse_id
			WHERE s.deleted_at IS NULL
			  AND s.status IN ('PENDING', 'IN_TRANSIT', 'DELAYED')
			  AND (
			       COALESCE(:regionCity, '') = ''
			       OR s.current_city = :regionCity
			       OR ow.city = :regionCity
			       OR dw.city = :regionCity
			  )
			ORDER BY s.created_at DESC
			LIMIT 500
			""";

		return jdbcTemplate.query(
			sql,
			new MapSqlParameterSource("regionCity", regionCity),
			(rs, rowNum) -> new ShipmentMapItemResponse(
				rs.getLong("shipment_id"),
				rs.getString("tracking_number"),
				rs.getString("status"),
				rs.getString("current_city"),
				numericToDouble(rs, "current_lat"),
				numericToDouble(rs, "current_lng"),
				rs.getString("origin_city"),
				numericToDouble(rs, "origin_lat"),
				numericToDouble(rs, "origin_lng"),
				rs.getString("destination_city"),
				numericToDouble(rs, "destination_lat"),
				numericToDouble(rs, "destination_lng")
			)
		);
	}

	public List<LiveEventResponse> recentLiveEvents(String regionCity, int limit) {
		String sql = """
			SELECT 'ALERT' AS event_type,
			       a.severity,
			       COALESCE(s.tracking_number, '-') AS tracking_number,
			       a.message,
			       a.created_at
			FROM alerts a
			LEFT JOIN shipments s ON s.id = a.shipment_id
			LEFT JOIN warehouses ow ON ow.id = s.origin_warehouse_id
			LEFT JOIN warehouses dw ON dw.id = s.destination_warehouse_id
			WHERE a.deleted_at IS NULL
			  AND a.status = 'OPEN'
			  AND (
			       COALESCE(:regionCity, '') = ''
			       OR s.current_city = :regionCity
			       OR ow.city = :regionCity
			       OR dw.city = :regionCity
			  )
			ORDER BY a.created_at DESC
			LIMIT :limit
			""";
		return jdbcTemplate.query(
			sql,
			new MapSqlParameterSource()
				.addValue("regionCity", regionCity)
				.addValue("limit", Math.max(1, Math.min(limit, 100))),
			(rs, rowNum) -> new LiveEventResponse(
				rs.getString("event_type"),
				rs.getString("severity"),
				rs.getString("tracking_number"),
				rs.getString("message"),
				rs.getObject("created_at", java.time.OffsetDateTime.class)
			)
		);
	}

	private long number(Object value) {
		return value == null ? 0L : ((Number) value).longValue();
	}

	private static Double numericToDouble(ResultSet rs, String column) throws SQLException {
		BigDecimal value = rs.getBigDecimal(column);
		return value == null ? null : value.doubleValue();
	}

	private MapSqlParameterSource shipmentParams(ShipmentQueryFilter filter, String regionCity) {
		int safeSize = Math.max(1, Math.min(filter.size(), 100));
		int safePage = Math.max(0, filter.page());
		return new MapSqlParameterSource()
			.addValue("status", filter.status())
			.addValue("city", filter.city())
			.addValue("driverId", filter.driverId())
			.addValue("etaFrom", filter.etaFrom())
			.addValue("etaTo", filter.etaTo())
			.addValue("search", filter.search() == null ? null : "%" + filter.search().trim() + "%")
			.addValue("regionCity", regionCity)
			.addValue("limit", safeSize)
			.addValue("offset", (long) safePage * safeSize);
	}

	private static final RowMapper<ShipmentListItemResponse> SHIPMENT_LIST_MAPPER = (rs, rowNum) ->
		new ShipmentListItemResponse(
			rs.getLong("id"),
			rs.getString("tracking_number"),
			rs.getString("status"),
			rs.getString("priority"),
			rs.getString("current_city"),
			rs.getString("origin_city"),
			rs.getString("destination_city"),
			rs.getString("driver_name"),
			rs.getObject("eta_at", java.time.OffsetDateTime.class)
		);

	private static final RowMapper<ShipmentDetailsResponse> SHIPMENT_DETAILS_MAPPER = (rs, rowNum) ->
		new ShipmentDetailsResponse(
			rs.getLong("id"),
			rs.getString("tracking_number"),
			rs.getString("reference_number"),
			rs.getString("status"),
			rs.getString("priority"),
			rs.getString("current_city"),
			rs.getString("route_code"),
			rs.getString("origin_warehouse"),
			rs.getString("destination_warehouse"),
			rs.getString("driver_name"),
			rs.getObject("scheduled_pickup_at", java.time.OffsetDateTime.class),
			rs.getObject("eta_at", java.time.OffsetDateTime.class),
			rs.getObject("delivered_at", java.time.OffsetDateTime.class),
			numericToDouble(rs, "last_location_lat"),
			numericToDouble(rs, "last_location_lng"),
			rs.getString("notes")
		);

	private static final RowMapper<DriverMetricResponse> DRIVER_METRIC_MAPPER = (rs, rowNum) ->
		new DriverMetricResponse(
			rs.getLong("driver_id"),
			rs.getString("driver_name"),
			rs.getString("city"),
			rs.getLong("assigned_shipments"),
			rs.getLong("delayed_shipments"),
			rs.getDouble("on_time_rate_percent")
		);

	private static final RowMapper<RouteSummaryResponse> ROUTE_SUMMARY_MAPPER = (rs, rowNum) ->
		new RouteSummaryResponse(
			rs.getString("route_code"),
			rs.getString("origin_city"),
			rs.getString("destination_city"),
			rs.getLong("active_shipments"),
			rs.getLong("delayed_shipments")
		);

	private static final RowMapper<AlertResponse> ALERT_MAPPER = (rs, rowNum) ->
		new AlertResponse(
			rs.getLong("id"),
			rs.getLong("shipment_id"),
			rs.getString("tracking_number"),
			rs.getString("alert_type"),
			rs.getString("severity"),
			rs.getString("message"),
			rs.getString("status"),
			rs.getObject("created_at", java.time.OffsetDateTime.class)
		);
}
