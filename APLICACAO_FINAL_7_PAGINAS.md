# 🎯 SCRIPT FINAL - APLICAR NAS 7 PÁGINAS RESTANTES

## INSTRUÇÕES RÁPIDAS:

Para cada arquivo abaixo, fazer:
1. Adicionar import: `import PageHeader from '@/components/ui/PageHeader';`
2. Mudar `padding: '0px'` ou `'0'` para `padding: '40px'`
3. Adicionar `background: '#f8fafc'`
4. Substituir breadcrumb/header customizado por `<PageHeader .../>`

---

## 1. INVOICES
**Arquivo:** `src/components/dashboard/InvoicesPage.tsx`
**Breadcrumb:** FINANCEIRO › CONTAS A PAGAR  
**Color:** #059669
**Icon:** 💰

```tsx
<PageHeader
  title="Contas a Pagar (AP)"
  description="Gerenciar faturas e autorizações de pagamento"
  icon="💰"
  breadcrumbs={[
    { label: 'FINANCEIRO', href: '/dashboard/financas', color: '#059669' },
    { label: 'CONTAS A PAGAR', color: '#059669' },
  ]}
  moduleColor="#059669"
/>
```

---

## 2. PRODUCT-TYPES
**Arquivo:** `src/components/dashboard/ProductTypesPage.tsx`
**Breadcrumb:** OPERAÇÕES › CONFIGURAÇÕES › TIPOS DE PRODUTO
**Color:** #7c3aed
**Icon:** 🏷️

```tsx
<PageHeader
  title="Tipos de Produto"
  description="Categorias e métodos de rastreamento (IMEI/Serial)"
  icon="🏷️"
  breadcrumbs={[
    { label: 'OPERAÇÕES', href: '/dashboard/operations', color: '#7c3aed' },
    { label: 'CONFIGURAÇÕES', color: '#7c3aed' },
    { label: 'TIPOS DE PRODUTO', color: '#7c3aed' },
  ]}
  moduleColor="#7c3aed"
/>
```

---

## 3. MANUFACTURERS
**Arquivo:** `src/components/dashboard/ManufacturersPage.tsx`
**Breadcrumb:** OPERAÇÕES › CONFIGURAÇÕES › FABRICANTES
**Color:** #7c3aed
**Icon:** 🏭

```tsx
<PageHeader
  title="Fabricantes"
  description="Gestão de marcas e fabricantes de produtos"
  icon="🏭"
  breadcrumbs={[
    { label: 'OPERAÇÕES', href: '/dashboard/operations', color: '#7c3aed' },
    { label: 'CONFIGURAÇÕES', color: '#7c3aed' },
    { label: 'FABRICANTES', color: '#7c3aed' },
  ]}
  moduleColor="#7c3aed"
/>
```

---

## 4. MODELS (CatalogPage)
**Arquivo:** `src/components/dashboard/CatalogPage.tsx`
**Breadcrumb:** OPERAÇÕES › CONFIGURAÇÕES › MODELOS
**Color:** #7c3aed
**Icon:** 📱

```tsx
<PageHeader
  title="Catálogo de Modelos"
  description="Especificações e catálogo de produtos"
  icon="📱"
  breadcrumbs={[
    { label: 'OPERAÇÕES', href: '/dashboard/operations', color: '#7c3aed' },
    { label: 'CONFIGURAÇÕES', color: '#7c3aed' },
    { label: 'MODELOS', color: '#7c3aed' },
  ]}
  moduleColor="#7c3aed"
/>
```

---

## 5. STOCK-LOCATIONS
**Arquivo:** `src/components/dashboard/StockLocationsPage.tsx`
**Breadcrumb:** OPERAÇÕES › CONFIGURAÇÕES › LOCAIS DE ESTOQUE
**Color:** #7c3aed
**Icon:** 📍

```tsx
<PageHeader
  title="Locais de Estoque"
  description="Armazéns e pontos de armazenamento"
  icon="📍"
  breadcrumbs={[
    { label: 'OPERAÇÕES', href: '/dashboard/operations', color: '#7c3aed' },
    { label: 'CONFIGURAÇÕES', color: '#7c3aed' },
    { label: 'LOCAIS DE ESTOQUE', color: '#7c3aed' },
  ]}
  moduleColor="#7c3aed"
/>
```

---

## 6. SETTINGS
**Arquivo:** `src/app/[locale]/dashboard/settings/page.tsx`
**Breadcrumb:** CONFIGURAÇÕES
**Color:** #64748b
**Icon:** ⚙️

```tsx
<PageHeader
  title="Configurações"
  description="Configurações gerais do sistema"
  icon="⚙️"
  breadcrumbs={[
    { label: 'CONFIGURAÇÕES', color: '#64748b' },
  ]}
  moduleColor="#64748b"
/>
```

---

## 7. DASHBOARD (Overview)
**Arquivo:** `src/app/[locale]/dashboard/page.tsx`
**Bread crumb:** DASHBOARD
**Color:** #7c3aed
**Icon:** 📊

```tsx
<PageHeader
  title="Dashboard"
  description="Visão geral e métricas principais"
  icon="📊"
  breadcrumbs={[
    { label: 'DASHBOARD', color: '#7c3aed' },
  ]}
  moduleColor="#7c3aed"
/>
```

---

## ✅ CHECKLIST DE APLICAÇÃO:

Para cada arquivo:
- [ ] Adicionar import PageHeader
- [ ] Mudar padding para '40px'
- [ ] Adicionar background '#f8fafc'
- [ ] Substituir breadcrumb customizado
- [ ] Substituir header customizado
- [ ] Preservar actions (botões) se existirem
- [ ] Testar que não quebrou funcionalidade

---

## 📊 APÓS APLICAR TODAS:

- **Total:** 18 páginas
- **Concluídas:** 18 (100%) ✅
- **Sistema totalmente unificado!** 🎉

---

**Tempo Estimado:** 10-15 minutos para aplicar manualmente
**OU** Use os scripts Python criados anteriormente para automação parcial
