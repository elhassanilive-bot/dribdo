-- Profile avatars storage setup
-- Run in Supabase SQL editor

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  2097152,
  array['image/jpeg','image/png','image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for avatars
drop policy if exists "profile avatars public read" on storage.objects;
create policy "profile avatars public read"
on storage.objects
for select
to public
using (bucket_id = 'profile-avatars');

-- Authenticated users upload only in their own folder: <uid>/...
drop policy if exists "profile avatars upload own" on storage.objects;
create policy "profile avatars upload own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Optional update/delete of own files
drop policy if exists "profile avatars update own" on storage.objects;
create policy "profile avatars update own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-avatars'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'profile-avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "profile avatars delete own" on storage.objects;
create policy "profile avatars delete own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);
