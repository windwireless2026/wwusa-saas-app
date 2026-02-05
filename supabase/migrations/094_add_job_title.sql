-- Add job_title field to profiles table

DO $$ 
BEGIN
  -- Add job_title if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'job_title'
  ) THEN
    ALTER TABLE profiles ADD COLUMN job_title TEXT;
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN profiles.job_title IS 'Job title or position';

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name = 'job_title';
