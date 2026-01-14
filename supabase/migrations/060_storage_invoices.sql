-- Create a new storage bucket for invoice attachments
insert into storage.buckets (id, name, public) 
values ('invoice-attachments', 'invoice-attachments', true)
on conflict (id) do nothing;

-- Allow public access to read files
create policy "Public Access Invoices"
on storage.objects for select
using ( bucket_id = 'invoice-attachments' );

-- Allow authenticated users to upload files
create policy "Allow Uploads Invoices"
on storage.objects for insert
with check ( bucket_id = 'invoice-attachments' );

-- Allow update/delete (for dev simplicity, using same as agent docs)
create policy "Allow Update Invoices"
on storage.objects for update
using ( bucket_id = 'invoice-attachments' );

create policy "Allow Delete Invoices"
on storage.objects for delete
using ( bucket_id = 'invoice-attachments' );
