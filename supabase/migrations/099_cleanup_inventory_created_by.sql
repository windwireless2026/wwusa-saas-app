-- Migration: 099_cleanup_inventory_created_by.sql
-- Description: Nullify created_by references to deleted Erik user in inventory
-- Date: 2026-02-03

-- Update inventory records that reference the deleted Erik user
UPDATE inventory
SET created_by = NULL
WHERE created_by = '8dbaf29f-5caf-4344-ba37-f5dacac0d190';

-- Verification
/*
SELECT COUNT(*) 
FROM inventory 
WHERE created_by = '8dbaf29f-5caf-4344-ba37-f5dacac0d190';

-- Expected: 0
*/
