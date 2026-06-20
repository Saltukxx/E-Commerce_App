# Deploy DurmusBaba full stack (API + web + nginx) to production
# Requires: SSH host `durmusbaba` (see ~/.ssh/config), rsync or scp, Docker on server
#
# Before first run:
#   1. ssh-add   # unlock id_rsa passphrase
#   2. Copy .env.production.example to .env on server OR sync local .env
#
# Usage:
#   .\scripts\deploy-full-stack.ps1

$ErrorActionPreference = 'Stop'
$Remote = if ($env:DEPLOY_HOST) { $env:DEPLOY_HOST } else { 'durmusbaba' }
$RemoteDir = if ($env:DEPLOY_DIR) { $env:DEPLOY_DIR } else { '/opt/durmusbaba' }
$RepoRoot = Split-Path $PSScriptRoot -Parent

Write-Host "Testing SSH to $Remote ..."
ssh -o BatchMode=yes $Remote "echo ok" | Out-Null

Write-Host "Creating remote directory $RemoteDir ..."
ssh $Remote "mkdir -p $RemoteDir"

Write-Host "Syncing files (tar over ssh) ..."
$tarExclude = @(
  '--exclude=node_modules',
  '--exclude=.git',
  '--exclude=backend/uploads',
  '--exclude=web/.next',
  '--exclude=presentation/build',
  '--exclude=*.xlsx',
  '--exclude=*.xls',
  '--exclude=*.pdf',
  '--exclude=*.tar'
)

Push-Location $RepoRoot
try {
  if (Get-Command tar -ErrorAction SilentlyContinue) {
    tar -czf - @tarExclude backend web nginx docker-compose.prod.server.yml .env.production.example README.md |
      ssh $Remote "cd $RemoteDir && tar -xzf -"
  } else {
    Write-Error "tar not found. Install tar (Windows 10+) or use WSL deploy-full-stack.sh"
  }
} finally {
  Pop-Location
}

Write-Host "Ensuring .env on server ..."
ssh $Remote @"
if [ ! -f $RemoteDir/.env ]; then
  cp $RemoteDir/.env.production.example $RemoteDir/.env
  echo 'WARNING: Using template .env — set JWT_SECRET and POSTGRES_PASSWORD on server!'
fi
"@

Write-Host "Docker compose up --build ..."
ssh $Remote "cd $RemoteDir && docker compose -f docker-compose.prod.server.yml --env-file .env up -d --build"

Write-Host "Migrations ..."
ssh $Remote "cd $RemoteDir && docker compose -f docker-compose.prod.server.yml exec -T api npx prisma migrate deploy"

Write-Host "Smoke tests ..."
curl.exe -sf "http://167.172.168.81:3001/api/v1/products?limit=1" | Select-Object -First 1
curl.exe -sf -o NUL -w "web port 80: %{http_code}`n" "http://167.172.168.81/"
curl.exe -sf -o NUL -w "api via nginx: %{http_code}`n" "http://167.172.168.81/api/v1/products?limit=1"

Write-Host "Deploy complete."
