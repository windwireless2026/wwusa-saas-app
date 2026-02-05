-- Tabela única de Grades: usada em Contas a Pagar (invoice_items), Estoque (inventory) e Invoice de Vendas
-- Uma única fonte de verdade para garantir consistência entre módulos
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.grades IS 'Catálogo de grades/condição de aparelhos; usado em AP, estoque e vendas';
COMMENT ON COLUMN public.grades.code IS 'Código exibido (ex: A, B, C, As-Is)';
COMMENT ON COLUMN public.grades.name IS 'Nome/descrição opcional';
COMMENT ON COLUMN public.grades.display_order IS 'Ordem de exibição em listas e dropdowns';

CREATE INDEX IF NOT EXISTS idx_grades_code ON public.grades(code);
CREATE INDEX IF NOT EXISTS idx_grades_active_order ON public.grades(is_active, display_order);

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "grades_select_authenticated" ON public.grades;
CREATE POLICY "grades_select_authenticated" ON public.grades
    FOR SELECT TO authenticated USING (true);

-- Apenas roles operacional+ podem alterar (opcional; para manter só leitura por enquanto)
DROP POLICY IF EXISTS "grades_manage_operacional" ON public.grades;
CREATE POLICY "grades_manage_operacional" ON public.grades
    FOR ALL TO authenticated
    USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio', 'administrador'))
    WITH CHECK (true);

-- Seed: mescla todos os códigos já usados em inventory (104), AddItemModal, NewInvoicePage e estimates
INSERT INTO public.grades (code, name, display_order) VALUES
    ('A', 'Grade A', 10),
    ('A-', 'Grade A-', 20),
    ('AB', 'Grade AB', 25),
    ('B', 'Grade B', 30),
    ('C', 'Grade C', 40),
    ('D', 'Grade D', 50),
    ('As-Is', 'As-Is', 60),
    ('LACRADO', 'Lacrado', 70),
    ('Open Box', 'Open Box', 80),
    ('LEILAO', 'Leilão', 85),
    ('Blocked', 'Blocked', 90),
    ('RMA', 'RMA', 100),
    ('RMA-Returns', 'RMA Returns', 105),
    ('RR', 'RR', 110)
ON CONFLICT (code) DO NOTHING;

-- Remover a constraint fixa de inventory para permitir qualquer grade que exista na tabela (e valores legados)
-- A validação passa a ser via UI (dropdown da tabela grades)
ALTER TABLE public.inventory DROP CONSTRAINT IF EXISTS inventory_grade_check;

NOTIFY pgrst, 'reload schema';
