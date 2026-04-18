package com.naqlaai.backend.security;

import java.util.List;

public record AuthResponse(
	Long userId,
	String token,
	String username,
	String regionCity,
	List<String> roles
) {
}
