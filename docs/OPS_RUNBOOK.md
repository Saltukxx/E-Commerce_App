# DurmusBaba Operations Runbook

Unified guide for deploying backend, applying migrations, and smoke-testing production.

## Production target

| Item | Value |
|------|-------|
| Host | `167.172.168.81` |
| API port | `3001` |
| Preferred container | `ecommerce-backend` |
| Fallback env | `DEPLOY_CONTAINER` in `.env` |

Verify the active container before deploy:

```bash
ssh durmusbaba "docker ps --format '{{.Names}}' | grep backend"
```

## Backend deploy

```bash
cd backend
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker exec ecommerce-backend npx prisma migrate deploy
```

### Post-deploy smoke tests

```bash
curl -s http://167.172.168.81:3001/api/v1/products?limit=1 | head
curl -s -o /dev/null -w "%{http_code}" http://167.172.168.81:3001/uploads/products/DRC-10009.jpg
```

Expect HTTP 200 for both.

## Environment checklist

- [ ] `JWT_SECRET` set (not default)
- [ ] `ALLOW_UNPAID_ORDERS` matches checkout strategy
- [ ] Stripe vars set if card payments enabled
- [ ] `CORS_ORIGINS` restricted in production
- [ ] Seed **not** run with default `admin123` on production

## Database migrations

From backend directory:

```powershell
# Windows
.\scripts\db-apply.ps1

# Linux/macOS
./scripts/db-apply.sh
```

Or manually:

```bash
npx prisma migrate deploy
```

## Product images

See [IMAGE_PIPELINE.md](IMAGE_PIPELINE.md).

Quick fix bad images only:

```powershell
cd backend/scripts
python audit-product-images.py
python fix-product-images.py --only-bad
python deploy-product-images.py
```

## Android APK export

```bash
./gradlew :presentation:assembleDebug
```

APK: `presentation/build/outputs/apk/debug/presentation-debug.apk`

Copy to `export/` with timestamp for field installs.

## Push notifications (FCM)

FCM is not wired in-app yet. To enable later:

1. Create Firebase project and add `google-services.json` to `presentation/`.
2. Add Google Services plugin + `firebase-messaging` dependency.
3. Implement `FirebaseMessagingService` and register device tokens on backend.
4. `NotificationHelper` in the app already creates the default channel on startup.

## Troubleshooting

| Symptom | Check |
|---------|-------|
| API 401 after app update | Clear app data; refresh token validation runs on cold start |
| Wrong product images | Coil cache — bump `versionCode` or reinstall; verify `/uploads` URL |
| Orders fail with 403 | `ALLOW_UNPAID_ORDERS=false` but app uses unpaid flow |
| Migrations fail | `migration_lock.toml` present; DB reachable from container |
