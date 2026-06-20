CREATE INDEX IF NOT EXISTS "Product_active_category_id_idx"
  ON "Product" ("categoryId", "id")
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS "Product_active_store_price_id_idx"
  ON "Product" ("storeId", "price", "id")
  WHERE status = 'active';
