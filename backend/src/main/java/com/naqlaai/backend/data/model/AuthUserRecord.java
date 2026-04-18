package com.naqlaai.backend.data.model;

import java.util.List;

public record AuthUserRecord(
	Long id,
	String username,
	String passwordHash,
	String regionCity,
	boolean active,
	List<String> roles
) {
}
