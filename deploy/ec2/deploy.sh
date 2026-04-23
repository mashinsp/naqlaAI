#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EC2_ENV_FILE="$ROOT_DIR/deploy/ec2/.env.ec2"
COMPOSE_FILE="$ROOT_DIR/deploy/ec2/docker-compose.ec2.yml"

if [[ ! -f "$EC2_ENV_FILE" ]]; then
  echo "Missing $EC2_ENV_FILE. Copy deploy/ec2/.env.ec2.example and fill real secrets."
  exit 1
fi

echo "Starting EC2 deployment from $ROOT_DIR"
docker compose --env-file "$EC2_ENV_FILE" -f "$COMPOSE_FILE" up -d --build --remove-orphans
docker image prune -f

echo "Deployment finished. Current containers:"
docker compose --env-file "$EC2_ENV_FILE" -f "$COMPOSE_FILE" ps
