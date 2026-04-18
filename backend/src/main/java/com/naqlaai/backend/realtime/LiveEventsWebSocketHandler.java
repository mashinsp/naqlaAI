package com.naqlaai.backend.realtime;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class LiveEventsWebSocketHandler extends TextWebSocketHandler {

	private final LiveEventBroadcaster broadcaster;

	public LiveEventsWebSocketHandler(LiveEventBroadcaster broadcaster) {
		this.broadcaster = broadcaster;
	}

	@Override
	public void afterConnectionEstablished(WebSocketSession session) {
		broadcaster.addSession(session);
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
		broadcaster.removeSession(session);
	}
}
