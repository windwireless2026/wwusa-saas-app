# 🗄️ DATABASE MIGRATION ANALYSIS & CONSOLIDATION PLAN

## 📊 Current State: 44 Migrations

### 🔴 PROBLEMAS IDENTIFICADOS

#### 1. **Migrações Redundantes e Conflitantes**

**Profiles RLS - 10 tentativas de correção:**

- `032_refine_profiles_rls.sql` - Refinar RLS
- `033_fix_profiles_recursion.sql` - Fix recursion
- `034_restore_users_visibility.sql` - Restaurar visibilidade
- `035_final_profiles_fix.sql` - "Fix final" (não foi final)
- `036_nuke_and_restore_profiles_rls.sql` - Reset total
- `037_force_erik_admin.sql` - Forçar admin específico
- **`038_debug_disable_rls_profiles.sql` - DESABILITA RLS COMPLETAMENTE ⚠️**
- `039_definitive_erik_fix.sql` - Mais um "definitivo"
- `042_sync_erik_profile.sql` - Sync específico

**Análise**: Há um padrão claro de tentativa e erro. O RLS foi **DESABILITADO** na migration 038, o que é uma **vulnerabilidade de segurança crítica** em produção.

**RLS Geral - Múltiplas tentativas:**

- `003_fix_rls_dev.sql` - Acesso total para dev
- `006_agents_and_rls_fix.sql` - Fix RLS agents
- `018_fix_rls_anon.sql` - Acesso total anônimo
- `026_fix_stock_locations_rls.sql` - Fix stock locations

#### 2. **Numbering Duplicado**

- `028_add_deleted_at_to_inventory.sql`
- `028_create_company_settings.sql`

Dois arquivos com mesmo número!

#### 3. **Data Cleanup Files (Temporários)**

- `000_cleanup.sql` - Limpeza inicial
- `011_purge_trash.sql` - Purge
- `020_activate_all_records.sql` - Ativar todos
- `021_cleanup_test_data.sql` - Limpar testes
- `022_cleanup_manufacturers.sql` - Limpar fabricantes

Estes são **scripts de manutenção**, não deveriam estar em migrations de produção.

#### 4. **Migrations Progressivas Válidas**

Estas devem ser mantidas pois representam evolução do schema:

- `001_initial_schema.sql` ✅
- `002_product_catalog.sql` ✅
- `004_add_suppliers_and_invoice.sql` ✅
- `005_add_serial_number.sql` ✅
- `007_agents_banking.sql` ✅
- `008_agents_soft_delete.sql` ✅
- `016_create_manufacturers.sql` ✅
- `017_create_product_types.sql` ✅
- `025_stock_locations_and_imei_logic.sql` ✅
- `027_add_address_to_stock_locations.sql` ✅
- `030_add_created_by_to_inventory.sql` ✅
- `031_enhance_profiles_table.sql` ✅
- `040_add_job_title.sql` ✅
- `041_auto_created_by.sql` ✅

---

## 🎯 CONSOLIDATION PLAN

### Estratégia: Criar Migrations Consolidadas para Production

#### **Option A: Consolidação Total (Recomendada para Fresh Start)**

Criar um único arquivo `001_production_schema.sql` com:

- Schema completo final
- RLS policies definitivas
- Triggers e functions
- Indexes otimizados

**Vantagens**:

- Limpo e profissional
- Fácil de revisar
- Performance otimizada
- Sem histórico de debugging

**Desvantagens**:

- Perde histórico de evolução
- Requer re-apply em development

#### **Option B: Consolidação Modular (Recomendada para Preservar Histórico)**

Organizar em módulos lógicos:

```
migrations_production/
├── 001_core_schema.sql          # Profiles, auth, core tables
├── 002_inventory_module.sql     # Inventory, stock_locations
├── 003_catalog_module.sql       # Products, manufacturers, types
├── 004_agents_module.sql        # Agents, banking, suppliers
├── 005_company_settings.sql     # Company config
├── 006_rls_policies.sql         # RLS FINAL consolidado
└── 007_indexes_optimization.sql # Performance indexes
```

---

## 🚨 CRITICAL ISSUES TO FIX

### 1. **RLS Desabilitado (SECURITY RISK)**

```sql
-- Migration 038 - CRÍTICO!
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

**Ação Requerida**: Re-enable com policies corretas.

### 2. **Acesso Total Anônimo (SECURITY RISK)**

```sql
-- Migration 018 e 003
create policy "total_access" for all using (true);
```

**Ação Requerida**: Substituir por policies baseadas em roles.

### 3. **Perfis Hardcoded**

Várias migrations têm INSERT com UUID específico de Erik:

```sql
'8dbaf29f-5caf-4344-ba37-f5dacac0d190'
```

**Ação Requerida**: Remover hardcoding, usar dynamic admin creation.

---

## 📋 RECOMMENDED Actions

### Immediate (Sem quebrar desenvolvimento atual):

1. ✅ Documentar estado atual
2. ✅ Identificar migrations obsoletas
3. ⏳ Criar folder `migrations_deprecated/`
4. ⏳ Mover cleanup scripts para `scripts/maintenance/`

### Short-term (Próxima sprint):

1. ⏳ Criar `043_reapply_rls_security.sql` para re-enable RLS
2. ⏳ Criar `044_consolidate_profiles_policies.sql` com policies finais
3. ⏳ Testar com diferentes user roles

### Long-term (Para production deploy):

1. ⏳ Criar migrations consolidadas (Option B)
2. ⏳ Adicionar indexes de performance
3. ⏳ Criar script de rollback para cada migration
4. ⏳ Documentar RLS strategy em ARCHITECTURE.md

---

## 🗑️ Migrations Candidatas para Deprecation

### Pode mover para `migrations_deprecated/`:

```
000_cleanup.sql                    # Temporary cleanup
011_purge_trash.sql               # Maintenance script
020_activate_all_records.sql      # One-time activation
021_cleanup_test_data.sql         # Test cleanup
022_cleanup_manufacturers.sql     # Data cleanup
```

### Pode consolidar (redundantes):

```
003_fix_rls_dev.sql          ─┐
006_agents_and_rls_fix.sql    ├─► 006_rls_policies.sql (consolidated)
018_fix_rls_anon.sql          │
026_fix_stock_locations_rls   ┘

032_refine_profiles_rls       ─┐
033_fix_profiles_recursion     │
034_restore_users_visibility   │
035_final_profiles_fix         ├─► Consolidar em 044_profiles_rls_final.sql
036_nuke_and_restore          │
037_force_erik_admin          │
038_debug_disable_rls         │
039_definitive_erik_fix       │
042_sync_erik_profile         ┘
```

---

## ✅ FINAL STATE (After Consolidation)

### Production Migrations (Clean):

```
001_core_schema.sql              # Profiles, auth, core tables
002_inventory_module.sql         # Inventory management
003_catalog_module.sql           # Product catalog
004_agents_module.sql            # Business partners
005_company_settings.sql         # Multi-tenant config
006_rls_policies.sql             # Security policies (consolidated)
007_indexes_optimization.sql     # Performance
```

Total: **7 migrations** ao invés de 44 ✨

---

## 🔐 RLS STRATEGY (Para Consolidação)

### Profiles Table:

```sql
-- READ: Todos authenticated
CREATE POLICY "profiles_select_authenticated"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- INSERT: Apenas system (via trigger) ou super_admin
CREATE POLICY "profiles_insert_admin"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'super_admin')
);

-- UPDATE: Own profile OU super_admin
CREATE POLICY "profiles_update"
ON profiles FOR UPDATE
TO authenticated
USING (
    auth.uid() = id OR
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'super_admin')
);

-- DELETE: Apenas super_admin
CREATE POLICY "profiles_delete_admin"
ON profiles FOR DELETE
TO authenticated
USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'super_admin')
);
```

---

**Next Steps**: Quer que eu implemente a consolidação agora?
