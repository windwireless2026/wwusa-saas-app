# 🚀 CÓDIGO COMPLETO PARA APLICAR NAS 10 PÁGINAS RESTANTES

## IMPORTANTE: Aplicar linha 154 em cada arquivo

### 1. USERS - `/dashboard/users/page.tsx`

**Linha 1-8:** Adicionar import
```tsx
import PageHeader from '@/components/ui/PageHeader';
```

**Linha 154-212:** Substituir por:
```tsx
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
      <PageHeader
        title="Gestão de Usuários"
        description="Administre os membros da sua equipe e permissões"
        icon="👥"
        breadcrumbs={[
          { label: 'SEGURANÇA', href: '/dashboard/security', color: '#dc2626' },
          { label: 'USUÁRIOS', color: '#dc2626' },
        ]}
        moduleColor="#dc2626"
        actions={
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              style={{
                background: showDeleted ? '#64748b' : 'white',
                color: showDeleted ? 'white' : '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 24px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              {showDeleted ? 'Ver Ativos' : 'Ver Inativos'}
            </button>
            <button
              onClick={() => {
                setSelectedUser(null);
                setIsModalOpen(true);
              }}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 28px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(220, 38, 38, 0.3)',
              }}
            >
              + Convidar Usuário
            </button>
          </div>
        }
      />
```

---

### 2-10: DEMAIS PÁGINAS - TEMPLATE RÁPIDO

Devido ao contexto limitado, criei este guia COMPLETO. Para cada página:

1. Adicionar import: `import PageHeader from '@/components/ui/PageHeader';`
2. Mudar padding para '40px' e background para '#f8fafc'
3. Substituir breadcrumb/header customizado por PageHeader

**Configurações por página:**

```typescript
const PAGES = {
  'agents': {
    title: 'Agentes',
    description: 'Gestão de fornecedores, clientes e parceiros',
    icon: '🤝',
    breadcrumbs: [
      { label: 'CADASTRO', href: '/dashboard/registration', color: '#2563eb' },
      { label: 'AGENTES', color: '#2563eb' },
    ],
    color: '#2563eb'
  },
  'cost-centers': {
    title: 'Centros de Custo',
    description: 'Gestão de centros de custo financeiros',
    icon: '💼',
    breadcrumbs: [
      { label: 'FINANCEIRO', href: '/dashboard/financas', color: '#059669' },
      { label: 'CONFIGURAÇÕES', color: '#059669' },
      { label: 'CENTROS DE CUSTO', color: '#059669' },
    ],
    color: '#059669'
  },
  'invoices': {
    title: 'Faturas (AP)',
    description: 'Contas a pagar e autorização de pagamento',
    icon: '💰',
    breadcrumbs: [
      { label: 'FINANCEIRO', href: '/dashboard/financas', color: '#059669' },
      { label: 'CONTAS A PAGAR', color: '#059669' },
    ],
    color: '#059669'
  },
  'product-types': {
    title: 'Tipos de Produto',
    description: 'Categorias e métodos de rastreamento',
    icon: '🏷️',
    breadcrumbs: [
      { label: 'OPERAÇÕES', href: '/dashboard/operations', color: '#7c3aed' },
      { label: 'CONFIGURAÇÕES', color: '#7c3aed' },
      { label: 'TIPOS DE PRODUTO', color: '#7c3aed' },
    ],
    color: '#7c3aed'
  },
  'manufacturers': {
    title: 'Fabricantes',
    description: 'Gestão de marcas e fabricantes',
    icon: '🏭',
    breadcrumbs: [
      { label: 'OPERAÇÕES', href: '/dashboard/operations', color: '#7c3aed' },
      { label: 'CONFIGURAÇÕES', color: '#7c3aed' },
      { label: 'FABRICANTES', color: '#7c3aed' },
    ],
    color: '#7c3aed'
  },
  'models': {
    title: 'Modelos',
    description: 'Catálogo de produtos e especificações',
    icon: '📱',
    breadcrumbs: [
      { label: 'OPERAÇÕES', href: '/dashboard/operations', color: '#7c3aed' },
      { label: 'CONFIGURAÇÕES', color: '#7c3aed' },
      { label: 'MODELOS', color: '#7c3aed' },
    ],
    color: '#7c3aed'
  },
  'stock-locations': {
    title: 'Locais de Estoque',
    description: 'Armazéns e pontos de estoque',
    icon: '📍',
    breadcrumbs: [
      { label: 'OPERAÇÕES', href: '/dashboard/operations', color: '#7c3aed' },
      { label: 'CONFIGURAÇÕES', color: '#7c3aed' },
      { label: 'LOCAIS DE ESTOQUE', color: '#7c3aed' },
    ],
    color: '#7c3aed'
  },
  'settings': {
    title: 'Configurações',
    description: 'Configurações gerais do sistema',
    icon: '⚙️',
    breadcrumbs: [
      { label: 'CONFIGURAÇÕES', color: '#64748b' },
    ],
    color: '#64748b'
  },
  'dashboard': {
    title: 'Visão Geral',
    description: 'Dashboard principal com métricas-chave',
    icon: '📊',
    breadcrumbs: [
      { label: 'DASHBOARD', color: '#7c3aed' },
    ],
    color: '#7c3aed'
  },
};
```

---

## ✅ RESUMO - O QUE ESTÁ PRONTO:

### Páginas Concluídas (8):
1. ✅ registration
2. ✅ security  
3. ✅ system
4. ✅ comercial
5. ✅ operations
6. ✅ financas
7. ✅ inventory
8. ✅ comercial/estimates

### Componentes Criados:
- ✅ Breadcrumb.tsx
- ✅ PageHeader.tsx

### Documentação:
- ✅ 7 arquivos MD completos

---

## 🎯 AÇÃO RÁPIDA:

Para cada uma das 10 páginas restantes, faça:

1. Abrir o arquivo
2. Adicionar: `import PageHeader from '@/components/ui/PageHeader';`
3. Encontrar o `<div style={{ padding:...` principal
4. Mudar para: `padding: '40px', background: '#f8fafc'`
5. Substituir breadcrumb/header por `<PageHeader ... />`
6. Usar a config acima para cada página

Total estimado: **15-20 minutos** para fazer todas manualmente.

---

**Prefere que eu continue fazendo uma por uma ou você faz com base neste guia?**
