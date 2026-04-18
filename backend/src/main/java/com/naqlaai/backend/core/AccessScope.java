package com.naqlaai.backend.core;

import com.naqlaai.backend.security.AppUserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

public record AccessScope(
	boolean admin,
	boolean manager,
	String regionCity
) {

	public static AccessScope from(Authentication authentication) {
		boolean admin = hasRole(authentication, "ROLE_ADMIN");
		boolean manager = hasRole(authentication, "ROLE_MANAGER");
		String regionCity = null;
		if (manager && authentication.getPrincipal() instanceof AppUserPrincipal principal) {
			regionCity = principal.getRegionCity();
		}

		return new AccessScope(admin, manager, regionCity);
	}

	private static boolean hasRole(Authentication authentication, String role) {
		return authentication.getAuthorities()
			.stream()
			.map(GrantedAuthority::getAuthority)
			.anyMatch(role::equals);
	}
}
