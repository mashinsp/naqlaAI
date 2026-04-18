# Local Runbook

## Prerequisites

- Docker Desktop
- Node.js 20+
- Java 21
- Maven 3.9+

## First-Time Setup

1. Copy env templates:
   - `backend/.env.example` -> `backend/.env`
   - `frontend/.env.example` -> `frontend/.env.local`
2. Start full local stack:
   - Windows PowerShell: `./scripts/start-local.ps1`
   - macOS/Linux: `./scripts/start-local.sh`

## Endpoints

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- Actuator Health: `http://localhost:8080/actuator/health`
- Swagger UI: `http://localhost:8080/swagger-ui`

## Test Accounts (baseline)

- `admin` / `admin123`
- `manager` / `manager123`
- `viewer` / `viewer123`

## Common Commands

- Frontend build: `cd frontend && npm run build`
- Backend build: `cd backend && mvn -DskipTests package`
- Backend tests: `cd backend && mvn test`
