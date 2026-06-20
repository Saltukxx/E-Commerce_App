# DurmusBaba Backend

NestJS REST API for the DurmusBaba HVAC marketplace.

## Stack

- NestJS 10 + Prisma + PostgreSQL
- JWT auth with refresh tokens
- Multi-vendor cart, orders, Stripe checkout (optional)
- Static product images under `/uploads`

## Environment

Copy `.env.production.example` and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Access token signing secret |
| `JWT_EXPIRES_IN` | Access token TTL (default `15m`) |
| `CORS_ORIGINS` | Comma-separated origins or `*` |
| `ALLOW_UNPAID_ORDERS` | `true` (B2B) or `false` when Stripe is live |
| `STRIPE_SECRET_KEY` | Stripe secret (optional) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `DEPLOY_CONTAINER` | Docker container name for uploads sync |

## Local development

```bash
npm install
npx prisma migrate deploy
npm run start:dev
```

API prefix: `/api/v1`

## Production (Docker)

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker exec -it ecommerce-backend npx prisma migrate deploy
```

## Security middleware

- Helmet headers
- CORS from `CORS_ORIGINS`
- Rate limiting (120 req/min default; webhook skipped)

## Key endpoints

| Method | Path | Notes |
|--------|------|-------|
| POST | `/auth/login` | Returns access + refresh tokens |
| POST | `/auth/refresh` | Rotate tokens |
| GET | `/products` | Catalog list/search |
| GET | `/products/slug/:slug` | Single product by slug |
| POST | `/orders/:userId/place` | B2B unpaid checkout |
| POST | `/checkout/:userId/session` | Stripe session |
| GET/POST | `/price-inquiries` | Price-on-request workflow |
| PATCH | `/admin/price-inquiries/:id` | Admin quote/status |

## Tests

```bash
npm test
npm run test:e2e
```

## Migrations

All migrations live under `prisma/migrations/` with `migration_lock.toml` (PostgreSQL).

```bash
npx prisma migrate deploy   # production
npx prisma migrate dev        # local dev only
```

## Scripts

Operational scripts under `scripts/` — see [docs/OPS_RUNBOOK.md](../docs/OPS_RUNBOOK.md) and [docs/IMAGE_PIPELINE.md](../docs/IMAGE_PIPELINE.md).
