-- Add phone fields to profiles table

-- Check if columns exist first
DO $$ 
BEGIN
  -- Add phone_country_code if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone_country_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_country_code TEXT DEFAULT '+1';
  END IF;

  -- Add phone_number if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number TEXT;
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN profiles.phone_country_code IS 'International dialing code (e.g., +1, +55)';
COMMENT ON COLUMN profiles.phone_number IS 'Phone number formatted according to country code';

-- Verify
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('phone_country_code', 'phone_number')
ORDER BY column_name;
