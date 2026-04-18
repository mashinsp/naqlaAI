output "app_domain" {
  value = var.create ? var.domain_name : ""
}

output "certificate_arn" {
  value = var.create ? aws_acm_certificate.app[0].arn : ""
}
