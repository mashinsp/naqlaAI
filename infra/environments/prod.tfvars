project_name = "naqlaai"
environment  = "prod"
aws_region   = "eu-central-1"

db_multi_az            = true
frontend_desired_count = 2
backend_desired_count  = 2
create_dns_records     = true
redis_node_type        = "cache.t4g.small"
image_tag              = "latest"

# Set these before production apply:
domain_name    = "mashinsp-naqlaai.com"
hosted_zone_id = "Z0691372Q5G8NC4T5TYG"
