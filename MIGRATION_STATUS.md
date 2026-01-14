# 🚀 MIGRAÇÃO EM LOTE - COMPONENTES RESTANTES

## ✅ COMPONENTES JÁ MIGRADOS:
- users/page.tsx
- Sidebar.tsx
- inventory/page.tsx
- StockLocationsPage.tsx
- AddItemModal.tsx
- agents/page.tsx

## 🔜 FALTAM MIGRAR (componentes 'use client'):

### ALTA PRIORIDADE (usados frequentemente):
1. src/components/dashboard/CatalogPage.tsx
2. src/components/dashboard/ManufacturersPage.tsx
3. src/components/dashboard/ProductTypesPage.tsx
4. src/components/dashboard/AddUserModal.tsx
5. src/components/dashboard/SettingsPage.tsx

### MÉDIA PRIORIDADE (modais):
6. src/components/dashboard/AddProductModal.tsx
7. src/components/dashboard/AddManufacturerModal.tsx
8. src/components/dashboard/AddProductTypeModal.tsx

### BAIXA PRIORIDADE (páginas específicas):
9. src/app/[locale]/dashboard/agents/[id]/page.tsx
10. src/components/dashboard/AgentForm.tsx

## 📋 PADRÃO DE MIGRAÇÃO:

```tsx
// 1. Substituir import
- import { supabase } from '@/lib/supabase';
+ import { useSupabase } from '@/hooks/useSupabase';

// 2. Adicionar no componente
export default function ComponentName() {
+  const supabase = useSupabase(); // Hook com instância única
   // resto do código...
}
```

## ⚠️ NÃO MIGRAR (arquivos server-side):
- src/lib/inventoryImport.ts
- src/hooks/useQueries.ts
- src/hooks/useAuth.ts

Esses arquivos rodam no servidor e usam `supabase` corretamente.

---

**PRÓXIMO PASSO**: Migrar os 5 componentes de ALTA PRIORIDADE.
