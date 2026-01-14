# 🌐 GUIA DE DESENVOLVIMENTO - MULTI-PROJETO

## 📋 REGRAS DE OURO

### 🔷 **Para DESENVOLVIMENTO LOCAL (localhost)**
```
✅ USE: Chrome Incógnito / Guest / Sem Perfil
❌ NÃO USE: Perfis do Chrome com login Supabase
```

**Por quê?**
- Zero conflito de cookies entre projetos
- Sessão limpa a cada abertura
- Mesmo ambiente que usuário final terá
- Fácil debugging

---

### 🔶 **Para SUPABASE DASHBOARD + VERCEL**
```
✅ USE: Perfis específicos do Chrome
   - Perfil "WIND" → Org Wind Wireless
   - Perfil "ERIK" → Org BrixAurea
❌ NÃO USE: Para desenvolvimento local
```

**Por quê?**
- Login persistente no dashboard
- Separação de organizações
- Não interfere com desenvolvimento

---

## 🚀 WORKFLOW DIÁRIO

### **Desenvolvendo Wind Wireless:**
```bash
1. 🌐 Abrir Chrome Incógnito
2. 🔗 http://localhost:3000
3. 🔐 Login: erik@windwmiami.com / Xpto1983@
4. 💻 Desenvolver
5. ❌ Fechar Incógnito ao terminar
```

### **Desenvolvendo Brix Aurea:**
```bash
1. 🌐 Abrir Chrome Incógnito (outra janela)
2. 🔗 http://localhost:3001 (ou porta diferente)
3. 🔐 Login: (usuário org ERIK)
4. 💻 Desenvolver
5. ❌ Fechar Incógnito ao terminar
```

### **Gerenciando Supabase Wind:**
```bash
1. 🟦 Abrir Perfil "WIND"
2. 🔗 https://supabase.com/dashboard
3. 🎯 Selecionar projeto Wind Wireless
4. ⚙️ Gerenciar SQL Editor, Database, etc
```

### **Gerenciando Supabase Brix Aurea:**
```bash
1. 🟩 Abrir Perfil "ERIK"
2. 🔗 https://supabase.com/dashboard
3. 🎯 Selecionar projeto Brix Aurea
4. ⚙️ Gerenciar SQL Editor, Database, etc
```

---

## 📁 ESTRUTURA DE PROJETOS

```
D:\dev\
├── wwusa-saas-app\          ← Wind Wireless
│   ├── .env.local
│   │   NEXT_PUBLIC_SUPABASE_URL=***
│   │   PROJECT_ID: kwatwptxcvcvfzkmkeql
│   └── supabase\
│
└── brixaurea-saas-app\      ← Brix Aurea
    ├── .env.local
    │   NEXT_PUBLIC_SUPABASE_URL=***
    │   PROJECT_ID: (outro)
    └── supabase\
```

---

## ⚠️ PROBLEMAS COMUNS E SOLUÇÕES

### ❌ "Nenhum usuário encontrado" ao logar
**Causa**: Perfil Chrome com cookies de outro projeto  
**Solução**: Use Chrome Incógnito

### ❌ "Multiple GoTrueClient instances"
**Causa**: localStorage antigo conflitando  
**Solução**: Chrome Incógnito sempre limpa isso

### ❌ Sessão não persiste entre reloads
**Causa**: Modo Incógnito limpa ao fechar  
**Solução**: Normal! Faça login novamente

---

## 🎯 CHECKLIST ANTES DE COMEÇAR

**Desenvolvendo?**
- [ ] Chrome Incógnito aberto
- [ ] Projeto correto (`npm run dev` rodando)
- [ ] Porta correta (3000, 3001, etc)
- [ ] .env.local com variáveis corretas

**Gerenciando Dashboard?**
- [ ] Perfil Chrome correto (WIND ou ERIK)
- [ ] Organização correta selecionada
- [ ] Projeto correto selecionado

---

## 📞 CONTATOS ÚTEIS

**Wind Wireless:**
- Supabase Project: kwatwptxcvcvfzkmkeql
- Email dev: erik@windwmiami.com
- Localhost: http://localhost:3000

**Brix Aurea:**
- Supabase Project: (seu ID)
- Email dev: (seu email)
- Localhost: http://localhost:3001

---

**Última atualização**: 09/01/2026 - 13:45
**Criado por**: Antigravity AI Assistant
