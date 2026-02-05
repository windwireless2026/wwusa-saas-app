# 🔐 MIGRATIONS 096 & 097 - GUIA DE EXECUÇÃO

**Status**: ✅ **Prontas para Deploy**  
**Data**: 03 de Fevereiro de 2026  
**Criticidade**: 🔴 **BLOQUEIA NOVO DESENVOLVIMENTO**

---

## 📋 RESUMO RÁPIDO

| Item | Descrição |
|---|---|
| **Migration 096** | Remove dados de teste + reabilita RLS |
| **Migration 097** | Adiciona company_id filtering em tabelas financeiras |
| **Tempo Total** | ~5 minutos para executar + 5 min teste = 10 min |
| **Risco** | Muito baixo (reversível) |
| **Impacto** | Fecha vulnerabilidades críticas |

---

## 🚀 PASSO-A-PASSO

### ✅ PRÉ-REQUISITOS
- [ ] Acesso a Supabase Console
- [ ] SQL Editor acessível
- [ ] Backup do database (recomendado)

---

## 🔴 PASSO 1: Executar Migration 096 (2 minutos)

### O que faz:
```
1. Remove política "Acesso_Geral_Autenticado" (all-access)
2. Remove usuário hardcoded Erik
3. Re-habilita RLS em profiles
4. Cria 3 novas policies seguras
5. Corrige trigger handle_new_user()
```

### Como executar:

**1. Abra Supabase Console**
```
https://app.supabase.com → Seu projeto → SQL Editor
```

**2. Copie TODO o conteúdo de:**
```
supabase/migrations/096_cleanup_dev_data_and_reinforce_rls.sql
```

**3. Cole no SQL Editor**

**4. Clique "Run"**

**5. Você verá:**
```
✅ Query executed successfully
```

### Verificação após execução:

```sql
-- Comando 1: Usuário hardcoded foi removido?
SELECT COUNT(*) as remaining_erik_profiles
FROM public.profiles 
WHERE email = 'erik@windwmiami.com' 
  AND id = '8dbaf29f-5caf-4344-ba37-f5dacac0d190';

-- Esperado: 0
```

```sql
-- Comando 2: Política perigosa foi removida?
SELECT COUNT(*) as dangerous_policies
FROM pg_policies 
WHERE policyname = 'Acesso_Geral_Autenticado';

-- Esperado: 0
```

```sql
-- Comando 3: Novas policies seguras foram criadas?
SELECT policyname, qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Esperado: Deve ver:
-- - profiles_insert_policy
-- - profiles_select_policy
-- - profiles_update_policy
```

---

## 🟠 PASSO 2: Executar Migration 097 (3 minutos)

### O que faz:
```
1. Refatora policies de INVOICES com company_id filtering
2. Refatora policies de COST_CENTERS com company_id filtering
3. Refatora policies de INVENTORY com company_id filtering
4. Adiciona validações de role (operacional/admin)
```

### Como executar:

**1. Copie TODO o conteúdo de:**
```
supabase/migrations/097_fix_critical_rls_company_filtering.sql
```

**2. Cole no SQL Editor**

**3. Clique "Run"**

**4. Você verá:**
```
✅ Query executed successfully
```

### Verificação após execução:

```sql
-- Comando 1: Novas policies de company filtering existem?
SELECT COUNT(*) as new_policies
FROM pg_policies 
WHERE tablename IN ('invoices', 'cost_centers', 'inventory')
AND policyname LIKE '%company%';

-- Esperado: 12 (4 por tabela: select, insert, update, delete)
```

```sql
-- Comando 2: Quantidade de policies por tabela
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('invoices', 'cost_centers', 'inventory')
GROUP BY tablename
ORDER BY tablename;

-- Esperado:
-- cost_centers | 4
-- invoices | 4
-- inventory | 4
```

---

## 🟢 PASSO 3: Testar Localmente (5 minutos)

### 3.1 Reinicie o servidor:
```bash
# Terminal na raiz do projeto
npm run dev
```

### 3.2 Acesse a aplicação:
```
http://localhost:3000
```

### 3.3 Teste estas funcionalidades:

**✅ Login**
- [ ] Acesse login
- [ ] Insira credenciais
- [ ] Verifique se consegue fazer login

**✅ Dashboard**
- [ ] Página inicial carrega
- [ ] Sem erros 403 (Forbidden)
- [ ] Sem erros 500 (Server Error)

**✅ Invoices Page**
- [ ] `/operations/invoices` carrega
- [ ] Tabela exibe dados
- [ ] Filtros funcionam
- [ ] Sem erro de RLS

**✅ Console do Navegador**
- [ ] Abra DevTools (F12)
- [ ] Vá para "Console"
- [ ] Procure por erros vermelhos
- [ ] Deve estar limpo

### 3.4 Se encontrar erros:

**Erro: "Error: 403 Forbidden"**
```
Causa: RLS políticas bloqueando acesso
Solução: Verifique que as policies têm auth.uid() = id
```

**Erro: "Error: relation does not exist"**
```
Causa: Erro na sintaxe SQL
Solução: Revise a migração, procure por typos
```

**Erro: "TypeError: Cannot read property X"**
```
Causa: Dados esperados não estão chegando
Solução: Verifique que RLS policies selecionam os dados corretamente
```

---

## 🔵 PASSO 4: Fazer Commit (2 minutos)

```bash
git add .
git commit -m "🔐 security: execute critical RLS migrations (096-097)

- Remove hardcoded dev user and dangerous policies (096)
- Add company-level data isolation (097)

BREAKING: These migrations close critical data breach vulnerabilities"

git push origin main
```

---

## 📊 TIMELINE TOTAL

```
Passo 1 (096):      2 min   ⏱️
Passo 2 (097):      3 min   ⏱️
Passo 3 (teste):    5 min   ⏱️
Passo 4 (commit):   2 min   ⏱️
─────────────────────────────
TOTAL:             12 min  ✅
```

---

## ⚠️ IMPORTANTE: Antes de fazer ROLLBACK

Se precisar reverter:

```sql
-- Apenas se absolutamente necessário:

-- 1. Recriar políticas antigas (não recomendado)
-- 2. Restaurar usuário Erik (não recomendado)
-- 3. Desabilitar RLS (NUNCA recomendado!)

-- Melhor: Entre em contato com equipe de segurança
```

---

## 🎯 CHECKLIST FINAL

- [ ] Migration 096 executada ✅
- [ ] Migration 097 executada ✅
- [ ] Verificações SQL rodadas (todos retornaram resultado esperado)
- [ ] App testada localmente
- [ ] Login funcionando
- [ ] Invoices page carregando
- [ ] Sem erros 403 ou 500
- [ ] Commit feito
- [ ] Pronto para deploy

---

## ✅ DEPOIS DE EXECUTAR

Seu projeto está agora:
- ✅ Seguro (company isolation enforced)
- ✅ Testado (verificações rodadas)
- ✅ Documentado (migrações versionadas)
- ✅ Pronto para produção

Próximas ações:
1. Deploy migrations 096 + 097 para staging
2. Teste em staging
3. Deploy para produção
4. Remova migrations 037, 038, 039 da documentação (nunca rodar em produção)

---

## 📞 SUPORTE

Se encontrar problemas:
1. Verifique `RLS_COMPLIANCE_REPORT.md` (detalhes técnicos)
2. Verifique `SECURITY_AUDIT_SUMMARY.md` (contexto)
3. Entre em contato com equipe de segurança

---

**Status Final**: ✅ **PRONTO PARA PRODUÇÃO**
