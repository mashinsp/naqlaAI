# NaqlaAI Architecture and Conventions

## 1) Service Boundaries

- `frontend/` (Next.js App Router):
  - Arabic/English UI, route-based locale handling, dashboards, role-aware navigation.
  - Talks only to backend APIs and WebSocket endpoints.
- `backend/` (Spring Boot 3, Java 21):
  - Authentication, RBAC enforcement, domain services, AI orchestration, realtime events.
  - Owns business rules and data access.
- `postgres` (RDS in cloud):
  - Source of truth for shipments, routes, drivers, users, alerts, and audit logs.
- `redis` (ElastiCache in cloud):
  - Short-lived cache, AI conversation context, and rate-limiting state.

Reason: Clear boundaries keep security-critical logic in one place (backend), while frontend stays presentation-focused.

## 2) Authentication and RBAC Flow

1. User signs in through `POST /api/v1/auth/login`.
2. Backend validates credentials and returns JWT with role claims.
3. Frontend stores token and sends it as `Authorization: Bearer <token>`.
4. Backend filter validates token, attaches authenticated principal.
5. Endpoint rules + method-level guards enforce role access (`ADMIN`, `MANAGER`, `VIEWER`).

Reason: Centralized auth checks prevent UI-only security and support later DB-level controls.

## 3) AI Agent Flow

- Query Agent:
  - Accepts Arabic/English natural language query.
  - Converts intent to safe backend actions/queries.
- Monitor Agent:
  - Scheduled checks for delay, route deviation, inactivity.
  - Emits anomalies and escalations.
- Action Agent:
  - Executes bounded tools (reassign driver, notify stakeholder, update route) with audit logs.

Reason: Splitting query/monitor/action responsibilities reduces prompt complexity and improves safety.

## 4) AWS Topology (Target)

- CloudFront + Route53 + ACM for public HTTPS.
- ECS Fargate services:
  - `frontend` service
  - `backend` service
- RDS PostgreSQL for durable data.
- ElastiCache Redis for cache/memory.
- Secrets Manager for `DB credentials`, `JWT secret`, `Claude key`.
- ECR for container images.

Reason: Managed AWS services reduce ops load and match enterprise hiring expectations.

## 5) Coding Conventions

### Naming
- Backend packages by capability: `api`, `core`, `data`, `security`, `ai`.
- Classes use `PascalCase`; methods/fields use `camelCase`.
- Frontend components use `PascalCase`; route segments use lowercase.

### Branch Strategy
- `main`: protected, deployable.
- `feat/<short-topic>` for features.
- `fix/<short-topic>` for bug fixes.
- Squash merge by default.

### Commit Style
- Format: `<type>: <concise reason-focused message>`.
- Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `ci`.
- Example: `feat: add JWT guard and localized dashboard shell`.

Reason: Consistent conventions make onboarding and code review faster.
