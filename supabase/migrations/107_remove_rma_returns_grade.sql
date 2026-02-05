-- RMA e RMA-Returns são a mesma coisa: manter só RMA
-- Atualiza referências existentes para RMA e remove a grade RMA-Returns
UPDATE public.inventory SET grade = 'RMA' WHERE grade = 'RMA-Returns';
UPDATE public.estimate_items SET grade = 'RMA' WHERE grade = 'RMA-Returns';
UPDATE public.invoice_items SET grade = 'RMA' WHERE grade = 'RMA-Returns';

DELETE FROM public.grades WHERE code = 'RMA-Returns';

NOTIFY pgrst, 'reload schema';
