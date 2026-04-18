variable "name_prefix" {
  type = string
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "rds_security_group" {
  type = string
}

variable "backup_retention" {
  type    = number
  default = 7
}

variable "multi_az" {
  type    = bool
  default = false
}

variable "tags" {
  type    = map(string)
  default = {}
}
