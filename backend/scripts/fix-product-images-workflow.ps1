# Fix mismatched product images — full workflow
param(
  [switch]$Deploy,
  [switch]$SkipAudit
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot "..")

Write-Host "`n[1/4] Copy good images from export/ ..."
python scripts/prepare-product-uploads.py

if (-not $SkipAudit) {
  Write-Host "`n[2/4] Audit live server images (flags mismatches only) ..."
  python scripts/audit-product-images.py --source server
} else {
  Write-Host "`n[2/4] Skipped audit — using existing bad-product-images.json"
}

Write-Host "`n[3/4] Re-download only flagged products ..."
python scripts/fix-product-images.py --only-bad

Write-Host "`n[4/4] Local re-check ..."
python scripts/audit-product-images.py --source uploads --min-score 4

if ($Deploy) {
  if (-not $env:DEPLOY_HOST) { $env:DEPLOY_HOST = "root@167.172.168.81" }
  if (-not $env:DEPLOY_CONTAINER) {
    Write-Error "Set DEPLOY_CONTAINER to your API container name (docker ps --format '{{.Names}}')"
  }
  Write-Host "`nDeploying fixed images to server ..."
  & (Join-Path $PSScriptRoot "sync-uploads-to-server.ps1") -OnlyBad
} else {
  Write-Host "`nTo push fixes to production:"
  Write-Host '  $env:DEPLOY_HOST = "root@167.172.168.81"'
  Write-Host '  $env:DEPLOY_CONTAINER = "<your-api-container>"'
  Write-Host "  .\scripts\sync-uploads-to-server.ps1 -OnlyBad"
}
