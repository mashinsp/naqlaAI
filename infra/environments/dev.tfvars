project_name = "naqlaai"
environment  = "dev"
aws_region   = "eu-central-1"

db_multi_az            = false
frontend_desired_count = 1
backend_desired_count  = 1
create_dns_records     = false
redis_node_type        = "cache.t4g.micro"
image_tag              = "latest"
