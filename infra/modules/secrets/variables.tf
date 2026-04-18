variable "name_prefix" {
  type = string
}

variable "openai_api_key" {
  type      = string
  sensitive = true
}

variable "jwt_secret_base64" {
  type      = string
  sensitive = true
}

variable "extra_secret_values" {
  type    = map(string)
  default = {}
}

variable "tags" {
  type    = map(string)
  default = {}
}
