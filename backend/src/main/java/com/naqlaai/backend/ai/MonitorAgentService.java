package com.naqlaai.backend.ai;

import com.naqlaai.backend.data.repository.AgentOperationsRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Service
public class MonitorAgentService {

	private final AgentOperationsRepository agentOperationsRepository;
	private final boolean monitorEnabled;

	public MonitorAgentService(
		AgentOperationsRepository agentOperationsRepository,
		@Value("${app.monitor.enabled}") boolean monitorEnabled
	) {
		this.agentOperationsRepository = agentOperationsRepository;
		this.monitorEnabled = monitorEnabled;
	}

	@Scheduled(fixedDelayString = "${app.monitor.interval-ms}")
	public void detectAnomalies() {
		if (!monitorEnabled) {
			return;
		}

		List<Map<String, Object>> delayedShipments = agentOperationsRepository.delayedShipmentsForMonitoring();
		for (Map<String, Object> row : delayedShipments) {
			Long shipmentId = ((Number) row.get("id")).longValue();
			String tracking = String.valueOf(row.get("tracking_number"));
			String city = String.valueOf(row.get("current_city"));
			String eta = String.valueOf(row.get("eta_at"));

			String message = "Monitor agent flagged ETA breach for shipment %s in %s (ETA %s)"
				.formatted(tracking, city, eta);

			agentOperationsRepository.insertAlert(shipmentId, "AUTONOMOUS_DELAY_DETECTED", "HIGH", message);
			agentOperationsRepository.insertAction(
				shipmentId,
				"MONITOR_ESCALATION",
				Map.of("trackingNumber", tracking, "detectedAt", OffsetDateTime.now().toString()),
				"monitor-agent",
				"CREATED_ALERT"
			);
		}
	}
}
