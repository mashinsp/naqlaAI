package com.naqlaai.backend.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class AppUserPrincipal implements UserDetails {

	private final Long userId;
	private final String username;
	private final String password;
	private final String regionCity;
	private final boolean active;
	private final List<SimpleGrantedAuthority> authorities;

	public AppUserPrincipal(
		Long userId,
		String username,
		String password,
		String regionCity,
		boolean active,
		List<String> roles
	) {
		this.userId = userId;
		this.username = username;
		this.password = password;
		this.regionCity = regionCity;
		this.active = active;
		this.authorities = roles.stream()
			.map(role -> new SimpleGrantedAuthority("ROLE_" + role))
			.toList();
	}

	public Long getUserId() {
		return userId;
	}

	public String getRegionCity() {
		return regionCity;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return authorities;
	}

	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public String getUsername() {
		return username;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return active;
	}
}
