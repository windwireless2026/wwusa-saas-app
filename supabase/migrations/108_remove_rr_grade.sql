-- RR = Registro/Relatório de Recebimento (documento), não condição do produto.
-- Condição equivalente no catálogo é As-Is. Remover RR das grades.
UPDATE public.inventory SET grade = 'As-Is' WHERE grade = 'RR';
UPDATE public.estimate_items SET grade = 'As-Is' WHERE grade = 'RR';
UPDATE public.invoice_items SET grade = 'As-Is' WHERE grade = 'RR';

DELETE FROM public.grades WHERE code = 'RR';

NOTIFY pgrst, 'reload schema';
