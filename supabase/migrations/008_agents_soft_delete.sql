-- Add soft delete support to agents table
alter table public.agents 
    add column if not exists deleted_at timestamptz default null;

-- Optimization: index for filtering active agents
create index if not exists idx_agents_not_deleted on public.agents (id) where deleted_at is null;

comment on column public.agents.deleted_at is 'Soft delete timestamp. If populated, agent is in "Trash".';
