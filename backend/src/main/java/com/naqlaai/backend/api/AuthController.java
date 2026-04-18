package com.naqlaai.backend.api;

import com.naqlaai.backend.security.AuthRequest;
import com.naqlaai.backend.security.AuthResponse;
import com.naqlaai.backend.security.AppUserPrincipal;
import com.naqlaai.backend.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;

	public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
		Authentication authentication = authenticationManager.authenticate(
			new UsernamePasswordAuthenticationToken(request.username(), request.password())
		);

		List<String> roles = authentication.getAuthorities()
			.stream()
			.map(GrantedAuthority::getAuthority)
			.toList();

		AppUserPrincipal principal = (AppUserPrincipal) authentication.getPrincipal();
		String token = jwtService.generateToken(
			principal.getUserId(),
			principal.getUsername(),
			principal.getRegionCity(),
			roles
		);

		return ResponseEntity.ok(
			new AuthResponse(
				principal.getUserId(),
				token,
				principal.getUsername(),
				principal.getRegionCity(),
				roles
			)
		);
	}
}
