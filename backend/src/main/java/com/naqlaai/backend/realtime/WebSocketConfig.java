package com.naqlaai.backend.realtime;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

	private final LiveEventsWebSocketHandler liveEventsWebSocketHandler;

	public WebSocketConfig(LiveEventsWebSocketHandler liveEventsWebSocketHandler) {
		this.liveEventsWebSocketHandler = liveEventsWebSocketHandler;
	}

	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		registry.addHandler(liveEventsWebSocketHandler, "/ws/events")
			.setAllowedOriginPatterns("*");
	}
}
