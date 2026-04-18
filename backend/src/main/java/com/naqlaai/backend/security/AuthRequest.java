package com.naqlaai.backend.security;

import jakarta.validation.constraints.NotBlank;

public record AuthRequest(
	@NotBlank String username,
	@NotBlank String password
) {
}
