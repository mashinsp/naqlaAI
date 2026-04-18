variable "name_prefix" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "alb_security_group_id" {
  type = string
}

variable "frontend_security_group" {
  type = string
}

variable "backend_security_group" {
  type = string
}

variable "frontend_image" {
  type = string
}

variable "backend_image" {
  type = string
}

variable "frontend_container_port" {
  type    = number
  default = 3000
}

variable "backend_container_port" {
  type    = number
  default = 8080
}

variable "desired_count_frontend" {
  type    = number
  default = 1
}

variable "desired_count_backend" {
  type    = number
  default = 1
}

variable "frontend_env" {
  type    = map(string)
  default = {}
}

variable "backend_env" {
  type    = map(string)
  default = {}
}

variable "tags" {
  type    = map(string)
  default = {}
}
