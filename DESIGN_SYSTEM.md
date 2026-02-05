# Sistema de Design Unificado - Cores por Módulo

## Paleta de Cores por Módulo

```typescript
export const MODULE_COLORS = {
  cadastro: {
    primary: '#2563eb', // blue-600
    light: '#dbeafe',   // blue-100
    bg: '#eff6ff',      // blue-50
  },
  operations: {
    primary: '#7c3aed', // violet-600
    light: '#f5f3ff',   // violet-50
    bg: '#faf5ff',      // violet-25
  },
  comercial: {
    primary: '#0891b2', // cyan-600
    light: '#cffafe',   // cyan-100
    bg: '#ecfeff',      // cyan-50
  },
  financeiro: {
    primary: '#059669', // emerald-600
    light: '#d1fae5',   // emerald-100
    bg: '#f0fdf4',      // emerald-50
  },
  security: {
    primary: '#dc2626', // red-600
    light: '#fee2e2',   // red-100
    bg: '#fef2f2',      // red-50
  },
  settings: {
    primary: '#64748b', // slate-500
    light: '#e2e8f0',   // slate-200
    bg: '#f8fafc',      // slate-50
  },
  system: {
    primary: '#6b7280', // gray-500
    light: '#e5e7eb',   // gray-200
    bg: '#f9fafb',      // gray-50
  },
};
```

## Estrutura Padrão de Página

### Hub Pages (Páginas Centrais de Módulo)
- Breadcrumb: `[MÓDULO]`
- Icon + Title
- Description
- Cards de navegação para sub-páginas

### Sub Pages (Páginas Funcionais)
- Breadcrumb: `[MÓDULO] › [PÁGINA]` (clicável)
- Title
- Description
- Actions (botões)
- Content

## Aplicação

Todas as páginas devem usar:
- PageHeader component
- Breadcrumb component  
- Cores consistentes do módulo
- Mesmo padding/spacing (40px)
- Mesma tipografia
