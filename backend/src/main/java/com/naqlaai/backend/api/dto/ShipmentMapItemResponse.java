package com.naqlaai.backend.api.dto;

public record ShipmentMapItemResponse(
	Long shipmentId,
	String trackingNumber,
	String status,
	String currentCity,
	Double currentLat,
	Double currentLng,
	String originCity,
	Double originLat,
	Double originLng,
	String destinationCity,
	Double destinationLat,
	Double destinationLng
) {
}
