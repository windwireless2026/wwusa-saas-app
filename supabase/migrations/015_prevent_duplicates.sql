-- Garante que não existam dois agentes com o mesmo documento (EIN/CNPJ/CPF)
-- O Postgres permite múltiplos NULLs em colunas UNIQUE, então isso não quebra agentes sem documento.
ALTER TABLE public.agents 
ADD CONSTRAINT agents_tax_id_unique UNIQUE (tax_id);

-- Opcional: Criar um índice para busca rápida de nomes ignorando maiúsculas/minúsculas
CREATE INDEX IF NOT EXISTS idx_agents_name_lower ON public.agents (lower(name));
CREATE INDEX IF NOT EXISTS idx_agents_legal_name_lower ON public.agents (lower(legal_name));
