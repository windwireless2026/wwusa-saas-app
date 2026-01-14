-- Performance Optimization: Indexes and Query Improvements
-- CORRIGIDO: Usa apenas colunas que EXISTEM nas tabelas

-- ============================================
-- 1. PROFILES TABLE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NULL;

-- ============================================
-- 2. INVENTORY TABLE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_inventory_model ON public.inventory(model);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_imei ON public.inventory(imei) WHERE imei IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_serial_number ON public.inventory(serial_number) WHERE serial_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_location ON public.inventory(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_supplier ON public.inventory(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_created_by ON public.inventory(created_by);
CREATE INDEX IF NOT EXISTS idx_inventory_deleted_at ON public.inventory(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON public.inventory(created_at DESC);

-- Compound index for common queries
CREATE INDEX IF NOT EXISTS idx_inventory_model_status ON public.inventory(model, status) 
WHERE deleted_at IS NULL;

-- ============================================
-- 3. PRODUCT CATALOG INDEXES
-- ============================================
-- NOTA: product_catalog tem: name, type, manufacturer (todos TEXT)
-- NÃO tem: model, manufacturer_id, product_type_id

CREATE INDEX IF NOT EXISTS idx_catalog_name ON public.product_catalog(name);
CREATE INDEX IF NOT EXISTS idx_catalog_manufacturer ON public.product_catalog(manufacturer);
CREATE INDEX IF NOT EXISTS idx_catalog_type ON public.product_catalog(type);
CREATE INDEX IF NOT EXISTS idx_catalog_release_year ON public.product_catalog(release_year);
CREATE INDEX IF NOT EXISTS idx_catalog_deleted_at ON public.product_catalog(deleted_at) WHERE deleted_at IS NULL;

-- Full text search on product name
CREATE INDEX IF NOT EXISTS idx_catalog_name_search ON public.product_catalog 
USING gin(to_tsvector('english', name));

-- ============================================
-- 4. AGENTS TABLE INDEXES
-- ============================================
-- NOTA: agents tem: roles (array), NÃO tem is_supplier ou is_customer

CREATE INDEX IF NOT EXISTS idx_agents_name ON public.agents(name);
CREATE INDEX IF NOT EXISTS idx_agents_email ON public.agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_country ON public.agents(country);
CREATE INDEX IF NOT EXISTS idx_agents_deleted_at ON public.agents(deleted_at) WHERE deleted_at IS NULL;

-- ============================================
-- 5. STOCK LOCATIONS INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_stock_locations_deleted_at ON public.stock_locations(deleted_at) 
WHERE deleted_at IS NULL;

-- ============================================
-- 6. MANUFACTURERS & PRODUCT TYPES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_manufacturers_name ON public.manufacturers(name);
CREATE INDEX IF NOT EXISTS idx_manufacturers_deleted_at ON public.manufacturers(deleted_at) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_product_types_name ON public.product_types(name);
CREATE INDEX IF NOT EXISTS idx_product_types_deleted_at ON public.product_types(deleted_at) 
WHERE deleted_at IS NULL;

-- ============================================
-- 7. ADD COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON INDEX idx_inventory_model_status IS 'Optimizes queries filtering by model and status';
COMMENT ON INDEX idx_catalog_name_search IS 'Full-text search on product names';
COMMENT ON INDEX idx_inventory_imei IS 'Sparse index for IMEI lookups (only non-null values)';

-- ============================================
-- 8. STATISTICS UPDATE
-- ============================================

-- Update table statistics for better query planning
ANALYZE public.profiles;
ANALYZE public.inventory;
ANALYZE public.product_catalog;
ANALYZE public.agents;
ANALYZE public.manufacturers;
ANALYZE public.product_types;
ANALYZE public.stock_locations;
