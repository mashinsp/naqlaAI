package com.naqlaai.backend.realtime;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.naqlaai.backend.api.dto.LiveEventResponse;
import com.naqlaai.backend.data.repository.LogisticsReadRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LiveEventBroadcaster {

	private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();
	private final LogisticsReadRepository logisticsReadRepository;
	private final ObjectMapper objectMapper;

	public LiveEventBroadcaster(LogisticsReadRepository logisticsReadRepository, ObjectMapper objectMapper) {
		this.logisticsReadRepository = logisticsReadRepository;
		this.objectMapper = objectMapper;
	}

	public void addSession(WebSocketSession session) {
		sessions.add(session);
	}

	public void removeSession(WebSocketSession session) {
		sessions.remove(session);
	}

	@Scheduled(fixedDelayString = "${app.events.broadcast-ms:5000}")
	public void broadcastRecentEvents() {
		if (sessions.isEmpty()) {
			return;
		}

		List<LiveEventResponse> events = logisticsReadRepository.recentLiveEvents(null, 5);
		try {
			String json = objectMapper.writeValueAsString(events);
			TextMessage message = new TextMessage(json);
			for (WebSocketSession session : sessions) {
				if (session.isOpen()) {
					session.sendMessage(message);
				} else {
					sessions.remove(session);
				}
			}
		} catch (JsonProcessingException ignored) {
			// Ignore serialization issues for non-critical live feed.
		} catch (IOException ex) {
			sessions.removeIf(session -> !session.isOpen());
		}
	}
}
