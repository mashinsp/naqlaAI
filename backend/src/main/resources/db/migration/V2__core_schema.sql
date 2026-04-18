CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    region_city VARCHAR(64),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users (id),
    role_id BIGINT NOT NULL REFERENCES roles (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS drivers (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL UNIQUE,
    city VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS warehouses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    city VARCHAR(64) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS routes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,
    origin_warehouse_id BIGINT NOT NULL REFERENCES warehouses (id),
    destination_warehouse_id BIGINT NOT NULL REFERENCES warehouses (id),
    distance_km NUMERIC(10, 2) NOT NULL,
    estimated_duration_min INTEGER NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS shipments (
    id BIGSERIAL PRIMARY KEY,
    tracking_number VARCHAR(64) NOT NULL UNIQUE,
    reference_number VARCHAR(64),
    route_id BIGINT NOT NULL REFERENCES routes (id),
    driver_id BIGINT REFERENCES drivers (id),
    origin_warehouse_id BIGINT NOT NULL REFERENCES warehouses (id),
    destination_warehouse_id BIGINT NOT NULL REFERENCES warehouses (id),
    current_city VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    priority VARCHAR(16) NOT NULL DEFAULT 'NORMAL',
    scheduled_pickup_at TIMESTAMPTZ NOT NULL,
    eta_at TIMESTAMPTZ NOT NULL,
    delivered_at TIMESTAMPTZ,
    last_location_lat NUMERIC(10, 7),
    last_location_lng NUMERIC(10, 7),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    shipment_id BIGINT REFERENCES shipments (id),
    alert_type VARCHAR(64) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS agent_actions (
    id BIGSERIAL PRIMARY KEY,
    shipment_id BIGINT REFERENCES shipments (id),
    action_type VARCHAR(64) NOT NULL,
    action_payload JSONB,
    performed_by VARCHAR(64) NOT NULL,
    action_status VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_memory_refs (
    id BIGSERIAL PRIMARY KEY,
    conversation_key VARCHAR(128) NOT NULL,
    shipment_id BIGINT REFERENCES shipments (id),
    memory_type VARCHAR(64) NOT NULL,
    memory_ref TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments (status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_shipments_current_city ON shipments (current_city) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_shipments_eta ON shipments (eta_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_shipments_driver_id ON shipments (driver_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_drivers_city ON drivers (city) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_warehouses_city ON warehouses (city) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_alerts_status_created ON alerts (status, created_at DESC) WHERE deleted_at IS NULL;
