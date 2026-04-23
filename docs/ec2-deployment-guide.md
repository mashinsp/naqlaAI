# NaqlaAI Low-Cost EC2 Deployment Guide

This guide deploys NaqlaAI on a single EC2 instance using Docker Compose.  
It is designed for portfolio/demo usage with lower monthly cost than ECS + RDS + ElastiCache.

## What this setup includes

- One EC2 VM (Ubuntu)
- Docker Compose stack:
  - `frontend` (Next.js)
  - `backend` (Spring Boot)
  - `postgres` (container)
  - `redis` (container)
  - `nginx` (reverse proxy)
- GitHub Actions deployment over SSH

## 1) Launch EC2

- Create an Ubuntu EC2 instance (small size, e.g. `t3.micro`)
- Attach a security group with:
  - `22` from your IP only
  - `80` from `0.0.0.0/0`
  - `443` from `0.0.0.0/0` (for HTTPS later)
- Attach an Elastic IP (recommended)

## 2) Bootstrap server

SSH to instance:

```bash
ssh -i <key.pem> ubuntu@<EC2_PUBLIC_IP>
```

Clone repo and install Docker:

```bash
sudo mkdir -p /opt
sudo chown ubuntu:ubuntu /opt
cd /opt
git clone <YOUR_REPO_URL> naqlaAI
cd naqlaAI
sudo bash deploy/ec2/setup-ec2.sh
```

If needed, add your user to Docker group and relogin:

```bash
sudo usermod -aG docker ubuntu
exit
```

## 3) Configure production env

On EC2:

```bash
cd /opt/naqlaAI
cp deploy/ec2/.env.ec2.example deploy/ec2/.env.ec2
nano deploy/ec2/.env.ec2
```

Set strong values for:

- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `JWT_SECRET_BASE64`
- `OPENAI_API_KEY`

Generate a good JWT secret (base64):

```bash
openssl rand -base64 64
```

## 4) First deploy

```bash
cd /opt/naqlaAI
chmod +x deploy/ec2/deploy.sh
./deploy/ec2/deploy.sh
```

Verify:

```bash
docker compose --env-file deploy/ec2/.env.ec2 -f deploy/ec2/docker-compose.ec2.yml ps
curl http://localhost/actuator/health
```

## 5) Enable GitHub Actions auto-deploy

A new workflow exists at `.github/workflows/deploy-ec2.yml`.

Add these GitHub repository secrets:

- `EC2_HOST` -> EC2 public IP or domain
- `EC2_USER` -> `ubuntu`
- `EC2_SSH_PRIVATE_KEY` -> private key contents (`.pem`)

Workflow behavior:

- Runs backend tests + frontend lint/build
- SSHes into EC2
- Pulls latest `main`
- Runs `deploy/ec2/deploy.sh`

## 6) HTTPS (recommended)

Current compose exposes HTTP via Nginx on port 80.  
To add HTTPS cheaply, install Certbot on EC2 and issue a cert for your domain:

```bash
sudo apt-get update -y
sudo apt-get install -y certbot
```

Then configure host-level Nginx or extend container config with cert volume + 443 listener.

## 7) Cost controls

- Use one small EC2 instance only
- Keep one EBS volume, remove snapshots you do not need
- Create AWS Budget alarms at `$5`, `$10`, `$15`
- Stop instance when not demoing (if acceptable for your availability)

## 8) If instance crashes during deploy

On tiny instances (especially 1GB RAM), Docker builds can trigger OOM and make the VM unresponsive.

This repo now includes protections:

- `deploy/ec2/setup-ec2.sh` creates a persistent 4GB swap file
- `deploy/ec2/deploy.sh` builds backend and frontend sequentially
- frontend Docker build uses lower Node memory (`NODE_OPTIONS=--max-old-space-size=512`)

If you already provisioned the instance before these changes, rerun setup:

```bash
cd /opt/naqlaAI
git pull --ff-only origin main
sudo bash deploy/ec2/setup-ec2.sh
free -h
swapon --show
```

Then deploy again:

```bash
./deploy/ec2/deploy.sh
```

If crashes still happen, move from `t3.micro` to `t3.small` (recommended minimum for this stack).

## Important notes

- This architecture is optimized for low-cost showcase, not high-availability production.
- Database and Redis are inside one VM; keep backups for important demo data.
- Do not commit `deploy/ec2/.env.ec2` to git.
