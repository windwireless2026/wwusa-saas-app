-- =====================================================
-- PADRONIZAÇÃO: Adicionar 'admin' ao enum e migrar dados
-- =====================================================

-- 1. Adicionar 'admin' ao enum user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- 2. Migrar todos os super_admin para admin
UPDATE profiles 
SET role = 'admin' 
WHERE role = 'super_admin';

-- 3. Verificar
SELECT role, COUNT(*) as total 
FROM profiles 
GROUP BY role;
