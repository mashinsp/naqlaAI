# NaqlaAI Production Learning Guide

This guide explains how this project works end-to-end so you can:

1. Understand how code, infrastructure, and pipelines connect.
2. Learn reusable production patterns for future projects.
3. Speak confidently and honestly in interviews.

Use this document alongside the codebase in this order:

1. `docs/architecture.md`
2. `backend/src/main/resources/application.yml`
3. `backend/src/main/java/com/naqlaai/backend/security/SecurityConfig.java`
4. `backend/src/main/java/com/naqlaai/backend/api/*.java`
5. `frontend/app/api/**/*.ts` and `frontend/proxy.ts`
6. `infra/main.tf` and `infra/modules/**`
7. `.github/workflows/ci.yml`
8. `.github/workflows/cd.yml`

---

## 1) Big Picture: What You Built

NaqlaAI is a full-stack logistics visibility platform with:

- Next.js frontend (bilingual UI and API proxy layer).
- Spring Boot backend (auth, RBAC, domain APIs, AI orchestration).
- PostgreSQL + Redis data layer.
- Dockerized services for local and cloud runtime.
- Terraform-managed AWS infrastructure.
- GitHub Actions CI/CD with OIDC-based AWS auth.

In one sentence:

> A monorepo where application code, IaC, and pipelines are versioned together, so a commit can run tests, provision/update cloud resources, build containers, push to ECR, and roll ECS services.

---

## 2) Repository Map (How Files Become a Product)

Top-level directories:

- `frontend/`: Next.js app, localization, UI, browser-facing API routes.
- `backend/`: Spring Boot APIs, AI services, security, data, tests.
- `infra/`: Terraform root + modules for AWS resources.
- `.github/workflows/`: CI and CD automation definitions.
- `scripts/`: local startup helpers.
- `docs/`: architecture/runbooks/this learning guide.

### Important runtime files

- `docker-compose.yml`: local full-stack orchestration (Postgres, Redis, backend, frontend).
- `backend/Dockerfile`: Java multi-stage build -> runtime image.
- `frontend/Dockerfile`: Node multi-stage build -> Next runtime image.
- `infra/environments/dev.tfvars`, `infra/environments/prod.tfvars`: environment knobs.
- `infra/backend.tf`: remote state backend type declaration (`s3` configured via CLI flags/workflow).

---

## 3) End-to-End Runtime Flows

## 3.1 Login flow (browser to backend, securely)

1. Browser submits credentials to frontend route: `POST /api/auth/login`.
2. Frontend route (`frontend/app/api/auth/login/route.ts`) forwards to backend `POST /api/v1/auth/login`.
3. Backend authenticates using Spring Security + DB user store.
4. Backend returns JWT with role claims.
5. Frontend sets HTTP-only cookie `naqlaai_token`.
6. `frontend/proxy.ts` middleware guards routes, checks expiry, and auto-redirects expired sessions to login.

Why this matters:

- Keeps JWT inaccessible to client-side JS (httpOnly cookie).
- Centralizes auth logic in backend.
- Prevents stale session UX errors with automatic cookie cleanup.

## 3.2 Data/API flow (dashboard pages)

1. Frontend calls `/api/proxy/...` routes (server-side).
2. Proxy reads cookie token and forwards to backend `/api/v1/...` with `Authorization: Bearer`.
3. Backend controllers enforce `@PreAuthorize` role checks.
4. Response is relayed back to UI.

Why this matters:

- Browser never needs direct access to backend private URL logic.
- Security and authorization remain backend-owned.

## 3.3 AI query flow (agentic but bounded)

1. User asks question in EN/AR.
2. `AiController` routes to `QueryAgentService`.
3. `QueryAgentService`:
   - checks cache/memory,
   - uses `LlmService` to extract a structured plan (intent/city/status/date),
   - executes allowed tools through `AiToolService`,
   - summarizes results with LLM,
   - stores response in cache/memory.
4. Returns structured payload: language, intent, cached flag, answer, and data.

Why this matters:

- You get natural language UX without unrestricted LLM DB access.
- Tool-based execution preserves control, auditability, and RBAC compatibility.

---

## 4) Backend Architecture (Production Patterns)

## 4.1 Dependency foundation

`backend/pom.xml` includes:

- Spring Boot 3.5 + Java 21.
- Security + JWT stack.
- JPA/Hibernate + PostgreSQL.
- Flyway migrations.
- Redis.
- WebSocket.
- LangChain4j + OpenAI.
- AWS SDK Secrets Manager.
- JUnit + Testcontainers.

Production lesson:

- Keep foundational capabilities explicit in `pom.xml`; this is your architecture contract.

## 4.2 Configuration model

`backend/src/main/resources/application.yml` maps infrastructure/runtime values to app behavior:

- DB, Redis, actuator, swagger.
- JWT settings.
- AI settings (`app.ai.openai.*`).
- Secrets feature flag (`app.secrets.enabled`, `app.secrets.secret-name`).
- Monitor scheduling settings.

Production lesson:

- Environment-driven config + safe defaults allows local dev and cloud deploy using the same binary.

## 4.3 Security model

`SecurityConfig.java` establishes:

- Stateless JWT auth.
- Public paths for health/docs/login.
- Protected paths by role.
- Method-level security support (`@EnableMethodSecurity` + `@PreAuthorize`).

Production lesson:

- Enforce authorization in backend, never only in frontend navigation.

## 4.4 Secrets + OpenAI initialization

- `AwsSecretsService.java` fetches JSON secrets from AWS Secrets Manager.
- `OpenAiConfig.java` resolves API key:
  1. direct env (`OPENAI_API_KEY`) or
  2. AWS secret value (`OPENAI_API_KEY` key in secret JSON).

If key is missing while AI is enabled, startup fails fast (intentional safety).

Production lesson:

- Fail fast on critical missing secrets; do not silently run in broken state.

## 4.5 Agent services

- `QueryAgentService`: query understanding + tool orchestration + caching.
- `MonitorAgentService`: scheduled anomaly scanning and alert insertion.
- `ActionAgentService`: controlled side effects (reassign/route note/notify) with role checks.
- `AiToolService`: bounded tool access to shipment domain queries/actions.

Production lesson:

- Multi-agent decomposition reduces complexity and improves explainability.

## 4.6 Seed and migrations

`db/migration/V3__seed_saudi_logistics.sql` seeds:

- roles/users (`admin`, `manager_riyadh`, `viewer`),
- warehouses/drivers/routes/shipments/alerts,
- baseline agent logs/memory refs.

Production lesson:

- Deterministic seed data makes demos, QA, and interview walkthroughs credible.

## 4.7 Tests

Current backend tests in `backend/src/test/java` include:

- integration tests for controller paths,
- service tests,
- Testcontainers support.

Production lesson:

- Integration tests are your release confidence backbone in CI/CD.

---

## 5) Frontend Architecture (High-Level, Practical)

You already know frontend details, so keep this operational:

- `frontend/proxy.ts`: route middleware for i18n + auth + expiry/role handling.
- `frontend/app/api/auth/login/route.ts`: login bridge backend <-> cookie session.
- `frontend/app/api/proxy/[...path]/route.ts`: secure data proxy with bearer forwarding.
- `frontend/lib/constants.ts`: backend base URL resolution.

Production lesson:

- Frontend API routes are a clean BFF (backend-for-frontend) layer, especially for auth cookies and token forwarding.

---

## 6) Infrastructure as Code: Terraform Breakdown

## 6.1 Root composition

`infra/main.tf` composes modules:

- `network`: VPC, subnets, route table, SGs.
- `ecr`: image repositories.
- `secrets`: backend secret payload.
- `rds`: Postgres.
- `redis`: ElastiCache.
- `ecs`: ALB + ECS cluster/services/task definitions.
- `edge`: optional Route53/ACM setup.

The root injects runtime env vars into ECS task definitions, including:

- DB/Redis settings,
- AI toggles,
- secrets flags and name (`AWS_SECRETS_ENABLED=true`, `AWS_SECRETS_NAME=<prefix>/backend`),
- region variables for AWS SDK resolution.

## 6.2 State and environments

- `infra/backend.tf` keeps backend type generic: `backend "s3" {}`.
- Real backend values are passed in workflow/local CLI via `terraform init -backend-config=...`.
- `dev.tfvars` and `prod.tfvars` separate environment sizing/settings.

Production lesson:

- Remote state + lock table are mandatory for team-safe Terraform operations.

## 6.3 ECS module details that matter

`infra/modules/ecs/main.tf` includes:

- ALB and listener rule routing.
- Frontend and backend target groups.
- ECS cluster/task definitions/services.
- CloudWatch log groups.
- IAM execution role + task role.
- Task role inline policy for Secrets Manager read.
- Health-check grace period for startup-heavy services.

Critical routing pattern:

- `/api/v1/*` -> backend target group.
- `/` and non-API app routes -> frontend target group.

Production lesson:

- Precise listener path rules prevent frontend API routes from being hijacked by backend routing.

## 6.4 Network and data modules

- `network`: least-privilege SG chain (ALB -> frontend/backend, backend -> RDS/Redis).
- `rds`: postgres 16 with subnet group and generated password.
- `redis`: replication group for caching/memory.
- `secrets`: one JSON secret holding OpenAI/JWT + extra AI vars.
- `ecr`: mutable repos with scan-on-push.

---

## 7) CI/CD Automation: GitHub Actions to AWS

## 7.1 CI workflow (`.github/workflows/ci.yml`)

On pushes/PRs:

1. Backend build + tests.
2. Frontend install + lint + build.
3. Trivy filesystem scan (blocking high/critical findings).
4. Optional Snyk scan (if token exists).
5. Optional SonarCloud scan (if token exists).

Value:

- Fast feedback before deployment.

## 7.2 CD workflow (`.github/workflows/cd.yml`)

Triggered on `main` push/manual run:

1. Quality gates (tests/lint/build).
2. Terraform apply (OIDC auth + remote state init + plan/apply).
3. Build and push backend/frontend images to ECR with `GITHUB_SHA` tag.
4. Force ECS rolling deployments.

OIDC details:

- `aws-actions/configure-aws-credentials@v4`.
- `id-token: write` permission.
- Assume role from `AWS_GITHUB_ROLE_ARN`.
- Session duration set to avoid token expiry during long Terraform jobs.

Terraform backend config in CD:

- S3 bucket/key + DynamoDB lock table injected from GitHub secrets/env.
- avoids interactive `terraform init` prompts in CI.

Production lesson:

- Decouple infrastructure provisioning and image rollout stages, but keep both in one automated pipeline.

---

## 8) What Broke in Real Deployment (And Why It Was Valuable)

This project already taught real production debugging skills:

1. **State drift / wrong state key**
   - Symptom: resources “already exists,” unwanted destroy/create plans.
   - Fix: remote backend + clean state key + import/cleanup strategy.

2. **OIDC/IAM gaps**
   - Symptom: `AccessDenied` across ELB/ECR/Logs/RDS/etc.
   - Fix: role policy expansion and practical least-privilege iteration.

3. **Token expiry in long applies**
   - Symptom: `ExpiredTokenException`.
   - Fix: role max session + action duration tuning.

4. **ECS image tag mismatch**
   - Symptom: `CannotPullContainerError ... :latest not found`.
   - Fix: align task image tags and ECR tagging strategy.

5. **Backend crash on missing OpenAI key**
   - Symptom: ECS task churn, ALB 502/503.
   - Fix: enable secret loading, add task role secret permissions, set region envs.

6. **ALB path routing bug**
   - Symptom: `/api/auth/login` misrouted to backend and returned wrong status.
   - Fix: listener rule narrowed to `/api/v1/*`.

7. **Startup too slow for default health checks**
   - Symptom: healthy app still failing ELB health checks during boot.
   - Fix: ECS `health_check_grace_period_seconds`.

These are exactly the incidents hiring managers want you to have handled.

---

## 9) Interview-Ready Claims (Honest, Evidence-Based)

## 9.1 What you can claim now

### Backend (Java/Spring)

> Built production-style REST APIs with Spring Boot 3 and Java 21, including JWT auth, role-based access control, JPA/Hibernate, Flyway migrations, Redis caching, WebSocket support, and automated tests in CI.

Evidence:

- `SecurityConfig.java`, `AuthController.java`, `ShipmentController.java`
- `application.yml`, Flyway migrations
- `backend/src/test/java/*`
- CI workflow build/test stages

### AI (Agentic)

> Implemented a multi-agent backend with LangChain4j + OpenAI: query agent for NL analytics, monitor agent for scheduled anomaly detection, and action agent for controlled operational actions with audit trails.

Evidence:

- `QueryAgentService.java`, `MonitorAgentService.java`, `ActionAgentService.java`
- `LlmService.java`, `OpenAiConfig.java`
- `AiController.java`

### Cloud/DevOps

> Deployed a containerized full stack on AWS ECS Fargate using Terraform modules (network, ECS/ALB, RDS, ElastiCache, ECR, Secrets Manager), with GitHub Actions CI/CD using OIDC role assumption, quality gates, security scans, and automated rolling deployments.

Evidence:

- `infra/main.tf`, `infra/modules/**`
- `.github/workflows/ci.yml`, `.github/workflows/cd.yml`

## 9.2 Claims to avoid (unless you implement first)

- “Java virtual threads in production” -> not currently configured.
- “CloudFront is deployed” -> not currently provisioned in Terraform runtime path.
- “Claude API in production” -> current code uses OpenAI.

---

## 10) How to Explain the System in Interviews

## 30-second version

> I built a logistics SaaS platform where Next.js handles UX and API proxying, Spring Boot handles secure business APIs and AI orchestration, and Terraform provisions AWS infrastructure. GitHub Actions runs quality gates, applies infra through OIDC, pushes Docker images to ECR, and rolls ECS services automatically.

## 2-minute architecture walkthrough

1. User logs in via frontend API route; backend issues JWT with roles.
2. Frontend stores token in HTTP-only cookie; middleware enforces session/role routing.
3. Dashboard calls backend through a secure proxy route.
4. AI query endpoint uses an LLM to extract structured intent, executes bounded tools, and returns explanation + data.
5. Infra is Terraform modules; deploy is GitHub Actions with OIDC, ECR, ECS rolling updates.
6. We solved real issues: state drift, IAM permissions, ALB routing, and startup health tuning.

## “Hard question” prep lines

- **Why ECS Fargate?** Managed runtime, no EC2 ops, good fit for containerized services and interview-realistic scope.
- **How did you secure secrets?** AWS Secrets Manager + ECS task role + fail-fast boot if mandatory AI secret missing.
- **How do you prevent risky AI actions?** Action agent supports bounded action types, role checks, and explicit approval constraints.
- **How do you avoid infra drift?** Remote S3 state + DynamoDB lock + controlled tfvars + CI-driven apply path.

---

## 11) Reusable Blueprint for Your Next Production Project

Reuse this same pattern:

1. Monorepo with `frontend/`, `backend/`, `infra/`, `.github/workflows/`.
2. Backend-first security model (JWT + RBAC + method-level guards).
3. BFF-style frontend API routes for cookies/tokens.
4. Terraform modules by concern.
5. OIDC GitHub Actions (no long-lived AWS keys).
6. CI quality + security gates before CD.
7. Secrets Manager and fail-fast startup validation.
8. Health-check grace period + ALB rule precision.

If you repeat this architecture 2-3 times with different domains, you will be able to independently build and operate production-grade portfolio systems.

---

## 12) Next Improvements (to Level Up Further)

High-impact next steps:

1. Add CloudFront + TLS-only edge path and WAF.
2. Add explicit Java virtual thread configuration and load test it.
3. Add ECS autoscaling policies (CPU/RPS).
4. Add CloudWatch alarms + dashboards + alerting channel.
5. Add canary/blue-green deploy strategy.
6. Tighten IAM from broad to least privilege statements.
7. Add OpenTelemetry tracing across frontend/backend.

These upgrades let you safely claim more advanced SRE/platform experience.

