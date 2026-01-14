-- =====================================================
-- SCRIPT 1: ADICIONAR 'ADMIN' AO ENUM
-- Execute ESTE script PRIMEIRO e SOZINHO!
-- =====================================================

-- Adicionar 'admin' ao enum user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- ✅ SUCESSO! Agora execute o SCRIPT 2
