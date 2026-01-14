-- =====================================================
-- QUERY DE VALIDAÇÃO - MÓDULO FINANCEIRO
-- Execute esta query completa para verificar tudo
-- =====================================================

-- 1. CONTAR TOTAIS
SELECT 
    'financial_groups' as tabela, 
    COUNT(*) as total,
    'Grupos de classificação' as descricao
FROM financial_groups
UNION ALL
SELECT 
    'dre_categories', 
    COUNT(*),
    'Categorias do DRE Gerencial'
FROM dre_categories
UNION ALL
SELECT 
    'capital_flow_categories', 
    COUNT(*),
    'Categorias de Batimento Capital'
FROM capital_flow_categories
UNION ALL
SELECT 
    'financial_classes', 
    COUNT(*),
    'Classes Financeiras (Principal)'
FROM financial_classes
UNION ALL
SELECT 
    'financial_transactions', 
    COUNT(*),
    'Transações registradas'
FROM financial_transactions
UNION ALL
SELECT 
    'financial_budgets', 
    COUNT(*),
    'Orçamentos criados'
FROM financial_budgets;

-- 2. VER ALGUMAS CLASSES COM RELACIONAMENTOS
SELECT 
    fc.name as classe,
    fg.name as grupo,
    dc.name as dre_categoria,
    cf.name as batimento_capital,
    fc.subcategory
FROM financial_classes fc
LEFT JOIN financial_groups fg ON fc.group_id = fg.id
LEFT JOIN dre_categories dc ON fc.dre_category_id = dc.id
LEFT JOIN capital_flow_categories cf ON fc.capital_flow_category_id = cf.id
ORDER BY fc.name
LIMIT 15;

-- 3. VER DISTRIBUIÇÃO POR GRUPO
SELECT 
    fg.name as grupo,
    COUNT(fc.id) as total_classes
FROM financial_groups fg
LEFT JOIN financial_classes fc ON fc.group_id = fg.id
GROUP BY fg.id, fg.name
ORDER BY total_classes DESC;

-- 4. VER CATEGORIAS DRE
SELECT 
    name as categoria,
    category_type as tipo,
    is_subtotal as "é_subtotal",
    is_total as "é_total",
    display_order as ordem
FROM dre_categories
ORDER BY display_order;

-- ✅ SE TODOS OS SELECTS ACIMA RETORNARAM DADOS, O MÓDULO ESTÁ FUNCIONANDO!
