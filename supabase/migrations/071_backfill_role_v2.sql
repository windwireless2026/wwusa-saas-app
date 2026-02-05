UPDATE public.profiles
SET role_v2 = 'socio'
WHERE role_v2 IS NULL
  AND role = 'admin';

UPDATE public.profiles
SET role_v2 = 'operacional'
WHERE role_v2 IS NULL
  AND role IN ('manager', 'operator');

UPDATE public.profiles
SET role_v2 = 'cliente'
WHERE role_v2 IS NULL
  AND role = 'viewer';