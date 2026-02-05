-- Add detailed address fields to profiles table

DO $$ 
BEGIN
  -- Add city if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN city TEXT;
  END IF;

  -- Add state if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'state'
  ) THEN
    ALTER TABLE profiles ADD COLUMN state TEXT;
  END IF;

  -- Add country if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'country'
  ) THEN
    ALTER TABLE profiles ADD COLUMN country TEXT;
  END IF;

  -- Add postal_code if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN postal_code TEXT;
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN profiles.city IS 'City name';
COMMENT ON COLUMN profiles.state IS 'State or province';
COMMENT ON COLUMN profiles.country IS 'Country name';
COMMENT ON COLUMN profiles.postal_code IS 'ZIP code, CEP, or postal code';

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('address', 'city', 'state', 'country', 'postal_code')
ORDER BY column_name;
