-- Moments assets policies
-- Run this after blog_schema.sql + forum_user_features.sql

-- Allow reading assets for published posts
alter table public.blog_post_assets enable row level security;

drop policy if exists blog_assets_read_published on public.blog_post_assets;
create policy blog_assets_read_published
on public.blog_post_assets
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.blog_posts p
    where p.id = blog_post_assets.post_id
      and p.status = 'published'
  )
);

-- Allow authenticated users to insert media assets only for their own forum posts
-- This is needed for Moments image/video publishing.
drop policy if exists blog_post_assets_forum_insert_own on public.blog_post_assets;
create policy blog_post_assets_forum_insert_own
on public.blog_post_assets
for insert
to authenticated
with check (
  exists (
    select 1
    from public.blog_posts p
    where p.id = blog_post_assets.post_id
      and p.category = 'forum'
      and p.author_user_id = auth.uid()
  )
);

-- Allow owners to update/delete their own forum assets
drop policy if exists blog_post_assets_forum_update_own on public.blog_post_assets;
create policy blog_post_assets_forum_update_own
on public.blog_post_assets
for update
to authenticated
using (
  exists (
    select 1
    from public.blog_posts p
    where p.id = blog_post_assets.post_id
      and p.category = 'forum'
      and p.author_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.blog_posts p
    where p.id = blog_post_assets.post_id
      and p.category = 'forum'
      and p.author_user_id = auth.uid()
  )
);

drop policy if exists blog_post_assets_forum_delete_own on public.blog_post_assets;
create policy blog_post_assets_forum_delete_own
on public.blog_post_assets
for delete
to authenticated
using (
  exists (
    select 1
    from public.blog_posts p
    where p.id = blog_post_assets.post_id
      and p.category = 'forum'
      and p.author_user_id = auth.uid()
  )
);
