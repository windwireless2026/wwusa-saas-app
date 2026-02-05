-- Incluir Grade D na constraint de inventory (já usada na AP e na planilha de entrada)
ALTER TABLE public.inventory DROP CONSTRAINT IF EXISTS inventory_grade_check;
ALTER TABLE public.inventory ADD CONSTRAINT inventory_grade_check
  CHECK (grade IN ('A', 'A-', 'AB', 'B', 'C', 'D', 'RMA', 'Blocked', 'RMA-Returns', 'RR', 'As-Is', 'LACRADO', 'Open Box'));
