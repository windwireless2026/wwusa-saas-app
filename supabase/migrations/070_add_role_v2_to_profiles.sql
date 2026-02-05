-- Add role_v2 (transitional unified roles)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role_v2 text;

COMMENT ON COLUMN public.profiles.role_v2 IS 'Unified role (operacional/cliente/socio). Transitional column.';
