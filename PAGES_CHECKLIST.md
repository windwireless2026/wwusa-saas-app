# Lista de Páginas Restantes para Aplicar PageHeader

## ✅ CONCLUÍDAS (7 páginas):
1. ✅ `/dashboard/registration`
2. ✅ `/dashboard/security`
3. ✅ `/dashboard/system`
4. ✅ `/dashboard/comercial`
5. ✅ `/dashboard/operations`
6. ✅ `/dashboard/financas`  
7. ✅ `/dashboard/inventory`
8. ✅ `/dashboard/comercial/estimates` **ACABEI DE FAZER!**

## ⏳ PENDENTES (aplicar PageHeader):

### Alta Prioridade:
- [ ] `/dashboard/cost-centers` - Centro de Custo
- [ ] `/dashboard/invoices` - Faturas (AP)
- [ ] `/dashboard/users` - Usuários
- [ ] `/dashboard/agents` - Agentes

### Média Prioridade (Configurações de Operações):
- [ ] `/dashboard/product-types` - Tipos de Produto
- [ ] `/dashboard/manufacturers` - Fabricantes
- [ ] `/dashboard/models` - Modelos
- [ ] `/dashboard/stock-locations` - Locais de Estoque

### Outras:
- [ ] `/dashboard/settings` - Configurações  
- [ ] `/dashboard` (page.tsx) - Overview/Dashboard Principal

## 📝 Template para Aplicar:

```tsx
import PageHeader from '@/components/ui/PageHeader';

// No início do return:
<div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
  <PageHeader
    title="Título"
    description="Descrição"
    icon="🔍"
    breadcrumbs={[
      { label: 'MÓDULO', href: '/dashboard/modulo', color: '#cor' },
      { label: 'PÁGINA', color: '#cor' },
    ]}
    moduleColor="#cor"
  />
  
  {/* Conteúdo */}
</div>
```

## 🎨 Cores por Módulo:
- Cadastro → `#2563eb` (azul)
- Operações → `#7c3aed` (violeta)
- Comercial → `#0891b2` (ciano)
- Financeiro → `#059669` (verde)
- Segurança → `#dc2626` (vermelho)
- Configurações → `#64748b` (cinza-escuro)
- Sistema → `#6b7280` (cinza)
