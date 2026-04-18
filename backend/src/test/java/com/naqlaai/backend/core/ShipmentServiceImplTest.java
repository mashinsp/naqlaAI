package com.naqlaai.backend.core;

import com.naqlaai.backend.api.dto.PageResponse;
import com.naqlaai.backend.api.dto.ShipmentListItemResponse;
import com.naqlaai.backend.data.repository.LogisticsReadRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.OffsetDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShipmentServiceImplTest {

	@Mock
	private LogisticsReadRepository logisticsReadRepository;

	@InjectMocks
	private ShipmentServiceImpl shipmentService;

	@Test
	void managerOnlySeesRegionScopedData() {
		ShipmentQueryFilter filter = new ShipmentQueryFilter(null, null, null, null, null, null, 0, 20);
		AppTestPrincipal principal = new AppTestPrincipal("manager_riyadh", "Riyadh", "ROLE_MANAGER");
		UsernamePasswordAuthenticationToken authentication = principal.authentication();

		List<ShipmentListItemResponse> rows = List.of(
			new ShipmentListItemResponse(
				1L,
				"NAQ-2026-0001",
				"IN_TRANSIT",
				"HIGH",
				"Riyadh",
				"Riyadh",
				"Jeddah",
				"Fahad Al-Qahtani",
				OffsetDateTime.now()
			)
		);
		when(logisticsReadRepository.findShipments(any(), eq("Riyadh"))).thenReturn(rows);
		when(logisticsReadRepository.countShipments(any(), eq("Riyadh"))).thenReturn(1L);

		PageResponse<ShipmentListItemResponse> response = shipmentService.listShipments(authentication, filter);

		assertThat(response.data()).hasSize(1);
		assertThat(response.total()).isEqualTo(1L);
		verify(logisticsReadRepository).findShipments(filter, "Riyadh");
	}

	@Test
	void adminHasNoRegionRestriction() {
		ShipmentQueryFilter filter = new ShipmentQueryFilter(null, null, null, null, null, null, 0, 20);
		AppTestPrincipal principal = new AppTestPrincipal("admin", null, "ROLE_ADMIN");
		UsernamePasswordAuthenticationToken authentication = principal.authentication();

		when(logisticsReadRepository.findShipments(any(), eq(null))).thenReturn(List.of());
		when(logisticsReadRepository.countShipments(any(), eq(null))).thenReturn(0L);

		shipmentService.listShipments(authentication, filter);

		verify(logisticsReadRepository).findShipments(filter, null);
	}

	private record AppTestPrincipal(String username, String regionCity, String role) {
		UsernamePasswordAuthenticationToken authentication() {
			com.naqlaai.backend.security.AppUserPrincipal principal = new com.naqlaai.backend.security.AppUserPrincipal(
				1L,
				username,
				"{noop}pass",
				regionCity,
				true,
				List.of(role.replace("ROLE_", ""))
			);
			return new UsernamePasswordAuthenticationToken(
				principal,
				null,
				List.of(new SimpleGrantedAuthority(role))
			);
		}
	}
}
