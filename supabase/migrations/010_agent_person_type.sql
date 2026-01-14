-- Migration to add Person Type and Regulatory Document tracking
alter table public.agents 
    add column if not exists person_type text check (person_type in ('individual', 'entity')), -- PF or PJ
    add column if not exists regulatory_doc_status boolean default false;

comment on column public.agents.person_type is 'individual (PF) or entity (PJ)';
comment on column public.agents.regulatory_doc_status is 'Whether the regulatory document (W8/W9) has been received';
