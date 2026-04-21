locals {
  name_prefix = "${var.project_name}-${var.environment}"
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

module "network" {
  source = "./modules/network"

  name_prefix          = local.name_prefix
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  azs                  = var.azs
  tags                 = local.common_tags
}

module "ecr" {
  source = "./modules/ecr"

  name_prefix = local.name_prefix
  tags        = local.common_tags
}

module "secrets" {
  source = "./modules/secrets"

  name_prefix       = local.name_prefix
  openai_api_key    = var.openai_api_key
  jwt_secret_base64 = var.jwt_secret_base64
  extra_secret_values = {
    AI_OPENAI_MODEL       = var.openai_model
    AI_OPENAI_TEMPERATURE = tostring(var.openai_temperature)
  }
  tags = local.common_tags
}

module "rds" {
  source = "./modules/rds"

  name_prefix        = local.name_prefix
  db_name            = var.db_name
  db_username        = var.db_username
  private_subnet_ids = module.network.private_subnet_ids
  rds_security_group = module.network.rds_security_group_id
  backup_retention   = var.db_backup_retention_days
  multi_az           = var.db_multi_az
  tags               = local.common_tags
}

module "redis" {
  source = "./modules/redis"

  name_prefix          = local.name_prefix
  private_subnet_ids   = module.network.private_subnet_ids
  redis_security_group = module.network.redis_security_group_id
  node_type            = var.redis_node_type
  tags                 = local.common_tags
}

module "ecs" {
  source = "./modules/ecs"

  name_prefix             = local.name_prefix
  aws_region              = var.aws_region
  vpc_id                  = module.network.vpc_id
  public_subnet_ids       = module.network.public_subnet_ids
  alb_security_group_id   = module.network.alb_security_group_id
  frontend_security_group = module.network.frontend_security_group_id
  backend_security_group  = module.network.backend_security_group_id

  frontend_image = "${module.ecr.frontend_repository_url}:${var.image_tag}"
  backend_image  = "${module.ecr.backend_repository_url}:${var.image_tag}"

  backend_env = {
    SERVER_PORT         = "8080"
    AWS_REGION          = var.aws_region
    AWS_DEFAULT_REGION  = var.aws_region
    DB_URL              = "jdbc:postgresql://${module.rds.endpoint}:5432/${var.db_name}"
    DB_USERNAME         = module.rds.username
    DB_PASSWORD         = module.rds.password
    REDIS_HOST          = module.redis.endpoint
    REDIS_PORT          = "6379"
    JWT_EXPIRATION_MS   = "3600000"
    AI_OPENAI_ENABLED   = "true"
    AWS_SECRETS_ENABLED = "true"
    AWS_SECRETS_NAME    = "${local.name_prefix}/backend"
  }

  frontend_env = {
    API_BASE_URL             = "http://${module.ecs.alb_dns_name}"
    NEXT_PUBLIC_API_BASE_URL = "http://${module.ecs.alb_dns_name}"
  }

  desired_count_frontend  = var.frontend_desired_count
  desired_count_backend   = var.backend_desired_count
  backend_container_port  = 8080
  frontend_container_port = 3000
  tags                    = local.common_tags
}

module "edge" {
  source = "./modules/edge"

  create         = var.create_dns_records
  domain_name    = var.domain_name
  hosted_zone_id = var.hosted_zone_id
  alb_dns_name   = module.ecs.alb_dns_name
  alb_zone_id    = module.ecs.alb_zone_id
  tags           = local.common_tags
}
