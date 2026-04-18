variable "project_name" {
  description = "Project identifier used for naming cloud resources."
  type        = string
  default     = "naqlaai"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region to deploy into."
  type        = string
  default     = "eu-central-1"
}

variable "vpc_cidr" {
  description = "VPC CIDR block."
  type        = string
  default     = "10.40.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets."
  type        = list(string)
  default     = ["10.40.1.0/24", "10.40.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets."
  type        = list(string)
  default     = ["10.40.11.0/24", "10.40.12.0/24"]
}

variable "azs" {
  description = "Availability zones."
  type        = list(string)
  default     = ["eu-central-1a", "eu-central-1b"]
}

variable "db_name" {
  description = "Primary Postgres database name."
  type        = string
  default     = "naqlaai"
}

variable "db_username" {
  description = "Primary Postgres username."
  type        = string
  default     = "naqlaai"
}

variable "db_backup_retention_days" {
  description = "RDS backup retention days."
  type        = number
  default     = 7
}

variable "db_multi_az" {
  description = "Enable Multi-AZ for RDS."
  type        = bool
  default     = false
}

variable "redis_node_type" {
  description = "ElastiCache node instance type."
  type        = string
  default     = "cache.t4g.micro"
}

variable "openai_api_key" {
  description = "OpenAI API key injected into secrets."
  type        = string
  sensitive   = true
  default     = ""
}

variable "jwt_secret_base64" {
  description = "JWT secret in base64 format."
  type        = string
  sensitive   = true
  default     = "VGhpc0lzQURldmVsb3BtZW50U2VjcmV0S2V5VGhhdElzQXRMZWFzdDY0Qnl0ZXNMb25nISE="
}

variable "openai_model" {
  description = "Default OpenAI model name."
  type        = string
  default     = "gpt-4o-mini"
}

variable "openai_temperature" {
  description = "Default OpenAI model temperature."
  type        = number
  default     = 0.1
}

variable "image_tag" {
  description = "Container image tag to deploy to ECS."
  type        = string
  default     = "latest"
}

variable "frontend_desired_count" {
  description = "Desired ECS tasks for frontend."
  type        = number
  default     = 1
}

variable "backend_desired_count" {
  description = "Desired ECS tasks for backend."
  type        = number
  default     = 1
}

variable "create_dns_records" {
  description = "Whether to create ACM + Route53 records."
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Primary app domain."
  type        = string
  default     = ""
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone id for domain."
  type        = string
  default     = ""
}
