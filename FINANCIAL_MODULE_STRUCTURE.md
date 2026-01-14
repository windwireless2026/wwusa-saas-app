# 💰 MÓDULO FINANCEIRO - ESTRUTURA COMPLETA

## 📊 VISÃO GERAL DAS TABELAS

```
┌─────────────────────────────────────────────────────────────────┐
│                    MÓDULO FINANCEIRO                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │ financial_groups │◄────┐   │ dre_categories   │             │
│  │ (15 grupos)      │     │   │ (20+ categorias) │             │
│  └──────────────────┘     │   └──────────────────┘             │
│         ▲                 │            ▲                        │
│         │                 │            │                        │
│         │                 │            │                        │
│  ┌──────┴────────────────────────────┴──────┐                  │
│  │      financial_classes (PRINCIPAL)       │                  │
│  │  • Advogado                              │                  │
│  │  • Aluguel Escritório                    │                  │
│  │  • Combustível                           │                  │
│  │  • Comissão de Vendas                    │                  │
│  │  • ... (33+ classes)                     │                  │
│  └──────────────────────────────────────────┘                  │
│         ▲                 │            ▲                        │
│         │                 │            │                        │
│         │                 │            │                        │
│         │                 └───────────────────┐                │
│  ┌──────┴──────────┐              ┌──────────┴────────┐        │
│  │ capital_flow_   │              │ financial_         │        │
│  │ categories      │              │ transactions       │        │
│  │ (7 categorias)  │              │ (movimentações)    │        │
│  └─────────────────┘              └────────────────────┘        │
│                                            │                    │
│                                   ┌────────┴────────┐           │
│                                   │ financial_       │           │
│                                   │ budgets          │           │
│                                   │ (orçamentos)     │           │
│                                   └──────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ FINANCIAL_GROUPS (Grupos)

**Exemplo de dados:**

| ID | Name | Description | Display Order |
|----|------|-------------|---------------|
| uuid-1 | SG&A | Selling, General & Administrative | 1 |
| uuid-2 | Sócios | Despesas e operações relacionadas a sócios | 2 |
| uuid-3 | Despesas Operacionais | Despesas operacionais gerais | 3 |
| uuid-4 | Marketing & Comercial | Despesas de marketing | 7 |
| uuid-5 | Estoque | Movimentações de estoque | 5 |

**Total: 15 grupos**

```sql
-- Estrutura da Tabela
CREATE TABLE financial_groups (
    id UUID PRIMARY KEY,
    name VARCHAR(255) UNIQUE,      -- "SG&A", "Sócios", etc
    description TEXT,
    display_order INTEGER,
    active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

---

## 2️⃣ DRE_CATEGORIES (Categorias DRE Gerencial)

**Exemplo de dados:**

| ID | Name | Category Type | Is Subtotal | Display Order |
|----|------|---------------|-------------|---------------|
| uuid-10 | Receita Bruta | revenue | false | 1 |
| uuid-11 | (-) Custo da Mercadoria Vendida (CMV) | expense | false | 2 |
| uuid-12 | (-) Comissões | expense | false | 4 |
| uuid-13 | LUCRO BRUTO | calculation | **true** | 9 |
| uuid-14 | (-) Despesas Operacionais (SG&A) | expense | false | 10 |
| uuid-15 | EBIT (Lucro Operacional) | calculation | **true** | 13 |
| uuid-16 | Lucro Líquido | calculation | **true** | 16 |

**Total: 20+ categorias para estruturar o DRE**

```sql
-- Estrutura da Tabela
CREATE TABLE dre_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    parent_id UUID REFERENCES dre_categories(id),
    category_type VARCHAR(50),     -- 'revenue', 'expense', 'calculation'
    formula TEXT,                  -- Para cálculos (Lucro = Receita - Despesa)
    display_order INTEGER,
    is_subtotal BOOLEAN,           -- Para LUCRO BRUTO, EBIT, etc
    is_total BOOLEAN,              -- Para Lucro Líquido final
    active BOOLEAN
);
```

---

## 3️⃣ CAPITAL_FLOW_CATEGORIES (Batimento Capital)

**Exemplo de dados:**

| ID | Name | Flow Type | Display Order |
|----|------|-----------|---------------|
| uuid-20 | EXPENSE | outflow | 1 |
| uuid-21 | PURCHASE ORDER | outflow | 2 |
| uuid-22 | Empréstimo a terceiros | outflow | 3 |
| uuid-23 | DISTRIBUIÇÃO DE LUCRO | outflow | 4 |
| uuid-24 | Contas a Receber | inflow | 5 |
| uuid-25 | INCOME | inflow | 6 |

**Total: 7 categorias para fluxo de caixa**

```sql
-- Estrutura da Tabela
CREATE TABLE capital_flow_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    flow_type VARCHAR(50),         -- 'inflow', 'outflow', 'neutral'
    description TEXT,
    display_order INTEGER,
    active BOOLEAN
);
```

---

## 4️⃣ FINANCIAL_CLASSES (⭐ TABELA PRINCIPAL)

**Exemplo de dados completos:**

| Name | Grupo | DRE | Batimento Capital | Sub-categoria |
|------|-------|-----|-------------------|---------------|
| Advogado | SG&A | (-) Despesas Operacionais (SG&A) | EXPENSE | - |
| Aluguel Escritório | SG&A | (-) Despesas Operacionais (SG&A) | EXPENSE | Office Expenses:Rent |
| Combustível | Despesas Operacionais | (-) Despesas Operacionais (SG&A) | EXPENSE | Vehicle expenses:Vehicle gas & fuel |
| Comissão de Vendas | Comissão de Vendas | (-) Comissões | EXPENSE | Commissions & fees |
| Compra de Produtos - Novos | Estoque | Estoque | PURCHASE ORDER | - |
| Frete de compra de mercadorias | CMV | (-) Frete de compra de mercadorias | EXPENSE | Office expenses:Shipping |
| Publicidade e marketing | Marketing & Comercial | (-) Despesas Operacionais (SG&A) | EXPENSE | Advertising & marketing |
| Retirada Sócios | DISTRIBUIÇÃO DE LUCRO | DISTRIBUIÇÃO DE LUCRO | DISTRIBUIÇÃO DE LUCRO | - |
| Salário | SG&A | (-) Despesas Operacionais (SG&A) | EXPENSE | - |

**Total: 33+ classes financeiras**

```sql
-- Estrutura da Tabela
CREATE TABLE financial_classes (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    
    -- RELACIONAMENTOS (3 classificações)
    group_id UUID REFERENCES financial_groups(id),
    dre_category_id UUID REFERENCES dre_categories(id),
    capital_flow_category_id UUID REFERENCES capital_flow_categories(id),
    
    -- DETALHES
    subcategory VARCHAR(255),      -- Ex: "Office Expenses:Rent"
    description TEXT,
    
    -- CONFIGURAÇÕES
    is_tax_deductible BOOLEAN,     -- Dedutível de impostos?
    requires_approval BOOLEAN,     -- Requer aprovação?
    
    display_order INTEGER,
    active BOOLEAN,
    
    UNIQUE(name, group_id)
);
```

---

## 5️⃣ FINANCIAL_TRANSACTIONS (Movimentações)

**Exemplo de lançamento:**

```
┌────────────────────────────────────────────────────────────────┐
│ LANÇAMENTO FINANCEIRO                                          │
├────────────────────────────────────────────────────────────────┤
│ Data: 2026-01-15                                               │
│ Classe Financeira: "Aluguel Escritório"                        │
│   ├─ Grupo: SG&A                                               │
│   ├─ DRE: (-) Despesas Operacionais (SG&A)                     │
│   ├─ Batimento: EXPENSE                                        │
│   └─ Sub-categoria: Office Expenses:Rent                       │
│                                                                │
│ Descrição: "Aluguel Janeiro 2026"                             │
│ Valor: -$2,500.00                                              │
│ Tipo: expense (despesa)                                        │
│ Status: paid (pago)                                            │
│ Fornecedor: Real Estate Company                                │
│ Método Pagamento: bank_transfer                                │
└────────────────────────────────────────────────────────────────┘
```

```sql
-- Estrutura da Tabela
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY,
    financial_class_id UUID REFERENCES financial_classes(id),
    
    -- DADOS DA TRANSAÇÃO
    transaction_date DATE,
    description TEXT,
    amount DECIMAL(15, 2),
    transaction_type VARCHAR(20),  -- 'income', 'expense'
    
    -- REFERÊNCIAS
    agent_id UUID,                 -- Fornecedor/Cliente
    invoice_number VARCHAR(100),
    payment_method VARCHAR(50),
    
    -- STATUS
    status VARCHAR(50),            -- 'pending', 'approved', 'paid'
    approved_by UUID,
    approved_at TIMESTAMP,
    paid_at TIMESTAMP,
    
    -- EXTRAS
    notes TEXT,
    attachments JSONB,
    
    -- RECORRÊNCIA
    is_recurring BOOLEAN,
    recurrence_rule TEXT,
    
    created_by UUID,
    created_at TIMESTAMP
);
```

---

## 6️⃣ FINANCIAL_BUDGETS (Orçamentos)

**Exemplo:**

| Classe Financeira | Ano | Mês | Valor Orçado | Observações |
|-------------------|-----|-----|--------------|-------------|
| Aluguel Escritório | 2026 | 1 | $2,500.00 | Aluguel fixo mensal |
| Combustível | 2026 | 1 | $800.00 | Estimativa baseada em histórico |
| Marketing | 2026 | NULL | $30,000.00 | Orçamento anual |

```sql
-- Estrutura da Tabela
CREATE TABLE financial_budgets (
    id UUID PRIMARY KEY,
    financial_class_id UUID REFERENCES financial_classes(id),
    
    year INTEGER,
    month INTEGER,                 -- NULL para orçamento anual
    
    budgeted_amount DECIMAL(15, 2),
    notes TEXT,
    
    created_by UUID,
    created_at TIMESTAMP,
    
    UNIQUE(financial_class_id, year, month)
);
```

---

## 📈 COMO OS DADOS SE CONECTAM

### Exemplo: Lançamento de "Aluguel Escritório"

```
1. Usuário lança uma despesa
   ↓
2. Seleciona Classe: "Aluguel Escritório"
   ↓
3. Sistema automaticamente associa:
   ├─ Grupo: "SG&A"
   ├─ DRE: "(-) Despesas Operacionais (SG&A)"
   ├─ Batimento: "EXPENSE"
   └─ Sub-categoria: "Office Expenses:Rent"
   ↓
4. Transação é salva em financial_transactions
   ↓
5. Relatórios (DRE, Batimento, Apuração) leem automaticamente
```

---

## 📊 RELATÓRIOS GERADOS

### 1. **DRE GERENCIAL (Mensal)**
```
DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO - JANEIRO 2026

Receita Bruta                          $628,956
(-) Custo da Mercadoria Vendida        ($554,736)
(-) Comissões                          ($8,978)
(-) Frete de compra                    ($249)
────────────────────────────────────────────────
LUCRO BRUTO                            $64,992

(-) Despesas Operacionais (SG&A)       ($20,109)
(-) Participação nos Resultados        ($1,122)
────────────────────────────────────────────────
EBIT (Lucro Operacional)               $43,761

Lucro Líquido                          $43,761
Lucro Líquido %                        6.96%
```

### 2. **BATIMENTO CAPITAL**
```
FLUXO DE CAIXA - JANEIRO 2026

CONTAS A RECEBER
  Receita de vendas                    $49,881,636

EXPENSE (Saídas)
  Pagamentos recebidos                 ($63,349,682)
  Aluguel                              ($2,500)
  Salários                             ($15,000)
  ...

ESTOQUE
  Estoque físico (Entrada - Pago)      $X
  ...
```

### 3. **APURAÇÃO SEMANAL**
```
APURAÇÃO SEMANAL - Semana 2 (04/01 a 10/01)

RECEITA                                $628,956.12
CUSTO OP                               ($554,736.83)
LUCRO BRUTO                            $74,219.29
MARGEM BRUTA                           11.80%

Provisão de Comissão                   ($8,978.19)
Despesas                               ($13,613.43)
Participação nos Resultados            ($1,290.70)

Resultado Líquido da Semana            $50,337.46
MARGEM LÍQUIDA                         8.00%
```

---

## 🔐 SEGURANÇA (RLS)

- ✅ Todos os usuários autenticados podem **LER** dados financeiros
- ✅ Apenas **ADMINS** podem criar/editar **cadastros** (grupos, classes, categorias)
- ✅ Qualquer usuário pode **LANÇAR** transações
- ✅ Apenas **ADMINS** ou **CRIADOR** podem editar transações
- ✅ Apenas **ADMINS** podem gerenciar orçamentos

---

## 📝 RESUMO DOS NÚMEROS

| Tabela | Quantidade Inicial |
|--------|-------------------|
| Financial Groups | 15 grupos |
| DRE Categories | 20+ categorias |
| Capital Flow Categories | 7 categorias |
| **Financial Classes** | **33+ classes** |
| Transactions | 0 (a ser lançado) |
| Budgets | 0 (a ser criado) |

---

## ✅ PRÓXIMOS PASSOS

1. ✅ Aplicar migrations no banco
2. 🔄 Criar páginas de **Cadastro**
3. 🔄 Criar página de **Lançamentos**
4. 🔄 Criar **Relatórios** (DRE, Batimento, Apuração)
