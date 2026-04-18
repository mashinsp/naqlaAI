package com.naqlaai.backend.security;

import com.naqlaai.backend.data.model.AuthUserRecord;
import com.naqlaai.backend.data.repository.UserAccountRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {

	private final UserAccountRepository userAccountRepository;

	public DatabaseUserDetailsService(UserAccountRepository userAccountRepository) {
		this.userAccountRepository = userAccountRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		AuthUserRecord user = userAccountRepository.findByUsername(username)
			.orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

		return new AppUserPrincipal(
			user.id(),
			user.username(),
			user.passwordHash(),
			user.regionCity(),
			user.active(),
			user.roles()
		);
	}
}
