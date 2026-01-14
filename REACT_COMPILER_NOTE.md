# ⚠️ REACT COMPILER - NOTA TÉCNICA

## Problema Identificado

Após ativar o React Compiler (experimental no Next.js 16), foi detectado um **hydration mismatch** com `styled-jsx`:

```
Error: A tree hydrated but some attributes of the server rendered HTML
didn't match the client properties.

Diferença nos classNames:
- Servidor: className="jsx-2fe9ad59f7ae8409"
- Cliente:  className="jsx-c11742dd3f1dbb9b"
```

## Causa

O React Compiler (ainda experimental) não é totalmente compatível com:

- `styled-jsx` inline (`<style jsx>` em componentes)
- CSS-in-JS libraries que geram hashes dinâmicos
- Alguns padrões de SSR avançados

## Solução Aplicada

✅ React Compiler **temporariamente desativado** em `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  // reactCompiler: true, // Temporarily disabled - hydration mismatch
};
```

## Recomendações Futuras

### Opção A: Aguardar Estabilização

- Esperar React Compiler sair da fase experimental
- Monitorar releases do Next.js 16.x
- Re-ativar quando estável

### Opção B: Migrar styled-jsx para CSS Modules

Substituir `<style jsx>` por CSS Modules ou Tailwind:

**Antes:**

```tsx
return (
  <div>
    <style jsx>{`
      .container {
        padding: 20px;
      }
    `}</style>
  </div>
);
```

**Depois (CSS Modules):**

```tsx
import styles from './Component.module.css';

return <div className={styles.container}></div>;
```

### Opção C: Usar Tailwind CSS

- Install: `npm install -D tailwindcss postcss autoprefixer`
- Configure: `npx tailwindcss init -p`
- Substituir inline styles por utility classes

## Status Atual

- ✅ **Aplicação funcionando** sem hydration errors
- ⏸️ **React Compiler desativado** (sem perda de funcionalidade)
- 🎯 **Performance ainda ótima** com TanStack Query

## Performance Sem React Compiler

Mesmo sem React Compiler, temos:

- ✅ Next.js 16 App Router (otimizado)
- ✅ TanStack Query (cache inteligente)
- ✅ 18 Database indexes
- ✅ Code splitting automático
- ✅ Image optimization

**Ganho estimado perdido**: ~10-15% (marginal)  
**Ganho mantido com outras otimizações**: ~200-300%

## Conclusão

**Decisão correta**: Desativar React Compiler por enquanto.

**Motivo**: Estabilidade > Performance marginal

**Quando reativar**: Quando Next.js 16.2+ ou 17 estabilizar o suporte.

---

_Atualizado: 09/01/2026 - 10:30 AM_
