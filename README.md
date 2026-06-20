# DurmusBaba — HVAC Marketplace

German-language Android marketplace for HVAC products (compressors, refrigeration, accessories) with a NestJS + PostgreSQL backend.

## Repository layout

| Path | Purpose |
|------|---------|
| `presentation/` | Android app (Jetpack Compose, Koin, Coil) |
| `domain/` | Use cases and interfaces |
| `data/` | Ktor HTTP client and repositories |
| `backend/` | NestJS API, Prisma, Docker deploy |
| `web/` | Next.js web storefront, admin panel, vendor portal |
| `nginx/` | Production reverse proxy config |
| `docker-compose.prod.yml` | Full stack: API + web + nginx + PostgreSQL |
| `docs/OPS_RUNBOOK.md` | Deploy, migrations, smoke tests |
| `docs/ADMIN_OPS.md` | Admin HTTP workflows |
| `docs/IMAGE_PIPELINE.md` | Product image audit/fix/deploy |

## Quick start (Android)

1. Open the project in Android Studio (Giraffe+).
2. API base URL defaults in `gradle.properties`:

   `API_BASE_URL=http://167.172.168.81:3001/api/v1`

3. Build debug APK:

   ```bash
   ./gradlew :presentation:assembleDebug
   ```

4. Unit tests:

   ```bash
   ./gradlew :presentation:testDebugUnitTest
   ```

## Quick start (backend)

```bash
cd backend
cp .env.production.example .env
npm install
npx prisma migrate deploy
npm run start:dev
```

See [backend/README.md](backend/README.md) for production Docker deployment.

## Quick start (web)

```bash
cd web
cp .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Set `NEXT_PUBLIC_API_URL` to your NestJS API (default `http://localhost:3000/api/v1` when using backend on port 3000).

### Web roles

| Role | Login | Area |
|------|-------|------|
| Customer | any registered user | Storefront (`/`, `/katalog`, cart, orders) |
| Admin | `admin@durmusbaba.com` (seed) | `/admin/*` |
| Vendor | approved seller account | `/vendor/*` |

## Full stack deploy (Docker)

From repo root:

```bash
cp backend/.env.production.example .env
docker compose -f docker-compose.prod.yml up -d --build
```

Nginx serves the web app on port 80, proxies `/api/v1` and `/uploads` to the API.

## Checkout modes

- **B2B (default):** `ALLOW_UNPAID_ORDERS=true` — Android places unpaid orders (`STRIPE_PAYMENTS_ENABLED=false`).
- **Stripe:** Set Stripe env vars, `ALLOW_UNPAID_ORDERS=false`, enable Stripe SDK in `presentation/build.gradle.kts`, set `STRIPE_PAYMENTS_ENABLED=true`.

## CI

GitHub Actions runs backend unit tests, web lint/build, and Android presentation unit tests on push/PR (`.github/workflows/ci.yml`).

## Production server

- API: `http://167.172.168.81:3001/api/v1`
- Static uploads: `/uploads/products/{Lagercode}.jpg`
- Preferred Docker container: `ecommerce-backend` (see ops runbook)

## License

Private / internal project.
