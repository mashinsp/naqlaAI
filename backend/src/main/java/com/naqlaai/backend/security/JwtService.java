package com.naqlaai.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

@Service
public class JwtService {

	private final String jwtSecret;
	private final long expirationMs;

	public JwtService(
		@Value("${app.jwt.secret}") String jwtSecret,
		@Value("${app.jwt.expiration-ms}") long expirationMs,
		AwsSecretsService awsSecretsService
	) {
		this.jwtSecret = (jwtSecret != null && !jwtSecret.isBlank())
			? jwtSecret
			: awsSecretsService.getValue("JWT_SECRET_BASE64").orElse(jwtSecret);
		this.expirationMs = expirationMs;
	}

	public String generateToken(Long userId, String username, String regionCity, List<String> roles) {
		Date now = new Date();
		Date expiration = new Date(now.getTime() + expirationMs);

		return Jwts.builder()
			.subject(username)
			.claim("uid", userId)
			.claim("regionCity", regionCity)
			.claim("roles", roles)
			.issuedAt(now)
			.expiration(expiration)
			.signWith(signingKey())
			.compact();
	}

	public String extractUsername(String token) {
		return extractClaim(token, Claims::getSubject);
	}

	public boolean isTokenValid(String token, String username) {
		String tokenUsername = extractUsername(token);
		return tokenUsername.equals(username) && !isTokenExpired(token);
	}

	private boolean isTokenExpired(String token) {
		Date expiration = extractClaim(token, Claims::getExpiration);
		return expiration.before(new Date());
	}

	private <T> T extractClaim(String token, Function<Claims, T> resolver) {
		Claims claims = Jwts.parser()
			.verifyWith(signingKey())
			.build()
			.parseSignedClaims(token)
			.getPayload();
		return resolver.apply(claims);
	}

	private SecretKey signingKey() {
		byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
		return Keys.hmacShaKeyFor(keyBytes);
	}
}
