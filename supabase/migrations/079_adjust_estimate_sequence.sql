-- Adjust estimate sequence to start from 2283 as requested by user
-- This ensures the next created estimate will have the number 2283

SELECT setval('estimates_estimate_number_seq', 2282, false);

-- If the above fails due to permissions in some environments, we can also use:
-- ALTER SEQUENCE estimates_estimate_number_seq RESTART WITH 2283;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
