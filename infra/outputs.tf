output "name_prefix" {
  description = "Common name prefix for environment-scoped resources."
  value       = local.name_prefix
}

output "vpc_id" {
  description = "VPC id."
  value       = module.network.vpc_id
}

output "frontend_ecr_repository_url" {
  description = "ECR URL for frontend image."
  value       = module.ecr.frontend_repository_url
}

output "backend_ecr_repository_url" {
  description = "ECR URL for backend image."
  value       = module.ecr.backend_repository_url
}

output "alb_dns_name" {
  description = "Public DNS name for ALB."
  value       = module.ecs.alb_dns_name
}

output "rds_endpoint" {
  description = "RDS endpoint."
  value       = module.rds.endpoint
}

output "redis_endpoint" {
  description = "Redis primary endpoint."
  value       = module.redis.endpoint
}

output "backend_secret_arn" {
  description = "Secrets Manager ARN for backend secret."
  value       = module.secrets.secret_arn
}

output "app_domain" {
  description = "Route53 app domain when edge module enabled."
  value       = module.edge.app_domain
}
