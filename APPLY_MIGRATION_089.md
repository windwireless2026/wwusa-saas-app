# 🔐 APLICAR MIGRATION 089 - PERFIS DE ACESSO

## 📋 O QUE ESTA MIGRATION FAZ

✅ Cria sistema completo de **Perfis de Acesso** com permissões granulares  
✅ Tabelas: `access_profiles` e `access_profile_permissions`  
✅ Adiciona campo `access_profile_id` na tabela `profiles`  
✅ Cria perfis padrão automaticamente: Sócio, Operacional e Cliente  
✅ RLS policies seguros  
✅ NÃO deleta dados existentes  
✅ Compatível com DEV e PROD  

---

## 🚀 PASSO A PASSO

### 1. Acessar Supabase SQL Editor
1. Abra: https://supabase.com/dashboard
2. Selecione seu projeto WindWireless
3. No menu lateral: **SQL Editor**
4. Clique **"New Query"**

---

### 2. Aplicar Migration 089

1. Copie o conteúdo do arquivo:
   ```
   supabase/migrations/089_create_access_profiles.sql
   ```

2. Cole no SQL Editor

3. Clique **"Run"** (ou F5)

4. ✅ Aguarde a execução (pode levar 10-20 segundos)

5. ✅ Deve aparecer: "NOTICE: Migration 089 completed: Access Profiles system created successfully"

---

## 🎯 O QUE FOI CRIADO

### Tabelas:
- ✅ `access_profiles` - Armazena os perfis de acesso
- ✅ `access_profile_permissions` - Permissões por módulo (dashboard, cadastro, financeiro, etc)

### Perfis Padrão (criados automaticamente):
1. **Sócio (acesso total)** - Write em todos os módulos
2. **Operacional (gestão)** - Write na maioria, Read em sócios e security
3. **Cliente (visualização)** - Read limitado, sem acesso a módulos sensíveis

### Módulos Suportados:
- Dashboard
- Cadastro
- Operações (estoque, inventário)
- Comercial (orçamentos)
- Financeiro (faturas)
- Sócios (parceiros)
- Segurança (logs, usuários)
- Configurações

---

## ✅ VERIFICAÇÃO

Rode este comando para verificar se foi criado corretamente:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('access_profiles', 'access_profile_permissions')
ORDER BY table_name;

-- Ver perfis criados
SELECT company_id, name, description, is_system_profile 
FROM access_profiles 
ORDER BY name;

-- Ver permissões
SELECT 
  ap.name as profile_name,
  app.module_key,
  app.permission_level
FROM access_profiles ap
JOIN access_profile_permissions app ON ap.id = app.profile_id
ORDER BY ap.name, app.module_key;
```

**Resultado esperado:**
- 2 tabelas encontradas ✅
- 3 perfis por empresa (Sócio, Operacional, Cliente) ✅
- 9 módulos × 3 perfis = 27 permissões por empresa ✅

---

## 🌐 ACESSAR A INTERFACE

Após aplicar a migration:

1. Acesse: http://localhost:9000/pt/dashboard/security
2. Clique em **"Perfis de Acesso"** 🔐
3. Você verá os 3 perfis padrão criados
4. Pode criar novos perfis personalizados
5. Pode editar permissões (exceto perfis do sistema)

---

## 🔄 PRÓXIMOS PASSOS

1. Vincular usuários aos perfis (em breve)
2. Implementar verificação de permissões nas telas
3. Bloquear acesso baseado no perfil do usuário

---

## ❓ TROUBLESHOOTING

### Erro: "relation access_profiles already exists"
- ✅ Migration já foi aplicada anteriormente
- Pode ignorar, sistema já está funcionando

### Erro: "permission denied"
- ❌ Usuário do Supabase sem privilégios
- Usar usuário admin ou service_role key

### Perfis não aparecem na interface
- Verificar se migration foi executada com sucesso
- Ver console do navegador para erros
- Verificar RLS policies

---

## 📝 NOTAS

- Perfis do sistema (`is_system_profile = true`) não podem ser deletados
- Cada empresa tem seus próprios perfis (isolamento por `company_id`)
- Permissões: `none` (sem acesso), `read` (visualizar), `write` (editar)
- RLS garante que usuários só veem perfis da própria empresa

---

**Data da Migration:** 02/02/2026  
**Autor:** Sistema de Perfis de Acesso  
**Status:** ✅ Pronto para produção
