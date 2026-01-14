-- Create a new storage bucket for agent documents
insert into storage.buckets (id, name, public) 
values ('agent-documents', 'agent-documents', true);

-- Allow public access to read files
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'agent-documents' );

-- Allow authenticated users to upload files
create policy "Allow Uploads"
on storage.objects for insert
with check ( bucket_id = 'agent-documents' );
