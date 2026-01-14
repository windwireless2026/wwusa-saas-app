-- Script para popular manualmente o catálogo de produtos
-- Execute este script no Supabase SQL Editor se a migration 015 não foi aplicada

-- Primeiro, limpar dados existentes (CUIDADO: isso apaga tudo!)
-- TRUNCATE TABLE public.product_catalog CASCADE;

-- Verificar se existem dados
SELECT COUNT(*) as total_registros FROM public.product_catalog;

-- Se não houver dados, executar os INSERTs abaixo:

-- iPhones (tipo Celular em português)
INSERT INTO public.product_catalog (name, type, manufacturer, release_year) VALUES
('iPhone', 'Celular', 'Apple', 2007),
('iPhone 3G', 'Celular', 'Apple', 2008),
('iPhone 3GS', 'Celular', 'Apple', 2009),
('iPhone 4', 'Celular', 'Apple', 2010),
('iPhone 4S', 'Celular', 'Apple', 2011),
('iPhone 5', 'Celular', 'Apple', 2012),
('iPhone 5c', 'Celular', 'Apple', 2013),
('iPhone 5s', 'Celular', 'Apple', 2013),
('iPhone 6', 'Celular', 'Apple', 2014),
('iPhone 6 Plus', 'Celular', 'Apple', 2014),
('iPhone 6s', 'Celular', 'Apple', 2015),
('iPhone 6s Plus', 'Celular', 'Apple', 2015),
('iPhone SE (1ª geração)', 'Celular', 'Apple', 2016),
('iPhone 7', 'Celular', 'Apple', 2016),
('iPhone 7 Plus', 'Celular', 'Apple', 2016),
('iPhone 8', 'Celular', 'Apple', 2017),
('iPhone 8 Plus', 'Celular', 'Apple', 2017),
('iPhone X', 'Celular', 'Apple', 2017),
('iPhone XR', 'Celular', 'Apple', 2018),
('iPhone XS', 'Celular', 'Apple', 2018),
('iPhone XS Max', 'Celular', 'Apple', 2018),
('iPhone 11', 'Celular', 'Apple', 2019),
('iPhone 11 Pro', 'Celular', 'Apple', 2019),
('iPhone 11 Pro Max', 'Celular', 'Apple', 2019),
('iPhone SE (2ª geração)', 'Celular', 'Apple', 2020),
('iPhone 12 mini', 'Celular', 'Apple', 2020),
('iPhone 12', 'Celular', 'Apple', 2020),
('iPhone 12 Pro', 'Celular', 'Apple', 2020),
('iPhone 12 Pro Max', 'Celular', 'Apple', 2020),
('iPhone 13 mini', 'Celular', 'Apple', 2021),
('iPhone 13', 'Celular', 'Apple', 2021),
('iPhone 13 Pro', 'Celular', 'Apple', 2021),
('iPhone 13 Pro Max', 'Celular', 'Apple', 2021),
('iPhone SE (3ª geração)', 'Celular', 'Apple', 2022),
('iPhone 14', 'Celular', 'Apple', 2022),
('iPhone 14 Plus', 'Celular', 'Apple', 2022),
('iPhone 14 Pro', 'Celular', 'Apple', 2022),
('iPhone 14 Pro Max', 'Celular', 'Apple', 2022),
('iPhone 15', 'Celular', 'Apple', 2023),
('iPhone 15 Plus', 'Celular', 'Apple', 2023),
('iPhone 15 Pro', 'Celular', 'Apple', 2023),
('iPhone 15 Pro Max', 'Celular', 'Apple', 2023),
('iPhone 16', 'Celular', 'Apple', 2024),
('iPhone 16 Plus', 'Celular', 'Apple', 2024),
('iPhone 16 Pro', 'Celular', 'Apple', 2024),
('iPhone 16 Pro Max', 'Celular', 'Apple', 2024)
ON CONFLICT (name) DO NOTHING;

-- iPads (tipo Tablet em português)
INSERT INTO public.product_catalog (name, type, manufacturer, release_year) VALUES
('iPad (1ª geração)', 'Tablet', 'Apple', 2010),
('iPad (2ª geração)', 'Tablet', 'Apple', 2011),
('iPad (3ª)', 'Tablet', 'Apple', 2012),
('iPad (4ª)', 'Tablet', 'Apple', 2012),
('iPad mini (1ª)', 'Tablet', 'Apple', 2012),
('iPad Air (1ª)', 'Tablet', 'Apple', 2013),
('iPad mini (2ª)', 'Tablet', 'Apple', 2013),
('iPad Air (2ª)', 'Tablet', 'Apple', 2014),
('iPad mini (3ª)', 'Tablet', 'Apple', 2014),
('iPad mini (4ª)', 'Tablet', 'Apple', 2015),
('iPad Pro 12.9" (1ª)', 'Tablet', 'Apple', 2015),
('iPad Pro 9.7" (1ª)', 'Tablet', 'Apple', 2016),
('iPad (5ª)', 'Tablet', 'Apple', 2017),
('iPad Pro 10.5" (2ª)', 'Tablet', 'Apple', 2017),
('iPad Pro 12.9" (2ª)', 'Tablet', 'Apple', 2017),
('iPad (6ª)', 'Tablet', 'Apple', 2018),
('iPad Pro 11" (1ª)', 'Tablet', 'Apple', 2018),
('iPad Pro 12.9" (3ª)', 'Tablet', 'Apple', 2018),
('iPad (7ª)', 'Tablet', 'Apple', 2019),
('iPad mini (5ª)', 'Tablet', 'Apple', 2019),
('iPad Air (3ª)', 'Tablet', 'Apple', 2019),
('iPad Pro 11" (2ª)', 'Tablet', 'Apple', 2020),
('iPad Pro 12.9" (4ª)', 'Tablet', 'Apple', 2020),
('iPad (8ª)', 'Tablet', 'Apple', 2020),
('iPad Air (4ª)', 'Tablet', 'Apple', 2020),
('iPad (9ª)', 'Tablet', 'Apple', 2021),
('iPad mini (6ª)', 'Tablet', 'Apple', 2021),
('iPad Pro 11" (3ª)', 'Tablet', 'Apple', 2021),
('iPad Pro 12.9" (5ª)', 'Tablet', 'Apple', 2021),
('iPad (10ª)', 'Tablet', 'Apple', 2022),
('iPad Air (5ª)', 'Tablet', 'Apple', 2022),
('iPad Pro 11" (4ª)', 'Tablet', 'Apple', 2022),
('iPad Pro 12.9" (6ª)', 'Tablet', 'Apple', 2022),
('iPad Pro (M4)', 'Tablet', 'Apple', 2024),
('iPad Air (M2)', 'Tablet', 'Apple', 2024),
('iPad mini (A17 Pro)', 'Tablet', 'Apple', 2024)
ON CONFLICT (name) DO NOTHING;

-- Apple Watches (tipo Relogio em português)
INSERT INTO public.product_catalog (name, type, manufacturer, release_year) VALUES
('Apple Watch Series 1', 'Relogio', 'Apple', 2016),
('Apple Watch Series 2', 'Relogio', 'Apple', 2016),
('Apple Watch Series 3', 'Relogio', 'Apple', 2017),
('Apple Watch Series 4', 'Relogio', 'Apple', 2018),
('Apple Watch Series 5', 'Relogio', 'Apple', 2019),
('Apple Watch Series 6', 'Relogio', 'Apple', 2020),
('Apple Watch SE (1ª)', 'Relogio', 'Apple', 2020),
('Apple Watch Series 7', 'Relogio', 'Apple', 2021),
('Apple Watch Series 8', 'Relogio', 'Apple', 2022),
('Apple Watch SE (2ª)', 'Relogio', 'Apple', 2022),
('Apple Watch Ultra', 'Relogio', 'Apple', 2022),
('Apple Watch Series 9', 'Relogio', 'Apple', 2023),
('Apple Watch Ultra 2', 'Relogio', 'Apple', 2023),
('Apple Watch Series 10', 'Relogio', 'Apple', 2024)
ON CONFLICT (name) DO NOTHING;

-- AirPods (tipo Fone em português)
INSERT INTO public.product_catalog (name, type, manufacturer, release_year) VALUES
('AirPods (1ª)', 'Fone', 'Apple', 2016),
('AirPods (2ª)', 'Fone', 'Apple', 2019),
('AirPods Pro (1ª)', 'Fone', 'Apple', 2019),
('AirPods Max', 'Fone', 'Apple', 2020),
('AirPods (3ª)', 'Fone', 'Apple', 2021),
('AirPods Pro (2ª – Lightning)', 'Fone', 'Apple', 2022),
('AirPods Pro (2ª – USB-C)', 'Fone', 'Apple', 2023),
('AirPods 4', 'Fone', 'Apple', 2024)
ON CONFLICT (name) DO NOTHING;

-- Macs (tipo Computador em português)
INSERT INTO public.product_catalog (name, type, manufacturer, release_year) VALUES
('MacBook Air (M1)', 'Computador', 'Apple', 2020),
('MacBook Pro 13" (M1)', 'Computador', 'Apple', 2020),
('Mac mini (M1)', 'Computador', 'Apple', 2020),
('iMac 24" (M1)', 'Computador', 'Apple', 2021),
('MacBook Pro 14" (M1 Pro/Max)', 'Computador', 'Apple', 2021),
('MacBook Pro 16" (M1 Pro/Max)', 'Computador', 'Apple', 2021),
('Mac Studio (M1 Max/Ultra)', 'Computador', 'Apple', 2022),
('MacBook Air (M2)', 'Computador', 'Apple', 2022),
('MacBook Pro 13" (M2)', 'Computador', 'Apple', 2022),
('Mac mini (M2)', 'Computador', 'Apple', 2023),
('MacBook Pro 14" (M2 Pro/Max)', 'Computador', 'Apple', 2023),
('MacBook Pro 16" (M2 Pro/Max)', 'Computador', 'Apple', 2023),
('Mac Studio (M2 Max/Ultra)', 'Computador', 'Apple', 2023),
('iMac 24" (M3)', 'Computador', 'Apple', 2023),
('MacBook Pro 14" (M3)', 'Computador', 'Apple', 2023),
('MacBook Pro 16" (M3)', 'Computador', 'Apple', 2023),
('MacBook Air 13" (M3)', 'Computador', 'Apple', 2024),
('MacBook Air 15" (M3)', 'Computador', 'Apple', 2024),
('Mac mini (M4)', 'Computador', 'Apple', 2024)
ON CONFLICT (name) DO NOTHING;

-- Verificar quantos foram inseridos
SELECT COUNT(*) as total_inserido FROM public.product_catalog WHERE deleted_at IS NULL;

-- Ver distribuição por tipo
SELECT type, COUNT(*) as quantidade 
FROM public.product_catalog 
WHERE deleted_at IS NULL
GROUP BY type 
ORDER BY type;
