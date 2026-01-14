-- Adiciona o campo de Cargo (Job Title) na tabela de perfis
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title text;

-- Atualiza o seu usuário para ter um cargo de exemplo
UPDATE public.profiles 
SET job_title = 'CEO' 
WHERE email = 'erik@windwmiami.com';
