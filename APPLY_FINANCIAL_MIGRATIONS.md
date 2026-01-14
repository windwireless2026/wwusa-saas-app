# 🚀 APLICAR MIGRATIONS FINANCEIRAS

## Opção 1: Via Supabase Studio (Recomendado)

### Passo 1: Abrir SQL Editor
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em "SQL Editor" no menu lateral

### Passo 2: Executar Migration 045 (Schema)
1. Clique em "New Query"
2. Copie TODO o conteúdo de `supabase/migrations/045_financial_module_complete.sql`
3. Cole no editor
4. Clique em "Run" (ou Ctrl+Enter)
5. ✅ Verifique se apareceu "Success"

### Passo 3: Executar Migration 046 (Seed Data)
1. Clique em "New Query" novamente
2. Copie TODO o conteúdo de `supabase/migrations/046_financial_module_seed_data.sql`
3. Cole no editor
4. Clique em "Run"
5. ✅ Verifique se apareceu "Success"

### Passo 4: Validar
Execute estas queries para verificar:

```sql
-- Deve retornar 15
SELECT COUNT(*) as total_grupos FROM financial_groups;

-- Deve retornar ~20
SELECT COUNT(*) as total_dre FROM dre_categories;

-- Deve retornar 7
SELECT COUNT(*) as total_batimento FROM capital_flow_categories;

-- Deve retornar ~33
SELECT COUNT(*) as total_classes FROM financial_classes;

-- Listar algumas classes para conferir
SELECT 
    fc.name as classe,
    fg.name as grupo,
    dc.name as dre,
    cf.name as batimento
FROM financial_classes fc
LEFT JOIN financial_groups fg ON fc.group_id = fg.id
LEFT JOIN dre_categories dc ON fc.dre_category_id = dc.id
LEFT JOIN capital_flow_categories cf ON fc.capital_flow_category_id = cf.id
ORDER BY fc.name
LIMIT 10;
```

---

## Opção 2: Via Supabase CLI (Avançado)

```bash
# Ir para a pasta do projeto
cd d:\dev\wwusa-saas-app

# Aplicar migrations
npx supabase db push

# Ou aplicar migration específica
npx supabase migration up
```

---

## ✅ CHECKLIST PÓS-APLICAÇÃO

- [ ] Migration 045 executada sem erros
- [ ] Migration 046 executada sem erros
- [ ] 15 grupos financeiros criados
- [ ] ~20 categorias DRE criadas
- [ ] 7 categorias de batimento criadas
- [ ] ~33 classes financeiras criadas
- [ ] RLS habilitado em todas as tabelas
- [ ] Índices criados
- [ ] Triggers funcionando

---

## 🐛 PROBLEMAS COMUNS

### Erro: "relation already exists"
**Solução:** As tabelas já existem. Pode ignorar ou dropar antes:
```sql
DROP TABLE IF EXISTS financial_budgets CASCADE;
DROP TABLE IF EXISTS financial_transactions CASCADE;
DROP TABLE IF EXISTS financial_classes CASCADE;
DROP TABLE IF EXISTS capital_flow_categories CASCADE;
DROP TABLE IF EXISTS dre_categories CASCADE;
DROP TABLE IF EXISTS financial_groups CASCADE;

-- Depois executar as migrations novamente
```

### Erro: "duplicate key value"
**Solução:** Dados já foram inseridos. Execute:
```sql
DELETE FROM financial_classes;
DELETE FROM capital_flow_categories;
DELETE FROM dre_categories;
DELETE FROM financial_groups;

-- Depois executar migration 046 novamente
```

---

## 📝 PRÓXIMOS PASSOS APÓS APLICAÇÃO

1. ✅ Validar dados
2. 🔄 Criar página de Classes Financeiras
3. 🔄 Criar página de Lançamentos
4. 🔄 Criar relatórios

**Vamos construir! 🚀**
