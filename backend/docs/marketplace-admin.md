# Marketplace admin runbook

Admin account (seed): `admin@durmusbaba.com` / `admin123`  
Official vendor (DRC-Kältetechnik): `vendor@drc-kaltetechnik.de` / `vendor123`

Production: `http://167.172.168.81`  
Local API: `http://localhost:3000/api/v1`

## Web panels

| Role | Login | Panel URL |
|------|-------|-----------|
| Admin | `/anmelden` | `/admin/dashboard` |
| Vendor | `/anmelden` | `/vendor/dashboard` |

After login, admins and vendors also see a panel link on `/profil`.

### Admin panel routes

- `/admin/dashboard` — KPIs + recent orders
- `/admin/store-applications` — approve/reject vendor applications (filter by status)
- `/admin/stores` — list shops; `/admin/stores/:id` — edit profile, Stripe onboard/sync
- `/admin/categories` — category CRUD
- `/admin/products` — list/filter; `/admin/products/new` or `/admin/products/:id` — create/edit with uploads
- `/admin/orders` — list/filter; `/admin/orders/:id` — read-only detail
- `/admin/price-inquiries` — quote pending inquiries
- `/admin/payout-requests` — review vendor payout requests (approve / reject / mark paid)

### Vendor panel routes (Händlerportal)

- `/vendor/dashboard` — KPIs, balance widget, revenue chart, recent orders
- `/vendor/products` — catalog list with category filters, bulk actions, duplicate
- `/vendor/products/new` — create product (images, category, price or quote mode)
- `/vendor/products/import` — Excel/CSV bulk import with preview
- `/vendor/orders` — fulfillment pipeline with customer + payment status
- `/vendor/price-inquiries` — respond to quotes, close inquiries
- `/vendor/store` — profile editor with live storefront preview + featured products
- `/vendor/finance` — balance, ledger, payout requests
- `/vendor/analytics` — revenue charts, top products, category breakdown

## Payout model (platform ledger)

Set `PAYOUT_MODE=platform_ledger` in backend env. When a customer pays via Stripe Checkout:

1. Platform fee (`PLATFORM_FEE_PERCENT`) is deducted
2. Net amount is credited to the vendor's ledger (`VendorLedgerEntry`)
3. Vendor requests payout from `/vendor/finance`
4. Admin processes requests at `/admin/payout-requests` (approve → manual bank transfer → mark paid)

With `PAYOUT_MODE=platform_ledger`, Stripe Connect instant transfers are skipped at checkout.

## 1. Login as admin

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@durmusbaba.com",
  "password": "admin123"
}
```

Use the returned `accessToken` as `Authorization: Bearer <token>`.

## 2. Review seller applications

```http
GET /admin/store-applications?status=pending
Authorization: Bearer <admin-token>
```

Status filter: `pending`, `approved`, `rejected`, or `all`.

## 3. Approve an application

```http
POST /admin/store-applications/{id}/approve
Authorization: Bearer <admin-token>
```

Response includes `store`, `vendorEmail`, and `tempPassword` when a new vendor user was created. The admin UI shows the temporary password once for copy/paste.

## 4. Reject an application

```http
POST /admin/store-applications/{id}/reject
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "rejectionReason": "Incomplete business details"
}
```

## 5. Categories (admin CRUD)

```http
GET /admin/categories
POST /admin/categories
PATCH /admin/categories/{id}
DELETE /admin/categories/{id}
```

Delete returns 409 if products are still assigned.

## 6. Suspend or reactivate a store

```http
PATCH /admin/stores/{storeId}/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{ "status": "suspended" }
```

Suspended stores are hidden from catalog and blocked at checkout. Suspended vendors cannot update products, store profile, uploads, order status, or create payout requests.

## 7. Stripe (admin only)

From `/admin/stores/:id`:

```http
POST /admin/stores/{storeId}/stripe-onboard
POST /admin/stores/{storeId}/stripe-sync
```

## 8. Product uploads

```http
POST /admin/uploads/product-image
POST /admin/uploads/store-banner
POST /admin/uploads/products/{productId}/images
```

Vendor equivalents under `/vendor/uploads/*`.

## 9. Vendor product import

```http
GET /vendor/products/import/template
POST /vendor/products/import/preview   (multipart file)
POST /vendor/products/import             (multipart file + mode=upsert|create_only)
PATCH /vendor/products/bulk              ({ ids, status?, categoryId? })
POST /vendor/products/{id}/duplicate
```

## 10. Vendor order management

```http
GET /vendor/orders?status=&skip=&limit=
GET /vendor/orders/{orderId}

PATCH /vendor/orders/{orderId}/status
Authorization: Bearer <vendor-token>
Content-Type: application/json

{ "status": "Confirmed" }
```

Allowed statuses: `Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`.

## 11. Vendor finance

```http
GET /vendor/finance/summary
GET /vendor/finance/ledger?skip=&limit=
GET /vendor/finance/payout-requests
POST /vendor/finance/payout-requests
```

## 12. Admin payout requests

```http
GET /admin/payout-requests?status=pending
PATCH /admin/payout-requests/{id}
Content-Type: application/json

{ "status": "approved", "adminNote": "..." }
```

Statuses: `approved`, `rejected`, `paid`.

## 13. Public seller application (no auth)

```http
POST /store-applications
Content-Type: application/json

{
  "businessName": "CoolAir GmbH",
  "contactName": "Max Mustermann",
  "contactEmail": "max@coolair.de",
  "phone": "+49 40 123456",
  "message": "HVAC wholesaler based in Hamburg"
}
```

## 14. Import vendor catalog (CLI)

```powershell
cd backend
$env:STORE_SLUG="coolair-gmbh"
npm run sync:products
```

Default `STORE_SLUG=drc-kaltetechnik` targets the official DRC vendor catalog. DurmusBaba is the marketplace brand only (not a store).

## 16. Panel → storefront / mobile sync

All clients read the **same public API** (`/api/v1`). Admin and vendor panels write via `/admin/*` and `/vendor/*`.

| Change in panel | Visible on website | Visible on Android |
|-----------------|-------------------|------------------|
| Product create/update (status **active**) | Yes — `/katalog`, home rows, `/produkt/[slug]` | Yes — catalog + store profile |
| Product **draft/archived** | Hidden (public API filters sellable products) | Hidden |
| Category image/name | Home category tiles + catalog filters | Category list |
| Store profile (logo, banner, description) | `/shop/[slug]` | Store profile screen |
| Store **isFeatured** (admin) | Homepage showcase section | Home showcase row |
| Store **suspended** | Hidden from catalog + checkout | Hidden |

**Env (production):**

```env
PUBLIC_UPLOADS_BASE=http://167.172.168.81   # absolute image URLs in API JSON
STOREFRONT_URL=http://167.172.168.81        # backend triggers Next.js revalidate
REVALIDATE_SECRET=...                       # same on backend + web
NEXT_PUBLIC_UPLOADS_BASE=http://167.172.168.81
```

Android: `API_BASE_URL=http://167.172.168.81/api/v1`, `UPLOADS_BASE_URL=http://167.172.168.81` in `gradle.properties`.

After product/category/store mutations, the API calls `POST /api/revalidate` on the storefront (when env is set). ISR cache is also capped at 60s on home/catalog routes.


1. Login as vendor → `/vendor/dashboard`
2. Create product with category + image → `/vendor/products/new`
3. Bulk import CSV → `/vendor/products/import`
4. Update order status → `/vendor/orders`
5. Check balance after paid order → `/vendor/finance`
6. Submit payout request → admin approves at `/admin/payout-requests`
