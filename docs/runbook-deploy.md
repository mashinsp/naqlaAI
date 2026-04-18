# Deploy Runbook (Phase 4)

## 1) One-Time AWS Account Setup

1. Create/select AWS account and target region (default in repo: `eu-central-1`).
2. Create an IAM role for GitHub OIDC deployment:
   - Trust provider: `token.actions.githubusercontent.com`
   - Permissions: ECS, ECR, Terraform-managed resources (VPC/RDS/ElastiCache/SecretsManager/Route53/ACM/IAM pass-role).
3. In GitHub repository settings, add environment `production` with required approval.
4. Add GitHub secrets:
   - `AWS_GITHUB_ROLE_ARN`
   - `OPENAI_API_KEY`
   - `JWT_SECRET_BASE64`
   - `SNYK_TOKEN` (optional)
   - `SONAR_TOKEN` (optional)

## 2) Terraform Infrastructure Baseline (P4-T1)

Infrastructure code now uses modular Terraform under `infra/modules`:

- `network`: VPC, subnets, internet routing, SGs
- `ecr`: frontend/backend ECR repos
- `rds`: PostgreSQL
- `redis`: ElastiCache Redis
- `secrets`: backend secret payload
- `ecs`: ALB + ECS cluster/services/task definitions
- `edge`: optional Route53 + ACM (toggle via `create_dns_records`)

### Local Terraform commands

```bash
cd infra
terraform init
terraform fmt -recursive
terraform validate
terraform plan -var-file=environments/dev.tfvars
```

### First apply (dev)

```bash
terraform apply -var-file=environments/dev.tfvars
```

### Production apply

```bash
terraform plan -var-file=environments/prod.tfvars
terraform apply -var-file=environments/prod.tfvars
```

## 3) Container Build + Registry Flow (P4-T2)

1. Build frontend/backend Docker images.
2. Tag with immutable SHA (not only `latest`).
3. Push to ECR repositories created by Terraform outputs.
4. Update ECS deployment by forcing new deployment (or update task definition revisions if needed).

## 4) CD Pipeline (P4-T3)

Workflow file: `.github/workflows/cd.yml`

Pipeline stages:
1. Quality gates (backend tests + frontend lint/build)
2. Terraform init/plan/apply (production environment)
3. Build and push backend/frontend images to ECR
4. Force ECS rolling deployment

## 5) Production Hardening & Observability (P4-T4)

Before go-live:
- Keep JSON structured logs in backend and ship to CloudWatch.
- Ensure ECS target group health checks are green (`/` and `/actuator/health`).
- Add CloudWatch alarms for:
  - ECS CPU high
  - ECS memory high
  - ALB 5XX spikes
  - RDS CPU/storage alarms
- Add request throttling/rate limiting at backend/API gateway layer.

## 6) Final QA Checklist (P4-T5)

Run smoke tests for:
- Login/logout and token expiry auto-redirect
- Role access boundaries (Admin/Manager/Viewer)
- Dashboard KPIs/table/map routes
- AI query in English + Arabic
- WebSocket live events
- Monitor/action agent logs and DB audit rows

## 7) Portfolio Deliverables (P4-T6)

- Public URL (domain + TLS)
- Updated README architecture diagram
- CI/CD + security badges
- 3-5 minute Loom demo (EN + AR)
- Resume bullet finalized with AWS + AI + DevSecOps stack
