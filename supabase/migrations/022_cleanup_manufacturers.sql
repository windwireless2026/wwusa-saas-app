-- 1. Atualiza os logos para os arquivos locais na pasta public/images/icon/
update public.manufacturers set logo_url = '/images/icon/google.png' where name = 'Google';
update public.manufacturers set logo_url = '/images/icon/motorola.png' where name = 'Motorola';
update public.manufacturers set logo_url = '/images/icon/xiaomi.png' where name = 'Xiaomi';
update public.manufacturers set logo_url = '/images/icon/nokia.png' where name = 'Nokia (HMD)';
update public.manufacturers set logo_url = '/images/icon/sony.png' where name = 'Sony';
update public.manufacturers set logo_url = '/images/icon/asus.png' where name = 'ASUS';

-- 2. Deleta permanentemente os fabricantes solicitados
delete from public.manufacturers 
where name in (
    'AT&T (Radiant/Calypso)',
    'CAT',
    'Kyocera',
    'Nothing',
    'OnePlus',
    'Sonim',
    'T-Mobile (REVVL)',
    'TCL',
    'ZTE',
    'Verizon (Orbic)'
);
