# 📋 GUIA DE IMPLEMENTAÇÃO - FILTROS TIPO EXCEL

## 🎯 OBJETIVO:
Aplicar filtros tipo Excel (igual a `/dashboard/users`) em todas as páginas de listagem.

---

## ✅ **PÁGINA 1: USERS** (JÁ FEITO)

### **Filtros Implementados:**
- Nome
- Email
- Perfil de Acesso

### **Features:**
- ✅ Sticky header
- ✅ Dropdown com busca
- ✅ Selecionar Tudo
- ✅ Checkboxes múltiplos
- ✅ Contador de selecionados

---

## 📝 **TEMPLATE PARA OUTRAS PÁGINAS:**

### **Passo 1: Imports**
```tsx
import { useState, useEffect, useMemo } from 'react';
import ColumnFilter from '@/components/ui/ColumnFilter';
```

### **Passo 2: States para Filtros**
```tsx
// Exemplo para Agents
const [selectedNames, setSelectedNames] = useState<string[]>([]);
const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
```

### **Passo 3: Extrair Opções Únicas**
```tsx
const uniqueNames = useMemo(
  () => [...new Set(items.map(i => i.name))].sort(),
  [items]
);
```

### **Passo 4: Inicializar Filtros**
```tsx
useEffect(() => {
  if (items.length > 0 && selectedNames.length === 0) {
    setSelectedNames(uniqueNames);
  }
}, [items, selectedNames.length, uniqueNames]);
```

### **Passo 5: Aplicar Filtros**
```tsx
const filteredItems = items.filter(item => {
  const matchesSearch = /*busca global*/;
  const matchesName = selectedNames.includes(item.name);
  return matchesSearch && matchesName;
});
```

### **Passo 6: Headers com Filtros**
```tsx
<thead style={{ position: 'sticky', top: 0, zIndex: 50 }}>
  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
    <th style={thStyle}>
      <ColumnFilter
        label="Nome"
        options={uniqueNames}
        selected={selectedNames}
        onChange={setSelectedNames}
      />
    </th>
  </tr>
</thead>
```

---

## 🚀 **PÁGINA 2: AGENTS**

### **Colunas da Tabela:**
1. Nome (+ Legal Name)
2. País (🇧🇷 / 🇺🇸)
3. Tipos (tags coloridas)
4. Documento (tax_id)
5. Contato (email + phone)

### **Filtros a Adicionar:**
- **Nome** - text (agent.name)
- **País** - BR/US
- **Tipos** - roles array (fornecedor, cliente, etc)

### **Dados para uniqueValues:**
```tsx
const uniqueNames = useMemo(
  () => [...new Set(agents.map(a => a.name))].sort(),
  [agents]
);

const uniqueCountries = useMemo(
  () => [...new Set(agents.map(a => a.country))].sort(),
  [agents]
);

const uniqueTypes = useMemo(() => {
  const allTypes = agents.flatMap(a => a.roles || []);
  return [...new Set(allTypes)].sort();
}, [agents]);
```

---

## 🚀 **PÁGINA 3: MANUFACTURERS**

### **Colunas:**
1. Nome
2. Website

### **Filtros:**
- **Nome** - manufacturer.name
- **Website** - tem/não tem

---

## 🚀 **PÁGINA 4: PRODUCT TYPES**

### **Colunas:**
1. Tipo (nome + ícone)
2. Rastreio Principal (IMEI/SERIAL)

### **Filtros:**
- **Tipo** - type.name
- **Rastreio** - IMEI/SERIAL

---

## 🚀 **PÁGINA 5: STOCK LOCATIONS**

### **Colunas:**
1. Nome (+ endereço)
2. Descrição

### **Filtros:**
- **Nome** - location.name
- **Cidade** - location.city
- **Estado** - location.state

---

## 🚀 **PÁGINA 6: MODELS (CATALOG)**

### **Colunas:**
1. Tipo
2. Produto (modelo)
3. Modelo
4. Ano de Lançamento

### **Filtros:**
- **Tipo** - product.type
- **Fabricante** - product.manufacturer
- **Modelo** - product.name
- **Ano** - product.release_year

---

## ⚡ **OTIMIZAÇÃO:**

Para aplicar em todas as 5 páginas restantes de forma eficiente:

1. Copiar estrutura do Users
2. Ajustar nomes de variáveis
3. Adaptar lógica de filtros
4. Testar cada uma

**Tempo estimado:** 5-7 min por página = 25-35 min total

---

## 📌 **NOTAS IMPORTANTES:**

### **Sticky Header:**
```tsx
<thead style={{ position: 'sticky', top: 0, zIndex: 50, background: '#f8fafc' }}>
```

### **Container com Scroll:**
```tsx
<div style={{ 
  maxHeight: '70vh', 
  overflowY: 'auto',
  position: 'relative' 
}}>
```

### **Estilos Consistentes:**
- Background header: `#f8fafc`
- Border header: `2px solid #e2e8f0`
- Padding células: `18px 24px`
- Font header: `11px, weight 800, uppercase`

---

**Criado em:** 09/01/2026 15:31
**Status:** Template pronto para implementação
