package com.naqlaai.backend.api;

import com.naqlaai.backend.ai.ActionAgentService;
import com.naqlaai.backend.ai.QueryAgentService;
import com.naqlaai.backend.api.dto.AiActionRequest;
import com.naqlaai.backend.api.dto.AiActionResponse;
import com.naqlaai.backend.api.dto.AiQueryRequest;
import com.naqlaai.backend.api.dto.AiQueryResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

	private final QueryAgentService queryAgentService;
	private final ActionAgentService actionAgentService;

	public AiController(QueryAgentService queryAgentService, ActionAgentService actionAgentService) {
		this.queryAgentService = queryAgentService;
		this.actionAgentService = actionAgentService;
	}

	@PostMapping("/query")
	@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
	public AiQueryResponse query(
		Authentication authentication,
		@Valid @RequestBody AiQueryRequest request
	) {
		return queryAgentService.handleQuery(authentication, request);
	}

	@PostMapping("/action")
	@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
	public AiActionResponse act(
		Authentication authentication,
		@Valid @RequestBody AiActionRequest request
	) {
		return actionAgentService.handleAction(authentication, request);
	}
}
