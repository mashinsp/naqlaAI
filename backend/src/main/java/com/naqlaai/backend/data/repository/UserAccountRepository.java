package com.naqlaai.backend.data.repository;

import com.naqlaai.backend.data.model.AuthUserRecord;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class UserAccountRepository {

	private static final String USER_SQL = """
		SELECT u.id, u.username, u.password_hash, u.region_city, u.active
		FROM users u
		WHERE u.username = :username
		  AND u.deleted_at IS NULL
		""";

	private static final String ROLES_SQL = """
		SELECT r.code
		FROM user_roles ur
		JOIN roles r ON r.id = ur.role_id
		WHERE ur.user_id = :userId
		ORDER BY r.code
		""";

	private final NamedParameterJdbcTemplate jdbcTemplate;

	public UserAccountRepository(NamedParameterJdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public Optional<AuthUserRecord> findByUsername(String username) {
		MapSqlParameterSource params = new MapSqlParameterSource("username", username);
		List<AuthUserRecord> users = jdbcTemplate.query(USER_SQL, params, new UserMapper());
		if (users.isEmpty()) {
			return Optional.empty();
		}

		AuthUserRecord user = users.getFirst();
		List<String> roles = jdbcTemplate.queryForList(
			ROLES_SQL,
			new MapSqlParameterSource("userId", user.id()),
			String.class
		);

		return Optional.of(
			new AuthUserRecord(
				user.id(),
				user.username(),
				user.passwordHash(),
				user.regionCity(),
				user.active(),
				roles
			)
		);
	}

	private static class UserMapper implements RowMapper<AuthUserRecord> {
		@Override
		public AuthUserRecord mapRow(ResultSet rs, int rowNum) throws SQLException {
			return new AuthUserRecord(
				rs.getLong("id"),
				rs.getString("username"),
				rs.getString("password_hash"),
				rs.getString("region_city"),
				rs.getBoolean("active"),
				List.of()
			);
		}
	}
}
