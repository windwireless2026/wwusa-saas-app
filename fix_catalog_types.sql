-- Execute este script manualmente no Supabase SQL Editor
-- para corrigir os tipos do catálogo

-- Verificar tipos atuais
SELECT DISTINCT type, COUNT(*) as count 
FROM public.product_catalog 
WHERE deleted_at IS NULL
GROUP BY type
ORDER BY type;

-- Atualizar tipos de inglês para português
UPDATE public.product_catalog 
SET type = 'Celular' 
WHERE type = 'Cell phone' AND deleted_at IS NULL;

UPDATE public.product_catalog 
SET type = 'Tablet' 
WHERE type = 'iPad' AND deleted_at IS NULL;

UPDATE public.product_catalog 
SET type = 'Relogio' 
WHERE type = 'Watch' AND deleted_at IS NULL;

UPDATE public.product_catalog 
SET type = 'Fone' 
WHERE type = 'AirPods' AND deleted_at IS NULL;

UPDATE public.product_catalog 
SET type = 'Computador' 
WHERE type = 'Macbook' AND deleted_at IS NULL;

-- Verificar resultado
SELECT DISTINCT type, COUNT(*) as count 
FROM public.product_catalog 
WHERE deleted_at IS NULL
GROUP BY type
ORDER BY type;
