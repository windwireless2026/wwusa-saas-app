# Teste: Estimate (após reiniciar)

Use este checklist quando voltar para validar as alterações no estimate e no wizard B2B.

---

## 1. Subir o projeto

```bash
cd d:\dev\wwusa-saas-app
npm run dev
```

Acesse: **http://localhost:9000**

---

## 2. Testar a página de edição do Estimate

- URL de exemplo: **http://localhost:9000/pt/commercial/estimates/295e958a-cf62-4402-9eca-bcfd99b404ec**
- Ou: Comercial → Estimates → abrir um estimate existente.

**O que conferir:**

- [ ] Itens com **mesmo modelo + capacidade + grade** aparecem **agrupados em uma única linha** (quantidade somada).
- [ ] Coluna **CUSTO** mostra o **custo unitário original da importação** (não preço médio).
- [ ] Coluna **DESCRIÇÃO** está **"UNLOCKED (AUCTION - NO TEST - NO WARRANTY)"** em todas as linhas.

---

## 3. Testar o Wizard de Entrada de Estoque (B2B)

- Ir em **Operações / Estoque** (ou fluxo de Entrada de Estoque).
- Fazer uma entrada com lotes marcados como **Back-to-Back** e cliente definido.
- Concluir o wizard para gerar estimates e invoices B2B automaticamente.

**O que conferir:**

- [ ] Os **estimate_items** criados automaticamente têm:
  - **cost_price** = valor unitário da importação.
  - **description** = "UNLOCKED (AUCTION - NO TEST - NO WARRANTY)".
- [ ] Abrindo o estimate gerado, as linhas já vêm **agrupadas** e com **CUSTO** e **DESCRIÇÃO** corretos (como no item 2).

---

## Arquivos alterados (referência)

- `src/components/dashboard/StockEntryWizard.tsx` — cost_price, description e margin_percent ao criar estimate_items B2B.
- `src/app/[locale]/commercial/estimates/[id]/page.tsx` — agregação por modelo+capacidade+grade, descrição fixa e custo original no carregamento.

---

*Gerado para testar após reiniciar o computador.*
