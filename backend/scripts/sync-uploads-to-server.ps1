# Sync backend/uploads/products to the production Docker volume.
# Requires SSH access to the server hosting 167.172.168.81
#
# Usage:
#   $env:DEPLOY_HOST = "root@167.172.168.81"
#   $env:DEPLOY_CONTAINER = "backend-api-1"   # docker ps --format "{{.Names}}"
#   .\scripts\sync-uploads-to-server.ps1
#
# Sync only images flagged by audit (faster):
#   .\scripts\sync-uploads-to-server.ps1 -OnlyBad

param(
  [switch]$OnlyBad
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$HostTarget = $env:DEPLOY_HOST
$Container = $env:DEPLOY_CONTAINER
$LocalDir = Join-Path $PSScriptRoot "..\uploads\products"
$BadList = Join-Path $PSScriptRoot "bad-product-images.json"

if (-not $HostTarget) {
  Write-Error "Set DEPLOY_HOST, e.g. root@167.172.168.81"
}
if (-not $Container) {
  Write-Error "Set DEPLOY_CONTAINER to the running API container name"
}
if (-not (Test-Path $LocalDir)) {
  Write-Error "Missing local uploads folder: $LocalDir"
}

$filesToSync = @()
if ($OnlyBad) {
  if (-not (Test-Path $BadList)) {
    Write-Error "Missing bad-product-images.json — run audit-product-images.py first"
  }
  $bad = Get-Content $BadList -Raw | ConvertFrom-Json
  foreach ($item in $bad) {
    $path = Join-Path $LocalDir $item.filename
    if (Test-Path $path) { $filesToSync += $path }
  }
  Write-Host "Syncing $($filesToSync.Count) fixed images ..."
} else {
  $filesToSync = Get-ChildItem $LocalDir -Filter *.jpg | ForEach-Object { $_.FullName }
  Write-Host "Syncing all $($filesToSync.Count) product images ..."
}

if ($filesToSync.Count -eq 0) {
  Write-Error "No image files to sync"
}

ssh $HostTarget "mkdir -p /tmp/durmus-product-images"
foreach ($file in $filesToSync) {
  scp $file "${HostTarget}:/tmp/durmus-product-images/"
}

Write-Host "Copying into Docker volume ..."
ssh $HostTarget "docker exec $Container mkdir -p /app/uploads/products && docker cp /tmp/durmus-product-images/. ${Container}:/app/uploads/products/"

Write-Host "Done."