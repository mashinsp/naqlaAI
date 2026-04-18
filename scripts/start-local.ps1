Param(
  [switch]$Rebuild
)

$ErrorActionPreference = "Stop"

if ($Rebuild) {
  docker compose down --remove-orphans
}

docker compose up --build
