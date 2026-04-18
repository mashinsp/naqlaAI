resource "aws_acm_certificate" "app" {
  count             = var.create ? 1 : 0
  domain_name       = var.domain_name
  validation_method = "DNS"
  tags              = var.tags
}

resource "aws_route53_record" "cert_validation" {
  count = var.create ? 1 : 0

  # domain_validation_options is a set, so convert to list for stable access.
  # We issue a single-domain certificate in this baseline, so first element is valid.
  # Use SAN-aware mapping when adding multiple names later.
  zone_id = var.hosted_zone_id
  name    = tolist(aws_acm_certificate.app[0].domain_validation_options)[0].resource_record_name
  type    = tolist(aws_acm_certificate.app[0].domain_validation_options)[0].resource_record_type
  records = [tolist(aws_acm_certificate.app[0].domain_validation_options)[0].resource_record_value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "app" {
  count                   = var.create ? 1 : 0
  certificate_arn         = aws_acm_certificate.app[0].arn
  validation_record_fqdns = [aws_route53_record.cert_validation[0].fqdn]
}

resource "aws_route53_record" "app_alias" {
  count   = var.create ? 1 : 0
  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
}
