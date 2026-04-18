INSERT INTO roles (code, name)
VALUES
    ('ADMIN', 'Administrator'),
    ('MANAGER', 'Regional Manager'),
    ('VIEWER', 'Read-Only Viewer')
ON CONFLICT (code) DO NOTHING;

INSERT INTO users (username, password_hash, full_name, region_city, active)
VALUES
    ('admin', '{noop}admin123', 'Naqla Admin', NULL, TRUE),
    ('manager_riyadh', '{noop}manager123', 'Riyadh Operations Manager', 'Riyadh', TRUE),
    ('viewer', '{noop}viewer123', 'Naqla Viewer', NULL, TRUE)
ON CONFLICT (username) DO UPDATE
SET full_name = EXCLUDED.full_name,
    region_city = EXCLUDED.region_city,
    active = EXCLUDED.active;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.code = 'ADMIN'
WHERE u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.code = 'MANAGER'
WHERE u.username = 'manager_riyadh'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.code = 'VIEWER'
WHERE u.username = 'viewer'
ON CONFLICT DO NOTHING;

INSERT INTO warehouses (name, city, latitude, longitude, is_active)
VALUES
    ('Riyadh Central Hub', 'Riyadh', 24.7136, 46.6753, TRUE),
    ('Jeddah Port Hub', 'Jeddah', 21.4858, 39.1925, TRUE),
    ('Dammam East Hub', 'Dammam', 26.4207, 50.0888, TRUE),
    ('Qassim Relay Point', 'Buraidah', 26.3592, 43.9818, TRUE),
    ('Makkah Distribution Node', 'Makkah', 21.3891, 39.8579, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO drivers (full_name, phone, city, status, is_active)
VALUES
    ('Fahad Al-Qahtani', '+966500000001', 'Riyadh', 'ACTIVE', TRUE),
    ('Saad Al-Harbi', '+966500000002', 'Jeddah', 'ACTIVE', TRUE),
    ('Yousef Al-Dossari', '+966500000003', 'Dammam', 'ACTIVE', TRUE),
    ('Abdullah Al-Shammari', '+966500000004', 'Riyadh', 'INACTIVE', TRUE)
ON CONFLICT (phone) DO NOTHING;

INSERT INTO routes (code, origin_warehouse_id, destination_warehouse_id, distance_km, estimated_duration_min, status)
SELECT
    v.code,
    o.id,
    d.id,
    v.distance_km,
    v.estimated_duration_min,
    v.status
FROM (
    VALUES
        ('RT-RUH-JED', 'Riyadh Central Hub', 'Jeddah Port Hub', 949.00, 600, 'ACTIVE'),
        ('RT-RUH-DMM', 'Riyadh Central Hub', 'Dammam East Hub', 413.00, 300, 'ACTIVE'),
        ('RT-JED-MKK', 'Jeddah Port Hub', 'Makkah Distribution Node', 85.00, 90, 'ACTIVE'),
        ('RT-RUH-BRD', 'Riyadh Central Hub', 'Qassim Relay Point', 330.00, 240, 'ACTIVE')
) AS v(code, origin_name, destination_name, distance_km, estimated_duration_min, status)
JOIN warehouses o ON o.name = v.origin_name
JOIN warehouses d ON d.name = v.destination_name
ON CONFLICT (code) DO NOTHING;

INSERT INTO shipments (
    tracking_number,
    reference_number,
    route_id,
    driver_id,
    origin_warehouse_id,
    destination_warehouse_id,
    current_city,
    status,
    priority,
    scheduled_pickup_at,
    eta_at,
    delivered_at,
    last_location_lat,
    last_location_lng,
    notes
)
SELECT
    v.tracking_number,
    v.reference_number,
    r.id,
    d.id,
    o.id,
    w.id,
    v.current_city,
    v.status,
    v.priority,
    NOW() - (v.pickup_hours_ago || ' hours')::INTERVAL,
    NOW() + (v.eta_hours_from_now || ' hours')::INTERVAL,
    CASE WHEN v.status = 'DELIVERED' THEN NOW() - INTERVAL '2 hours' ELSE NULL END,
    v.lat,
    v.lng,
    v.notes
FROM (
    VALUES
        ('NAQ-2026-0001', 'REF-1001', 'RT-RUH-JED', '+966500000001', 'Riyadh Central Hub', 'Jeddah Port Hub', 'Riyadh', 'IN_TRANSIT', 'HIGH', 5, 8, 24.7800, 46.7300, 'On schedule'),
        ('NAQ-2026-0002', 'REF-1002', 'RT-RUH-DMM', '+966500000003', 'Riyadh Central Hub', 'Dammam East Hub', 'Dammam', 'DELIVERED', 'NORMAL', 20, -2, 26.4207, 50.0888, 'Delivered successfully'),
        ('NAQ-2026-0003', 'REF-1003', 'RT-RUH-JED', '+966500000001', 'Riyadh Central Hub', 'Jeddah Port Hub', 'Qassim', 'DELAYED', 'CRITICAL', 10, -4, 26.3592, 43.9818, 'Traffic and weather delays'),
        ('NAQ-2026-0004', 'REF-1004', 'RT-JED-MKK', '+966500000002', 'Jeddah Port Hub', 'Makkah Distribution Node', 'Makkah', 'IN_TRANSIT', 'NORMAL', 3, 2, 21.4200, 39.8261, 'Approaching destination'),
        ('NAQ-2026-0005', 'REF-1005', 'RT-RUH-BRD', NULL, 'Riyadh Central Hub', 'Qassim Relay Point', 'Riyadh', 'PENDING', 'NORMAL', 1, 14, 24.7136, 46.6753, 'Awaiting driver assignment'),
        ('NAQ-2026-0006', 'REF-1006', 'RT-RUH-DMM', '+966500000003', 'Riyadh Central Hub', 'Dammam East Hub', 'Riyadh', 'DELAYED', 'HIGH', 7, -1, 24.8400, 46.7800, 'Late pickup completion')
) AS v(
    tracking_number,
    reference_number,
    route_code,
    driver_phone,
    origin_name,
    destination_name,
    current_city,
    status,
    priority,
    pickup_hours_ago,
    eta_hours_from_now,
    lat,
    lng,
    notes
)
JOIN routes r ON r.code = v.route_code
JOIN warehouses o ON o.name = v.origin_name
JOIN warehouses w ON w.name = v.destination_name
LEFT JOIN drivers d ON d.phone = v.driver_phone
ON CONFLICT (tracking_number) DO NOTHING;

INSERT INTO alerts (shipment_id, alert_type, severity, message, status, created_at)
SELECT s.id, a.alert_type, a.severity, a.message, a.status, NOW() - (a.hours_ago || ' hours')::INTERVAL
FROM (
    VALUES
        ('NAQ-2026-0003', 'ETA_BREACH', 'CRITICAL', 'Shipment exceeded ETA by more than 3 hours', 'OPEN', 2),
        ('NAQ-2026-0006', 'LATE_PICKUP', 'HIGH', 'Pickup delayed beyond SLA threshold', 'OPEN', 1),
        ('NAQ-2026-0005', 'UNASSIGNED_DRIVER', 'MEDIUM', 'Shipment still pending driver assignment', 'OPEN', 3)
) AS a(tracking_number, alert_type, severity, message, status, hours_ago)
JOIN shipments s ON s.tracking_number = a.tracking_number
ON CONFLICT DO NOTHING;

INSERT INTO agent_actions (shipment_id, action_type, action_payload, performed_by, action_status)
SELECT
    s.id,
    'REASSIGN_DRIVER',
    jsonb_build_object('oldDriver', 'AUTO', 'newDriver', 'Fahad Al-Qahtani'),
    'monitor-agent',
    'COMPLETED'
FROM shipments s
WHERE s.tracking_number = 'NAQ-2026-0003'
ON CONFLICT DO NOTHING;

INSERT INTO agent_memory_refs (conversation_key, shipment_id, memory_type, memory_ref, expires_at)
SELECT
    'conv-riyadh-delays',
    s.id,
    'QUERY_CONTEXT',
    'Delayed Riyadh outbound shipments with critical alerts',
    NOW() + INTERVAL '12 hours'
FROM shipments s
WHERE s.tracking_number = 'NAQ-2026-0003'
ON CONFLICT DO NOTHING;
