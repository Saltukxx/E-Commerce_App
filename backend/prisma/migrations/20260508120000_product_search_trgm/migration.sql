-- Enable trigram indexes for case-insensitive substring search on products
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Product_title_trgm_idx" ON "Product" USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Product_slug_trgm_idx" ON "Product" USING GIN (slug gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Product_description_trgm_idx" ON "Product" USING GIN (description gin_trgm_ops);
