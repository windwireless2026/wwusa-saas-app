-- =====================================================
-- Verificar se existem estimates e políticas RLS
-- Rode no SQL Editor do Supabase (como usuário autenticado
-- ou com role que enxerga a tabela).
-- =====================================================

-- 1) Contagem total (ignorando RLS, só para diagnóstico)
SELECT 'Total rows in estimates (bypass RLS)' AS check_type, COUNT(*) AS cnt
FROM public.estimates;

SELECT 'Non-deleted estimates' AS check_type, COUNT(*) AS cnt
FROM public.estimates
WHERE deleted_at IS NULL;

-- 2) Amostra de estimates (últimas 5)
SELECT id, estimate_number, customer_id, estimate_date, status, total, deleted_at, created_at
FROM public.estimates
WHERE deleted_at IS NULL
ORDER BY estimate_number DESC
LIMIT 5;

-- 3) Políticas RLS na tabela estimates
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'estimates';

-- 4) Se a tabela tem coluna company_id (não deveria)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'estimates'
ORDER BY ordinal_position;
