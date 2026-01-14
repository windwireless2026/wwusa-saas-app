-- Add unique constraint to estimate_number to prevent repetitions
ALTER TABLE public.estimates ADD CONSTRAINT unique_estimate_number UNIQUE (estimate_number);

-- Restart sequence to start from 1234
ALTER SEQUENCE estimates_estimate_number_seq RESTART WITH 1234;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
