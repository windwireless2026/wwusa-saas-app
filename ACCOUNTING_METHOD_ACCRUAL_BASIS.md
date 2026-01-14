# 📊 ACCOUNTING METHOD - WIND WIRELESS LLC

## 🎯 **MÉTODO CONTÁBIL OFICIAL**

**Wind Wireless LLC utiliza:**
```
ACCRUAL BASIS (Regime de Competência)
```

---

## ✅ **O QUE É ACCRUAL BASIS:**

### **Reconhecimento de Receitas:**
- ✅ Receita é reconhecida quando **ganhada** (earned)
- ✅ Não importa quando o dinheiro é recebido
- ✅ Exemplo: Venda realizada em 15/Jan → receita de Janeiro (mesmo se pago em Fevereiro)

### **Reconhecimento de Despesas:**
- ✅ Despesa é reconhecida quando **incorrida** (incurred)
- ✅ Não importa quando o dinheiro é pago
- ✅ Exemplo: Aluguel de Janeiro → despesa de Janeiro (mesmo se pago em Dezembro)

---

## 📋 **IMPLICAÇÕES PRÁTICAS:**

### **1. Accounts Receivable (Contas a Receber):**
```sql
-- Venda realizada hoje, cliente paga em 30 dias
INSERT INTO transactions (
  account = '4110', -- Sales Revenue
  amount = 1000,
  date = '2026-01-15'
);

INSERT INTO transactions (
  account = '1121', -- Accounts Receivable
  amount = 1000,
  date = '2026-01-15'
);

-- Quando receber:
INSERT INTO transactions (
  account = '1111', -- Cash
  amount = 1000,
  date = '2026-02-15'
);

INSERT INTO transactions (
  account = '1121', -- Accounts Receivable
  amount = -1000,
  date = '2026-02-15'
);
```

### **2. Accounts Payable (Contas a Pagar):**
```sql
-- Compra realizada hoje, pago em 30 dias
INSERT INTO transactions (
  account = '5110', -- COGS
  amount = 500,
  date = '2026-01-15'
);

INSERT INTO transactions (
  account = '2110', -- Accounts Payable
  amount = 500,
  date = '2026-01-15'
);

-- Quando pagar:
INSERT INTO transactions (
  account = '2110', -- Accounts Payable
  amount = -500,
  date = '2026-02-15'
);

INSERT INTO transactions (
  account = '1111', -- Cash
  amount = -500,
  date = '2026-02-15'
);
```

---

## 🇺🇸 **CONFORMIDADE GAAP:**

### **Por que Accrual Basis:**
1. ✅ **Obrigatório pela GAAP** para empresas
2. ✅ **Requerido pelo IRS** para empresas com receita > $25M ou inventário
3. ✅ **Matching Principle**: Despesas combinadas com receitas do mesmo período
4. ✅ **Visão real** da performance financeira
5. ✅ **Auditável** e aceito por bancos/investidores

### **Cash Basis vs Accrual Basis:**

| Aspecto | Cash Basis | Accrual Basis ✅ |
|---------|-----------|-----------------|
| Receita quando | Recebida | Ganhada |
| Despesa quando | Paga | Incorrida |
| GAAP Compliant | ❌ Não | ✅ Sim |
| Para Wind Wireless | ❌ Não permitido | ✅ OBRIGATÓRIO |
| Complexidade | Simples | Moderada |
| Precisão | Baixa | ✅ Alta |

---

## 🔧 **IMPLEMENTAÇÃO NO SISTEMA:**

### **Campos Necessários nas Transações:**
```typescript
interface FinancialTransaction {
  transaction_date: Date;        // Data da competência
  payment_date?: Date;            // Data do pagamento (pode ser diferente)
  invoice_date?: Date;            // Data da fatura
  due_date?: Date;                // Data de vencimento
  paid_at?: Date;                 // Quando foi pago/recebido
  status: 'pending' | 'paid' | 'overdue'; // Status do pagamento
}
```

### **Relatórios Impactados:**
1. **Income Statement (DRE):** Por competência
2. **Balance Sheet:** Mostra A/R e A/P
3. **Cash Flow Statement:** Reconcilia competência vs. caixa

---

## 📊 **EXEMPLO PRÁTICO:**

### **Cenário: Venda de iPhone em 15/Jan, pagamento em 15/Fev**

**Janeiro (Income Statement):**
```
Receita de Vendas:        $1,000
COGS:                      ($500)
Lucro Bruto:                $500
```

**Janeiro (Balance Sheet):**
```
Accounts Receivable:      $1,000
Cash:                        $0
```

**Fevereiro (Cash Flow):**
```
Cash In:                  $1,000  (recebimento do A/R de Janeiro)
```

**Fevereiro (Income Statement):**
```
Receita de Vendas:           $0  (já foi reconhecida em Janeiro)
```

---

## ✅ **CHECKLIST DE CONFORMIDADE:**

- [x] Chart of Accounts GAAP-compliant
- [x] Campos para transaction_date e payment_date
- [x] Accounts Receivable (1121)
- [x] Accounts Payable (2110)
- [x] Accrued Expenses (2120)
- [x] Prepaid Expenses (1160)
- [ ] Relatórios por competência
- [ ] Reconciliação competência vs. caixa
- [ ] Ajustes de fim de período

---

## 📚 **REFERÊNCIAS:**

- **GAAP:** Generally Accepted Accounting Principles
- **FASB:** Financial Accounting Standards Board
- **IRS Publication 538:** Accounting Periods and Methods
- **ASC 606:** Revenue Recognition Standard

---

**Data de Implementação:** Janeiro 2026  
**Método:** Accrual Basis  
**Empresa:** Wind Wireless LLC  
**Compliance:** US GAAP
