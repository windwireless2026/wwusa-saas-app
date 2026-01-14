-- Add columns for document URLs
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS regulatory_doc_url text,
ADD COLUMN IF NOT EXISTS resale_certificate_url text;

-- Create storage bucket for agent documents if it doesn't exist
-- Note: This usually needs to be done via Supabase dashboard or API, 
-- but we can provide the SQL for reference if the user has management permissions.
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('agent-documents', 'agent-documents', false)
-- ON CONFLICT (id) DO NOTHING;
