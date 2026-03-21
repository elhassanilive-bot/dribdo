-- Blog media storage setup (DEV / public uploads)
-- Creates a public bucket for article media and allows uploads/reads.
-- Review these policies before production use.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-media',
  'blog-media',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'application/pdf'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "blog media public read" on storage.objects;
create policy "blog media public read"
on storage.objects
for select
to public
using (bucket_id = 'blog-media');

drop policy if exists "blog media public upload" on storage.objects;
create policy "blog media public upload"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'blog-media');

drop policy if exists "blog media public update" on storage.objects;
create policy "blog media public update"
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'blog-media')
with check (bucket_id = 'blog-media');

drop policy if exists "blog media public delete" on storage.objects;
create policy "blog media public delete"
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'blog-media');
