-- Advanced blog features migration (views + workflow support)
-- Run in Supabase SQL editor after blog_schema.sql

create table if not exists public.blog_post_views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  viewer_id text not null,
  viewed_at timestamptz not null default timezone('utc', now()),
  unique (post_id, viewer_id)
);

create index if not exists blog_post_views_post_id_idx on public.blog_post_views(post_id);
create index if not exists blog_post_views_viewed_at_idx on public.blog_post_views(viewed_at desc);

alter table public.blog_post_views enable row level security;

drop policy if exists blog_post_views_insert_public on public.blog_post_views;
create policy blog_post_views_insert_public
on public.blog_post_views
for insert
to anon, authenticated
with check (true);

drop policy if exists blog_post_views_read_service on public.blog_post_views;
create policy blog_post_views_read_service
on public.blog_post_views
for select
to authenticated
using (true);
