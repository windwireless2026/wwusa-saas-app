-- Deleta permanentemente o registro de teste para limpar o banco
delete from public.product_types where name = 'Teste RLS';
