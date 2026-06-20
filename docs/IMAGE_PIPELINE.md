# Product Image Pipeline

Canonical workflow for HVAC product images served at:

`http://167.172.168.81:3001/uploads/products/{Lagercode}.jpg`

## Sources

| Path | Role |
|------|------|
| `export/product-images/` | Good images fetched/mapped manually |
| `export/image-mapping.json` | SKU → filename map |
| `backend/uploads/products/` | Local staging before deploy |
| Server container `/app/uploads/products/` | Production files |

## Workflow (fix bad images only)

**Do not** run `fix-product-images.py --force` on the full catalog — it can overwrite good server fixes with stale export data.

```powershell
cd backend/scripts

# 1. Audit local or remote images
python audit-product-images.py

# 2. Fix only flagged SKUs
python fix-product-images.py --only-bad

# 3. Optional: copy good images from export/
python prepare-product-uploads.py

# 4. Deploy to production container
$env:SSH_KEY_PASSPHRASE = "your-passphrase"
python deploy-product-images.py
```

PowerShell wrapper: `fix-product-images-workflow.ps1`

## Deploy script

`deploy-product-images.py`:

1. SFTP to `167.172.168.81`
2. `docker cp` into `ecommerce-backend` (or `DEPLOY_CONTAINER`)

## Android cache

After deploy, users may see old images from Coil disk cache. The app appends `?v={versionCode}` to image URLs. Bump `versionCode` in `presentation/build.gradle.kts` on image-only releases.

## Audit heuristics

`audit-product-images.py` flags:

- Extreme aspect ratios (posters, screenshots)
- Category keyword mismatches
- Very small files

Manual review still required for edge cases (e.g. DRC-10002, ITEM-23812, DRC-10000).

## Regression guard

If `prepare-product-uploads.py` runs after server fixes but before syncing export, it can restore bad images. Always audit first; use `--only-bad` fixes.
