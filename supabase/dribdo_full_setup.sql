-- Dribdo Supabase Full Setup (Blog + Storage + Interactions)
-- Run this file in Supabase SQL Editor after each update.
-- It is safe to re-run (uses IF NOT EXISTS / DROP POLICY where needed).

-- =========================
-- Blog Schema
-- =========================

-- Extensions
create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type public.blog_post_status as enum ('draft','published','archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.blog_asset_type as enum ('image','video','audio','document','embed','link');
exception when duplicate_object then null;
end $$;

-- Main posts table
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content text not null,
  content_blocks jsonb,
  cover_image_url text,
  category text,
  tags text[] not null default '{}'::text[],
  status public.blog_post_status not null default 'draft',
  published_at timestamptz,
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts
  add column if not exists view_count int not null default 0;

create index if not exists blog_posts_status_published_at_idx
  on public.blog_posts (status, published_at desc);

create index if not exists blog_posts_created_at_idx
  on public.blog_posts (created_at desc);

create index if not exists blog_posts_tags_gin_idx
  on public.blog_posts using gin (tags);

-- Assets table
create table if not exists public.blog_post_assets (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  type public.blog_asset_type not null,
  title text,
  url text not null,
  meta jsonb not null default '{}'::jsonb,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists blog_post_assets_post_id_pos_idx
  on public.blog_post_assets (post_id, position);

-- Links table
create table if not exists public.blog_post_links (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  label text,
  url text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists blog_post_links_post_id_pos_idx
  on public.blog_post_links (post_id, position);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

-- Increment views via RPC
create or replace function public.increment_blog_post_views(p_post_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count int;
begin
  update public.blog_posts
  set view_count = view_count + 1
  where id = p_post_id and status = 'published'
  returning view_count into new_count;

  return coalesce(new_count, 0);
end;
$$;

grant execute on function public.increment_blog_post_views(uuid) to anon, authenticated;

-- RLS
alter table public.blog_posts enable row level security;
alter table public.blog_post_assets enable row level security;
alter table public.blog_post_links enable row level security;

-- Public read
drop policy if exists blog_posts_read_published on public.blog_posts;
create policy blog_posts_read_published
on public.blog_posts
for select
to anon, authenticated
using (status = 'published');

drop policy if exists blog_assets_read_published on public.blog_post_assets;
create policy blog_assets_read_published
on public.blog_post_assets
for select
to anon, authenticated
using (
  exists (
    select 1 from public.blog_posts p
    where p.id = blog_post_assets.post_id and p.status = 'published'
  )
);

drop policy if exists blog_links_read_published on public.blog_post_links;
create policy blog_links_read_published
on public.blog_post_links
for select
to anon, authenticated
using (
  exists (
    select 1 from public.blog_posts p
    where p.id = blog_post_links.post_id and p.status = 'published'
  )
);

-- =========================
-- Blog Storage (media)
-- =========================

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

-- =========================
-- Interactions (comments + reactions)
-- =========================

create table if not exists public.blog_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  parent_id uuid references public.blog_post_comments(id) on delete cascade,
  session_id text not null default '',
  user_id uuid,
  author_name text not null,
  content text not null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.blog_post_comments
  add column if not exists user_id uuid;

alter table public.blog_post_comments
  add column if not exists is_hidden boolean not null default false;

alter table public.blog_post_comments
  add column if not exists session_id text not null default '';

alter table public.blog_post_comments
  add column if not exists parent_id uuid references public.blog_post_comments(id) on delete cascade;

create index if not exists blog_post_comments_post_id_created_at_idx
  on public.blog_post_comments (post_id, created_at desc);

create index if not exists blog_post_comments_parent_id_idx
  on public.blog_post_comments (parent_id);

create table if not exists public.blog_post_comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.blog_post_comments(id) on delete cascade,
  session_id text not null default '',
  reason text not null,
  details text,
  created_at timestamptz not null default now()
);

create index if not exists blog_post_comment_reports_comment_id_idx
  on public.blog_post_comment_reports (comment_id);

create table if not exists public.blog_post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  session_id text not null,
  reaction text not null check (reaction in ('like','dislike')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists blog_post_reactions_unique
  on public.blog_post_reactions (post_id, session_id);

drop trigger if exists blog_post_reactions_set_updated_at on public.blog_post_reactions;
create trigger blog_post_reactions_set_updated_at
before update on public.blog_post_reactions
for each row execute function public.set_updated_at();

-- RLS
alter table public.blog_post_comments enable row level security;
alter table public.blog_post_comment_reports enable row level security;
alter table public.blog_post_reactions enable row level security;

-- Public read
drop policy if exists blog_comments_read_published on public.blog_post_comments;
create policy blog_comments_read_published
on public.blog_post_comments
for select
to anon, authenticated
using (
  exists (
    select 1 from public.blog_posts p
    where p.id = blog_post_comments.post_id and p.status = 'published'
  ) and blog_post_comments.is_hidden = false
  and (
    select count(*) from public.blog_post_comment_reports r
    where r.comment_id = blog_post_comments.id
  ) < 3
);

drop policy if exists blog_reactions_read_published on public.blog_post_reactions;
create policy blog_reactions_read_published
on public.blog_post_reactions
for select
to anon, authenticated
using (
  exists (
    select 1 from public.blog_posts p
    where p.id = blog_post_reactions.post_id and p.status = 'published'
  )
);

drop policy if exists blog_comment_reports_read_none on public.blog_post_comment_reports;
create policy blog_comment_reports_read_none
on public.blog_post_comment_reports
for select
to anon, authenticated
using (false);

-- TEMP: allow reading reports without service role (DEV ONLY)
drop policy if exists blog_comment_reports_read_temp on public.blog_post_comment_reports;
create policy blog_comment_reports_read_temp
on public.blog_post_comment_reports
for select
to anon, authenticated
using (true);

-- TEMP write policies (DEV ONLY)
drop policy if exists blog_comments_insert_temp on public.blog_post_comments;
create policy blog_comments_insert_temp
on public.blog_post_comments
for insert
to anon, authenticated
with check (true);

drop policy if exists blog_comments_update_temp on public.blog_post_comments;
create policy blog_comments_update_temp
on public.blog_post_comments
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists blog_comments_delete_temp on public.blog_post_comments;
create policy blog_comments_delete_temp
on public.blog_post_comments
for delete
to anon, authenticated
using (true);

drop policy if exists blog_reactions_insert_temp on public.blog_post_reactions;
create policy blog_reactions_insert_temp
on public.blog_post_reactions
for insert
to anon, authenticated
with check (true);

drop policy if exists blog_reactions_update_temp on public.blog_post_reactions;
create policy blog_reactions_update_temp
on public.blog_post_reactions
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists blog_reactions_delete_temp on public.blog_post_reactions;
create policy blog_reactions_delete_temp
on public.blog_post_reactions
for delete
to anon, authenticated
using (true);

drop policy if exists blog_comment_reports_insert_temp on public.blog_post_comment_reports;
create policy blog_comment_reports_insert_temp
on public.blog_post_comment_reports
for insert
to anon, authenticated
with check (true);

-- Views
create or replace view public.blog_post_comment_counts as
select post_id, count(*)::int as comment_count
from public.blog_post_comments
where is_hidden = false
  and (
    select count(*) from public.blog_post_comment_reports r
    where r.comment_id = blog_post_comments.id
  ) < 3
group by post_id;

create or replace view public.blog_post_comment_report_counts as
select comment_id, count(*)::int as report_count
from public.blog_post_comment_reports
group by comment_id;
