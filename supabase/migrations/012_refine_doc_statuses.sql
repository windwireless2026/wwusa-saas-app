-- Refine status columns for regulatory documents and resale certificates
-- Changes 'regulatory_doc_status' from boolean to text to allow 'pending', 'received', 'waived'
-- Does the same for 'has_resale_certificate' (converting to 'resale_certificate_status')

alter table public.agents drop column if exists regulatory_doc_status;
alter table public.agents add column regulatory_doc_status text default 'pending' check (regulatory_doc_status in ('pending', 'received', 'waived'));

alter table public.agents drop column if exists has_resale_certificate;
alter table public.agents add column resale_certificate_status text default 'pending' check (resale_certificate_status in ('pending', 'received', 'waived', 'na'));

comment on column public.agents.regulatory_doc_status is 'Status of W8/W9: pending, received, or waived';
comment on column public.agents.resale_certificate_status is 'Status of Resale Certificate for US Customers: pending, received, waived, or na (not applicable)';
