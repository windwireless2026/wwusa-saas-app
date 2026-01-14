-- Create agent_documents table for historical tracking
CREATE TABLE IF NOT EXISTS public.agent_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'W-9', 'W-8BEN', 'Resale Certificate', 'ID', 'Other'
    file_url TEXT NOT NULL,
    file_name TEXT,
    reference_year INTEGER, -- For RCs that renew annually
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.agent_documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "agent_documents_all_authenticated" 
ON public.agent_documents FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_documents_agent ON public.agent_documents(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_documents_type ON public.agent_documents(document_type);

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
