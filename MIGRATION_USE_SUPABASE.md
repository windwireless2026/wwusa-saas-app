# 🔧 SCRIPT DE MIGRAÇÃO AUTOMÁTICA

## Arquivos que ainda precisam migrar para use Supabase():

Encontrados via grep:
- src/lib/inventoryImport.ts
- src/hooks/useQueries.ts  
- src/hooks/useAuth.ts
- src/components/dashboard/SettingsPage.tsx
- src/components/dashboard/ProductTypesPage.tsx
- src/app/[locale]/dashboard/agents/page.tsx
- src/app/[locale]/dashboard/agents/[id]/page.tsx
- src/components/dashboard/ManufacturersPage.tsx
- src/components/dashboard/CatalogPage.tsx
- src/components/dashboard/AgentForm.tsx
- src/components/dashboard/AddUserModal.tsx
- src/components/dashboard/AddProductTypeModal.tsx
- src/components/dashboard/AddProductModal.tsx
- src/components/dashboard/AddManufacturerModal.tsx
- src/components/dashboard/AddItemModal.tsx

## PADRÃO DE CORREÇÃO:

### 1. Substituir import:
```ts
// ANTES:
import { supabase } from '@/lib/supabase';

// DEPOIS:
import { useSupabase } from '@/hooks/useSupabase';
```

### 2. Adicionar no componente ('use client'):
```ts
export default function ComponentName() {
  const supabase = useSupabase(); // Hook com instância única
  // resto...
}
```

### 3. Para arquivos NÃO-REACT (utils, libs):
- **NÃO MIGRAR** - esses arquivos são server-side
- Exemplos: `inventoryImport.ts`, `useQueries.ts` (tem supabase server), `useAuth.ts`

## PRIORIDADE:

✅ FEITO:
- users/page.tsx  
- Sidebar.tsx
- inventory/page.tsx
- StockLocationsPage.tsx

🔜 PRÓXIMOS (componentes 'use client'):
1. Add Usermodal.tsx
2. AddItemModal.tsx
3. CatalogPage.tsx
4. ManufacturersPage.tsx
5. ProductTypesPage.tsx
6. AgentsPage.tsx
7. AgentForm.tsx
8. SettingsPage.tsx

## ESTRATÉGIA:

Migrar apenas componentes React ('use client'). Files utils/libs permanecem como estão.
