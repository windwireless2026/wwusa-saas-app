# Nova Arquitetura de URLs - Módulos com Páginas Hub

## 🎯 Conceito
- URLs sempre em **INGLÊS**
- Estrutura limpa: `/{locale}/{module}/{page}`
- Remover `/dashboard/` das URLs
- Cada módulo principal terá sua própria página hub com cards organizados

---

## 📊 DASHBOARD
**URL Atual:** `/pt/dashboard`
**URL Nova:** `/pt/dashboard` (mantém - é a página inicial)
**Arquivo:** `src/app/[locale]/dashboard/page.tsx`

---

## 📋 REGISTRATION (Cadastro)
**URL Atual:** `/pt/dashboard/registration`
**URL Nova:** `/pt/registration`
**Arquivo:** `src/app/[locale]/registration/page.tsx`

### Cards da Página Hub:

#### 📦 Cadastro de Produtos
- **Catálogo de Produtos** → `/pt/registration/catalog`
- **Fabricantes** → `/pt/registration/manufacturers`
- **Tipos de Produto** → `/pt/registration/product-types`

---

## ⚡ OPERATIONS (Operações)
**URL Atual:** `/pt/dashboard/operations`
**URL Nova:** `/pt/operations`
**Arquivo:** `src/app/[locale]/operations/page.tsx`

### Cards da Página Hub:

#### 📊 Módulos Operacionais
- **Dashboard Operacional** → `/pt/operations/dashboard`
- **Inteligência de Estoque** → `/pt/operations/inventory`

#### ⚙️ Configurações Operacionais
- **Tipos de Produto** → `/pt/operations/product-types`
- **Fabricantes** → `/pt/operations/manufacturers`
- **Modelos** → `/pt/operations/models`
- **Locais de Estoque** → `/pt/operations/stock-locations`

---

## 💼 COMMERCIAL (Comercial)
**URL Atual:** `/pt/dashboard/comercial`
**URL Nova:** `/pt/commercial`
**Arquivo:** `src/app/[locale]/commercial/page.tsx`

### Cards da Página Hub:

#### 💰 Módulos Comerciais
- **Dashboard Comercial** → `/pt/commercial/dashboard`
- **Orçamentos** → `/pt/commercial/estimates`
- **Vendas** → `/pt/commercial/sales` (em breve)

---

## 💰 FINANCE (Financeiro)
**URL Atual:** `/pt/dashboard/financas`
**URL Nova:** `/pt/finance`
**Arquivo:** `src/app/[locale]/finance/page.tsx`

### Cards da Página Hub:

#### 📊 Módulos Financeiros
- **Contas a Pagar** → `/pt/finance/accounts-payable`
- **Lançamentos** → `/pt/finance/transactions` (em breve)
- **Relatório DRE** → `/pt/finance/income-statement` (em breve)
- **Balanço Patrimonial** → `/pt/finance/balance-sheet` (em breve)
- **Fluxo de Caixa** → `/pt/finance/cash-flow` (em breve)
- **Relatórios** → `/pt/finance/dashboard` (em breve)
- **Conciliação Bancária** → `/pt/finance/reconciliation` (em breve)

#### ⚙️ Configurações
- **Cadastros Financeiros** → `/pt/finance/registration`

---

## 🤝 PARTNERS (Sócios)
**URL Atual:** `/pt/dashboard/partners`
**URL Nova:** `/pt/partners`
**Arquivo:** `src/app/[locale]/partners/page.tsx`

### Cards da Página Hub:

#### 👥 Módulos de Sócios
- **Dashboard de Sócios** → `/pt/partners/dashboard`
- **Lista de Sócios** → `/pt/partners/list`
- **Evolução Patrimonial** → `/pt/partners/equity-evolution`
- **Distribuições** → `/pt/partners/distributions` (em breve)

---

## 🛡️ SECURITY (Segurança)
**URL Atual:** `/pt/dashboard/security`
**URL Nova:** `/pt/security`
**Arquivo:** `src/app/[locale]/security/page.tsx`

### Cards da Página Hub:

#### 🔐 Módulos de Segurança
- **Perfis de Acesso** → `/pt/security/access-profiles`
- **Usuários** → `/pt/security/users`
- **Logs de Auditoria** → `/pt/security/audit-logs`

---

## ⚙️ SETTINGS (Configurações)
**URL Atual:** `/pt/dashboard/settings`
**URL Nova:** `/pt/settings`
**Arquivo:** `src/app/[locale]/settings/page.tsx`

### Cards da Página Hub:

#### 🏢 Configurações da Empresa
- **Dados da Empresa** → `/pt/settings/company`
- **Preferências** → `/pt/settings/preferences` (em breve)

---

## 🛠️ SYSTEM (Sistema)
**URL Atual:** `/pt/dashboard/system`
**URL Nova:** `/pt/system`
**Arquivo:** `src/app/[locale]/system/page.tsx`

### Cards da Página Hub:

#### 📚 Recursos do Sistema
- **Documentação** → `/pt/system/docs`

---

## 🗂️ ESTRUTURA DE ARQUIVOS

```
src/app/[locale]/
├── dashboard/
│   └── page.tsx                      # Dashboard principal ✅
├── registration/
│   ├── page.tsx                      # Hub Cadastro 🆕
│   ├── catalog/page.tsx
│   ├── manufacturers/page.tsx
│   └── product-types/page.tsx
├── operations/
│   ├── page.tsx                      # Hub Operações 🆕
│   ├── dashboard/page.tsx
│   ├── inventory/page.tsx
│   ├── product-types/page.tsx
│   ├── manufacturers/page.tsx
│   ├── models/page.tsx
│   └── stock-locations/page.tsx
├── commercial/
│   ├── page.tsx                      # Hub Comercial 🆕
│   ├── dashboard/page.tsx
│   ├── estimates/page.tsx
│   └── sales/page.tsx
├── finance/
│   ├── page.tsx                      # Hub Financeiro 🆕
│   ├── accounts-payable/page.tsx
│   ├── transactions/page.tsx
│   ├── income-statement/page.tsx
│   ├── balance-sheet/page.tsx
│   ├── cash-flow/page.tsx
│   ├── dashboard/page.tsx
│   ├── reconciliation/page.tsx
│   └── registration/page.tsx
├── partners/
│   ├── page.tsx                      # Hub Sócios 🆕
│   ├── dashboard/page.tsx
│   ├── list/page.tsx
│   ├── equity-evolution/page.tsx
│   └── distributions/page.tsx
├── security/
│   ├── page.tsx                      # Hub Segurança 🆕
│   ├── access-profiles/page.tsx
│   ├── users/page.tsx
│   └── audit-logs/page.tsx
├── settings/
│   ├── page.tsx                      # Hub Configurações 🆕
│   ├── company/page.tsx
│   └── preferences/page.tsx
└── system/
    ├── page.tsx                      # Hub Sistema 🆕
    └── docs/page.tsx
```

---

## 🔄 MIGRAÇÕES NECESSÁRIAS

### Mover arquivos existentes:
```
src/app/[locale]/dashboard/registration/       → src/app/[locale]/registration/
src/app/[locale]/dashboard/inventory/          → src/app/[locale]/operations/inventory/
src/app/[locale]/dashboard/product-types/      → src/app/[locale]/operations/product-types/
src/app/[locale]/dashboard/manufacturers/      → src/app/[locale]/operations/manufacturers/
src/app/[locale]/dashboard/models/             → src/app/[locale]/operations/models/
src/app/[locale]/dashboard/stock-locations/    → src/app/[locale]/operations/stock-locations/
src/app/[locale]/dashboard/comercial/          → src/app/[locale]/commercial/
src/app/[locale]/dashboard/financas/           → src/app/[locale]/finance/
src/app/[locale]/dashboard/invoices/           → src/app/[locale]/finance/accounts-payable/
src/app/[locale]/dashboard/partners/           → src/app/[locale]/partners/
src/app/[locale]/dashboard/security/           → src/app/[locale]/security/
src/app/[locale]/dashboard/users/              → src/app/[locale]/security/users/
src/app/[locale]/dashboard/settings/           → src/app/[locale]/settings/
src/app/[locale]/dashboard/system/             → src/app/[locale]/system/
src/app/[locale]/dashboard/docs/               → src/app/[locale]/system/docs/
```

### Páginas Hub a criar (8 páginas):
1. 🆕 Registration Hub
2. 🆕 Operations Hub
3. 🆕 Commercial Hub
4. 🆕 Finance Hub
5. 🆕 Partners Hub
6. 🆕 Security Hub
7. 🆕 Settings Hub
8. 🆕 System Hub

### Atualizar Sidebar:
```tsx
href: '/registration'    // era /dashboard/registration
href: '/operations'      // era /dashboard/operations
href: '/commercial'      // era /dashboard/comercial
href: '/finance'         // era /dashboard/financas
href: '/partners'        // era /dashboard/partners
href: '/security'        // era /dashboard/security
href: '/settings'        // era /dashboard/settings
href: '/system'          // era /dashboard/system
```

---

## ✨ BENEFÍCIOS

1. **URLs Limpas**: Sem `/dashboard/` desnecessário
2. **Padrão Internacional**: Tudo em inglês nas URLs
3. **SEO Friendly**: URLs mais curtas e descritivas
4. **Consistência**: Mesmo padrão em todos os módulos
5. **Escalável**: Fácil adicionar novos módulos
6. **Navegação Clara**: Estrutura hierárquica óbvia

---

## 🎨 EXEMPLO DE URL

### ❌ Antes (confuso):
```
/pt/dashboard/financas/lancamentos
/pt/dashboard/operations/inventory
/pt/dashboard/comercial/estimates
```

### ✅ Depois (limpo):
```
/pt/finance/transactions
/pt/operations/inventory
/pt/commercial/estimates
```
