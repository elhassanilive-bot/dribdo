-- Auth, profiles, avatars, and article comments
-- شغّل هذا الملف بعد blog_schema.sql و blog_categories_hierarchy.sql

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  parent_comment_id uuid references public.blog_comments (id) on delete cascade,
  content text not null,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_comments_content_check check (char_length(trim(content)) >= 2)
);

alter table public.blog_comments
  add column if not exists parent_comment_id uuid references public.blog_comments (id) on delete cascade;

create table if not exists public.blog_comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.blog_comments (id) on delete cascade,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

create index if not exists user_profiles_display_name_idx
  on public.user_profiles (display_name);

create index if not exists blog_comments_post_id_idx
  on public.blog_comments (post_id, created_at desc);

create index if not exists blog_comments_user_id_idx
  on public.blog_comments (user_id, created_at desc);

create index if not exists blog_comments_parent_comment_id_idx
  on public.blog_comments (parent_comment_id, created_at desc);

create index if not exists blog_comment_reactions_comment_id_idx
  on public.blog_comment_reactions (comment_id, reaction_type);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

drop trigger if exists blog_comments_set_updated_at on public.blog_comments;
create trigger blog_comments_set_updated_at
before update on public.blog_comments
for each row execute function public.set_updated_at();

drop trigger if exists blog_comment_reactions_set_updated_at on public.blog_comment_reactions;
create trigger blog_comment_reactions_set_updated_at
before update on public.blog_comment_reactions
for each row execute function public.set_updated_at();

alter table public.user_profiles enable row level security;
alter table public.blog_comments enable row level security;
alter table public.blog_comment_reactions enable row level security;

drop policy if exists user_profiles_select_public on public.user_profiles;
create policy user_profiles_select_public
on public.user_profiles
for select
to anon, authenticated
using (true);

drop policy if exists user_profiles_insert_own on public.user_profiles;
create policy user_profiles_insert_own
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists user_profiles_update_own on public.user_profiles;
create policy user_profiles_update_own
on public.user_profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists blog_comments_select_public on public.blog_comments;
create policy blog_comments_select_public
on public.blog_comments
for select
to anon, authenticated
using (status = 'published');

drop policy if exists blog_comments_insert_own on public.blog_comments;
create policy blog_comments_insert_own
on public.blog_comments
for insert
to authenticated
with check (auth.uid() = user_id and status = 'published');

drop policy if exists blog_comments_update_own on public.blog_comments;
create policy blog_comments_update_own
on public.blog_comments
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists blog_comments_delete_own on public.blog_comments;
create policy blog_comments_delete_own
on public.blog_comments
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists blog_comment_reactions_select_public on public.blog_comment_reactions;
create policy blog_comment_reactions_select_public
on public.blog_comment_reactions
for select
to anon, authenticated
using (true);

drop policy if exists blog_comment_reactions_insert_own on public.blog_comment_reactions;
create policy blog_comment_reactions_insert_own
on public.blog_comment_reactions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists blog_comment_reactions_update_own on public.blog_comment_reactions;
create policy blog_comment_reactions_update_own
on public.blog_comment_reactions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists blog_comment_reactions_delete_own on public.blog_comment_reactions;
create policy blog_comment_reactions_delete_own
on public.blog_comment_reactions
for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update
set public = true;

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'avatars');

drop policy if exists avatars_authenticated_upload on storage.objects;
create policy avatars_authenticated_upload
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists avatars_authenticated_update on storage.objects;
create policy avatars_authenticated_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists avatars_authenticated_delete on storage.objects;
create policy avatars_authenticated_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);
