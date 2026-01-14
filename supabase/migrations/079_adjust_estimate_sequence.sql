-- Adjust estimate number sequence to start from 2283 as requested
ALTER SEQUENCE estimates_estimate_number_seq RESTART WITH 2283;

NOTIFY pgrst, 'reload schema';
