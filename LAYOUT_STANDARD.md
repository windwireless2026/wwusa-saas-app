# Layout Padrão para Todas as Páginas

## Container Principal
```tsx
<div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
  <PageHeader ... />
  
  {/* Conteúdo da página */}
</div>
```

## Páginas que PRECISAM ter padding: '40px':
- /dashboard (overview)
- /dashboard/product-types
- /dashboard/manufacturers  
- /dashboard/models
- /dashboard/stock-locations
- /dashboard/comercial/estimates
- /dashboard/users
- /dashboard/cost-centers
- /dashboard/settings
- /dashboard/operations
- /dashboard/financas
- E TODAS as outras!

## Padrão INCORRETO (SEM padding):
```tsx
<div style={{ padding: '0' }}> ❌ ERRADO
```

## Padrão CORRETO (COM padding):
```tsx
<div style={{ padding: '40px' }}> ✅ CERTO
```
