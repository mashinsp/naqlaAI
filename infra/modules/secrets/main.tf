resource "aws_secretsmanager_secret" "backend" {
  name = "${var.name_prefix}/backend"
  tags = merge(var.tags, { Name = "${var.name_prefix}-backend-secret" })
}

resource "aws_secretsmanager_secret_version" "backend" {
  secret_id = aws_secretsmanager_secret.backend.id
  secret_string = jsonencode(merge(
    {
      OPENAI_API_KEY    = var.openai_api_key
      JWT_SECRET_BASE64 = var.jwt_secret_base64
    },
    var.extra_secret_values
  ))
}
