# NaqlaAI Execution Plan (Step-by-Step)

This checklist is the single source of truth for building and shipping NaqlaAI end-to-end.
Mark each task complete in order. Do not skip sequence unless explicitly noted.

## How To Use This Plan

- [ ] Complete tasks from top to bottom.
- [ ] For each task, add a short note under `Notes` with what was done.
- [ ] If blocked, add blocker details and move to the next non-blocking task.
- [ ] At end of each day, update `Progress Snapshot`.


## Progress Snapshot

- **Current Phase:** `3`
- **Current Task ID:** `P3-T1`
- **Last Updated:** `2026-04-17`
- **Blockers:** `None`

---

## Phase 0 - Project Setup and Standards (2-3 days)

Goal: Create a production-grade monorepo foundation for Next.js + Spring Boot + AWS.

### P0-T1: Create project structure
- [x] Create folders:
  - `frontend/` (Next.js 14 App Router)
  - `backend/` (Spring Boot 3, Java 21)
  - `infra/` (Terraform)
  - `.github/workflows/` (CI/CD)
  - `docs/` (architecture, runbooks)
- **How:** Initialize each part with its native tooling, then commit baseline.
- **Done when:** All folders exist and can build independently.
- **Notes:** `Completed baseline structure with frontend, backend, infra, docs, and CI workflow.`

### P0-T2: Define architecture and conventions
- [x] Write `docs/architecture.md` with:
  - service boundaries
  - auth flow
  - AI agent flow
  - AWS topology
- [x] Add coding conventions (naming, branch strategy, commit style).
- **How:** Keep this short and practical; link every key decision to a reason.
- **Done when:** New contributors can understand system shape in under 10 minutes.
- **Notes:** `Added concise architecture and conventions doc focused on onboarding speed.`

### P0-T3: Bootstrap backend skeleton
- [x] Spring Boot 3 project with modules:
  - `api` (controllers)
  - `core` (business logic)
  - `data` (entities/repos)
  - `security` (JWT + RBAC)
  - `ai` (LangChain4j services/tools)
- [x] Add Actuator, validation, OpenAPI.
- **How:** Use Maven multi-module or clean package structure.
- **Done when:** `/actuator/health` and sample secured endpoint are working.
- **Notes:** `Created package structure (api/core/data/security/ai), JWT auth sample, public and secured endpoints.`

### P0-T4: Bootstrap frontend skeleton
- [x] Next.js 14 App Router app with:
  - Tailwind
  - ShadCN/UI
  - `next-intl` (Arabic + English)
  - RTL support
- [x] Define layout shell: sidebar, header, content area.
- **How:** Build base routes and locale switch first.
- **Done when:** English/Arabic toggle works and RTL layout flips correctly.
- **Notes:** `Added next-intl locales (en/ar), locale switcher, and RTL-aware app shell layout.`

### P0-T5: Local developer environment
- [x] Add `docker-compose.yml` for:
  - PostgreSQL
  - Redis
  - backend
  - frontend
- [x] Add `.env.example` files for frontend/backend.
- [x] Add one-command startup script.
- **How:** Ensure first-time run works from clean machine.
- **Done when:** `docker compose up --build` runs full stack locally.
- **Notes:** `Added compose stack, Dockerfiles, env templates, and scripts/start-local.* helper scripts.`

---

## Phase 1 - Data Model, Auth, and Core APIs (Week 1)

Goal: Reliable backend domain with secure auth and realistic Saudi logistics data.

### P1-T1: Design database schema (PostgreSQL + Flyway)
- [x] Create tables:
  - `users`, `roles`, `user_roles`
  - `drivers`
  - `warehouses`
  - `routes`
  - `shipments`
  - `alerts`
  - `agent_actions`
  - `agent_memory_refs`
- [x] Add indexes for frequent filters (status, city, ETA, driver).
- [x] Add soft-delete/audit fields where needed.
- **How:** Create versioned Flyway migrations and review query plans.
- **Done when:** Schema migrates cleanly and supports all core use-cases.
- **Notes:** `Added Flyway V2 migration with all core tables, indexes, and audit/soft-delete columns.`

### P1-T2: Seed realistic Saudi logistics dataset
- [x] Seed cities and routes:
  - Riyadh, Jeddah, Dammam (+ nearby nodes)
- [x] Generate realistic shipment timing/status diversity.
- [x] Include delayed/on-time/critical scenarios.
- **How:** Use idempotent seed scripts.
- **Done when:** Dashboard has meaningful data without manual inserts.
- **Notes:** `Added Flyway V3 idempotent seed data for Riyadh/Jeddah/Dammam routes, mixed shipment states, and anomaly alerts.`

### P1-T3: Implement JWT auth + RBAC
- [x] Roles: `ADMIN`, `MANAGER`, `VIEWER`.
- [x] Login endpoint returns JWT with role claims.
- [x] API guards enforce role access.
- **How:** Spring Security config + method security annotations.
- **Done when:** Unauthorized/forbidden behavior is consistent across endpoints.
- **Notes:** `Moved auth to database-backed users/roles with JWT claims and method/API security guards.`

### P1-T4: Enforce region-level access (manager scope)
- [x] Managers can only see assigned region data.
- [x] Admin sees all; Viewer is read-only.
- [x] Enforce at service/repository layer (not UI only).
- **How:** Apply scoped queries and validate with tests.
- **Done when:** No cross-region leakage is possible through APIs.
- **Notes:** `Implemented manager region scoping in service/repository query layer using authenticated user region.`

### P1-T5: Core shipment APIs
- [x] Build endpoints:
  - list/search/filter shipments
  - shipment details
  - driver metrics
  - route summaries
  - anomalies feed
- **How:** Define request/response DTOs and pagination standards.
- **Done when:** Frontend can render all Week 2 pages from these APIs.
- **Notes:** `Implemented list/filter/search shipments, shipment details, driver metrics, route summaries, and anomalies feed endpoints.`

### P1-T6: Testing baseline
- [x] Unit tests (services/components).
- [x] Integration tests (controllers + DB via Testcontainers).
- **How:** Target high-value path coverage first.
- **Done when:** CI test stage is stable and non-flaky.
- **Notes:** `Added unit tests for region scoping and integration tests for RBAC/scoped APIs; mvn test passes.`

---

## Phase 2 - Dashboard UI and Real-Time Experience (Week 2)

Goal: Deliver the core logistics dashboard with map, KPIs, tables, and live updates.

### P2-T1: App shell and role-aware navigation
- [x] Build protected routes and auth middleware.
- [x] Show/hide nav items by role.
- **How:** Resolve auth server-side in App Router.
- **Done when:** Role-specific UI paths are correctly restricted.
- **Notes:** `Implemented locale-aware protected routes, auth cookie middleware, and role-filtered sidebar navigation.`

### P2-T2: KPI dashboard cards + trends
- [x] KPI cards:
  - on-time rate
  - active routes
  - delayed shipments
  - anomalies today
- [x] Recharts trend components.
- **How:** Fetch with SWR/React Query and add loading/error states.
- **Done when:** KPIs reflect seeded/live data correctly.
- **Notes:** `Added dashboard KPI endpoint + React Query + Recharts trend chart backed by seeded logistics data.`

### P2-T3: Live shipment map (Leaflet)
- [x] Plot shipment markers and route polylines for KSA.
- [x] Add status colors and tooltip details.
- [ ] Optional clustering for dense data.
- **How:** Keep map state lightweight and update incrementally.
- **Done when:** Map updates without re-rendering entire page.
- **Notes:** `Added map API and Leaflet page with current shipment markers and route lines.`

### P2-T4: Shipment data table
- [x] Filter/sort/search/paginate.
- [x] Status chips and SLA highlighting.
- [ ] Export CSV (optional stretch).
- **How:** Keep URL query params as source of table state.
- **Done when:** Table interactions remain fast and predictable.
- **Notes:** `Implemented URL-driven shipment table filters/search/pagination with status badges.`

### P2-T5: Driver performance view
- [x] Show scorecards and trend lines.
- [ ] Include incidents and reassignment history.
- **How:** Aggregate via backend endpoint to avoid frontend over-processing.
- **Done when:** Managers can identify underperforming drivers quickly.
- **Notes:** `Added driver performance cards and route summaries from backend aggregate endpoints.`

### P2-T6: Real-time event feed (WebSocket)
- [x] Stream shipment status changes and anomaly alerts.
- [x] Show toast + feed panel updates instantly.
- **How:** Spring WebSocket endpoint + frontend socket client.
- **Done when:** New events appear in UI without manual refresh.
- **Notes:** `Implemented backend WebSocket live feed and frontend panel/toast updates with fallback polling.`

---

## Phase 3 - AI Agents and DevSecOps (Week 3)

Goal: Launch Arabic/English natural language intelligence with secure CI gates.

### P3-T1: LangChain4j + Claude integration
- [x] Configure Claude client in backend.
- [x] Add prompt templates for logistics domain.
- [x] Add safe tool-calling wrappers.
- **How:** Start with strict function schema and deterministic prompts.
- **Done when:** AI responds reliably for known logistics intents.
- **Notes:** Added optional Anthropic model wiring with deterministic intent + summary prompts and tool wrapper service.

### P3-T2: Query Agent (NL -> data query)
- [x] Handle English + Arabic NL inputs.
- [x] Support requests like delayed shipments, route summaries, SLA checks.
- [x] Return structured data for table/chart rendering.
- **How:** Build intent parser + controlled query builder.
- **Done when:** Query answers are accurate and role-scoped.
- **Notes:** Added `/api/v1/ai/query` with intent parser, role-scoped tools, Redis-backed cache/memory.

### P3-T3: Action Agent (operational actions)
- [x] Add tool methods:
  - reassign driver
  - update route
  - notify stakeholder
- [x] Add approval policy for sensitive actions.
- **How:** Use explicit action policies and audit logging.
- **Done when:** Actions are traceable and safely bounded.
- **Notes:** Added `/api/v1/ai/action` with approval gating and writes to `agent_actions` + `alerts`.

### P3-T4: Monitor Agent (autonomous anomaly detection)
- [x] Schedule every 5 minutes with Spring Scheduler.
- [x] Detect delay risk, route deviation, inactivity.
- [x] Emit alerts and optionally trigger Action Agent.
- **How:** Start rule-based, then tune thresholds.
- **Done when:** Alert precision is acceptable and noise is controlled.
- **Notes:** Added monitor agent scheduler that flags ETA breaches and emits alert/action audit rows.

### P3-T5: AI memory and caching with Redis
- [x] Conversation context store.
- [x] Cache repeated query results.
- [x] Add TTL strategy by data sensitivity.
- **How:** Separate memory keys from general API cache keys.
- **Done when:** Repeated queries are faster and context-aware.
- **Notes:** Added key namespace separation and configurable TTL for memory/cache.

### P3-T6: Security pipeline in CI
- [x] Add CI jobs:
  - Trivy (container scan)
  - Snyk (dependency scan)
  - SonarCloud (quality/static analysis)
- [x] Configure fail-on-critical policies.
- **How:** Place scans before deploy stage.
- **Done when:** Vulnerable builds cannot deploy.
- **Notes:** CI now includes Trivy hard-fail on high/critical plus Snyk/Sonar jobs when tokens are configured.

### P3-T7: Secret management
- [x] Move secrets to AWS Secrets Manager:
  - DB credentials
  - JWT secret
  - Claude API key
- [x] Remove secret values from code and pipeline config.
- **How:** Fetch secrets at runtime with IAM role access.
- **Done when:** No production secrets are stored in repository.
- **Notes:** Added AWS Secrets Manager service + env templates; runtime reads for JWT/Claude key when enabled.

---

## Phase 4 - AWS Deployment, CI/CD, and Final Polish (Week 4)

Goal: Deploy production stack on AWS and finalize portfolio-ready assets.

### P4-T1: Terraform infrastructure baseline
- [ ] Create Terraform modules for:
  - VPC, subnets, security groups
  - ECS cluster/services (frontend/backend)
  - ECR repositories
  - RDS PostgreSQL
  - ElastiCache Redis
  - Secrets Manager
  - CloudFront + Route53 + ACM
- **How:** Keep env-specific vars (`dev`, `prod`) cleanly separated.
- **Done when:** `terraform plan` and `apply` complete without manual drift fixes.
- **Notes:** Terraform module scaffold added under `infra/modules` with `dev/prod` tfvars; CloudFront remains pending final domain cutover.

### P4-T2: Container build and registry flow
- [ ] Build backend/frontend Docker images.
- [ ] Push tagged images to ECR.
- [ ] Configure ECS task definitions.
- **How:** Use immutable tags and include commit SHA.
- **Done when:** ECS pulls latest images and services start healthy.
- **Notes:**

### P4-T3: Full GitHub Actions CD pipeline
- [ ] Pipeline stages:
  - lint + test
  - security scans
  - build images
  - push to ECR
  - Terraform apply (controlled environment)
  - ECS deploy
- **How:** Use protected branches and environment approvals where needed.
- **Done when:** Push to `main` triggers reliable deployment.
- **Notes:** Added `.github/workflows/cd.yml` baseline using AWS OIDC + environment approvals + Terraform/ECR/ECS stages.

### P4-T4: Production hardening and observability
- [ ] Add structured logging and correlation IDs.
- [ ] Add health/readiness checks.
- [ ] Add rate limiting and basic abuse protections.
- [ ] Add CloudWatch alarms (CPU/memory/error rate).
- **How:** Validate failure modes before launch.
- **Done when:** Service is operable and alertable in production.
- **Notes:**

### P4-T5: Final QA and acceptance checklist
- [ ] Validate all core flows:
  - auth + RBAC boundaries
  - map and dashboard data freshness
  - AI Arabic/English query quality
  - monitor/action agent behavior
  - websocket real-time updates
- [ ] Run regression tests and security scans.
- **How:** Use scripted smoke tests for repeatability.
- **Done when:** No release blocker remains.
- **Notes:**

### P4-T6: Portfolio deliverables
- [ ] Live AWS URL + SSL.
- [ ] README with architecture diagram.
- [ ] CI/CD and security badges.
- [ ] Loom demo (Arabic + English, 3-5 min).
- [ ] Resume bullet finalized.
- **How:** Keep demo focused on NL query + RBAC + live map + autonomous alert.
- **Done when:** Project is interview-ready and publicly presentable.
- **Notes:**

---

## Cross-Cutting Definition of Done (Apply To Every Phase)

- [ ] Code is committed with meaningful messages.
- [ ] Unit/integration tests pass in CI.
- [ ] No critical/high security findings open.
- [ ] Docs are updated for new behavior.
- [ ] Feature has monitoring/logging where relevant.
- [ ] Feature verified in both Arabic and English where user-facing.

---

## Suggested Weekly Cadence

- **Monday:** Plan and break down tasks, finalize scope.
- **Tuesday-Wednesday:** Implementation focus.
- **Thursday:** Testing, hardening, bug fixes.
- **Friday:** Demo rehearsal, documentation, retrospective.

---

## First 3 Tasks To Start Right Now

- [ ] Complete `P0-T1` (folder structure and baseline scaffolding).
- [ ] Complete `P0-T4` (frontend i18n + RTL shell).
- [ ] Complete `P1-T1` (Flyway schema for core entities).

When these 3 are done, update `Progress Snapshot` and move forward sequentially.
