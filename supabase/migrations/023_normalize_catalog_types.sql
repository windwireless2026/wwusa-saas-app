-- Padroniza os tipos no catálogo para baterem com a tabela product_types
update public.product_catalog set type = 'Celular' where type = 'Cell phone';
update public.product_catalog set type = 'Tablet' where type = 'iPad';
update public.product_catalog set type = 'Relogio' where type = 'Watch';
update public.product_catalog set type = 'Fone' where type = 'AirPods';
update public.product_catalog set type = 'Computador' where type = 'Macbook';
