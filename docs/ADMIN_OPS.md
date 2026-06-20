# Admin Operations (HTTP)

Use an admin JWT from `POST /api/v1/auth/login` with an admin account.

Base URL: `http://167.172.168.81:3001/api/v1`

## Store applications

```bash
# List pending applications
curl -H "Authorization: Bearer $TOKEN" \
  http://167.172.168.81:3001/api/v1/admin/store-applications

# Approve (temp password is logged server-side, not returned in API)
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  http://167.172.168.81:3001/api/v1/admin/store-applications/1/approve
```

## Price inquiries

```bash
# List all inquiries
curl -H "Authorization: Bearer $TOKEN" \
  http://167.172.168.81:3001/api/v1/admin/price-inquiries

# Quote a pending inquiry
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"quoted","quoteCents":12500,"adminNote":"Netto, zzgl. MwSt."}' \
  http://167.172.168.81:3001/api/v1/admin/price-inquiries/1
```

Status values: `pending`, `quoted`, `closed`.

## Stripe vendor onboarding

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://167.172.168.81:3001/api/v1/admin/payments/stores/1/onboarding-link
```

## Orders

Customer orders: `GET /api/v1/orders/:userId` (user JWT).

Admin order listing is not exposed as a UI — query PostgreSQL directly or extend API as needed:

```sql
SELECT og.id, og."paymentStatus", og."grandTotal", og."createdAt"
FROM "OrderGroup" og
ORDER BY og.id DESC
LIMIT 20;
```

## Featured stores

Toggle `Store.isFeatured` in database until admin API is added:

```sql
UPDATE "Store" SET "isFeatured" = true WHERE slug = 'durmusbaba-store';
```
