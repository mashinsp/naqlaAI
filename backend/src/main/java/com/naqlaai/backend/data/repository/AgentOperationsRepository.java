package com.naqlaai.backend.data.repository;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class AgentOperationsRepository {

	private final NamedParameterJdbcTemplate jdbcTemplate;

	public AgentOperationsRepository(NamedParameterJdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public Optional<Long> findShipmentIdByTrackingNumber(String trackingNumber) {
		String sql = """
			SELECT id
			FROM shipments
			WHERE tracking_number = :tracking
			  AND deleted_at IS NULL
			""";
		List<Long> ids = jdbcTemplate.queryForList(
			sql,
			new MapSqlParameterSource("tracking", trackingNumber),
			Long.class
		);
		return ids.stream().findFirst();
	}

	public int assignDriver(Long shipmentId, Long driverId) {
		String sql = """
			UPDATE shipments
			SET driver_id = :driverId,
			    updated_at = NOW()
			WHERE id = :shipmentId
			  AND deleted_at IS NULL
			""";
		return jdbcTemplate.update(sql, new MapSqlParameterSource()
			.addValue("shipmentId", shipmentId)
			.addValue("driverId", driverId));
	}

	public int addShipmentNote(Long shipmentId, String note) {
		String sql = """
			UPDATE shipments
			SET notes = CONCAT(COALESCE(notes, ''), CASE WHEN COALESCE(notes, '') = '' THEN '' ELSE E'\\n' END, :note),
			    updated_at = NOW()
			WHERE id = :shipmentId
			  AND deleted_at IS NULL
			""";
		return jdbcTemplate.update(sql, new MapSqlParameterSource()
			.addValue("shipmentId", shipmentId)
			.addValue("note", note));
	}

	public void insertAction(
		Long shipmentId,
		String actionType,
		Map<String, Object> payload,
		String performedBy,
		String status
	) {
		String sql = """
			INSERT INTO agent_actions (shipment_id, action_type, action_payload, performed_by, action_status, created_at)
			VALUES (:shipmentId, :actionType, CAST(:payload AS jsonb), :performedBy, :status, NOW())
			""";
		jdbcTemplate.update(
			sql,
			new MapSqlParameterSource()
				.addValue("shipmentId", shipmentId)
				.addValue("actionType", actionType)
				.addValue("payload", JsonUtil.toJson(payload))
				.addValue("performedBy", performedBy)
				.addValue("status", status)
		);
	}

	public void insertAlert(Long shipmentId, String type, String severity, String message) {
		String sql = """
			INSERT INTO alerts (shipment_id, alert_type, severity, message, status, created_at)
			VALUES (:shipmentId, :type, :severity, :message, 'OPEN', NOW())
			""";
		jdbcTemplate.update(sql, new MapSqlParameterSource()
			.addValue("shipmentId", shipmentId)
			.addValue("type", type)
			.addValue("severity", severity)
			.addValue("message", message));
	}

	public List<Map<String, Object>> delayedShipmentsForMonitoring() {
		String sql = """
			SELECT s.id, s.tracking_number, s.current_city, s.eta_at
			FROM shipments s
			WHERE s.deleted_at IS NULL
			  AND s.status IN ('PENDING', 'IN_TRANSIT', 'DELAYED')
			  AND s.eta_at < NOW()
			ORDER BY s.eta_at ASC
			LIMIT 200
			""";
		return jdbcTemplate.queryForList(sql, new MapSqlParameterSource());
	}

	private static final class JsonUtil {
		private JsonUtil() {
		}

		private static String toJson(Map<String, Object> payload) {
			StringBuilder builder = new StringBuilder("{");
			boolean first = true;
			for (var entry : payload.entrySet()) {
				if (!first) {
					builder.append(",");
				}
				first = false;
				builder.append("\"").append(entry.getKey().replace("\"", "")).append("\":");
				Object value = entry.getValue();
				if (value == null) {
					builder.append("null");
				} else if (value instanceof Number || value instanceof Boolean) {
					builder.append(value);
				} else {
					builder.append("\"").append(String.valueOf(value).replace("\"", "\\\"")).append("\"");
				}
			}
			builder.append("}");
			return builder.toString();
		}
	}
}
