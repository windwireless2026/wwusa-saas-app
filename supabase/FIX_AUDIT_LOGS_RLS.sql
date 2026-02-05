-- Fix RLS policies for audit_logs table
-- Users need to be able to insert their own audit logs

-- Enable RLS if not already enabled
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert their own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow authenticated users to insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow authenticated users to view audit logs" ON audit_logs;

-- Create clean policies
-- Allow authenticated users to INSERT their own audit logs
CREATE POLICY "Allow authenticated users to insert audit logs"
ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to SELECT their own audit logs
CREATE POLICY "Allow authenticated users to view audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
