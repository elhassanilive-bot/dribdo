-- Restrict forum/blog comments write operations to authenticated users only
-- Run this in Supabase SQL editor after blog_interactions.sql

alter table public.blog_post_comments enable row level security;

-- Remove permissive TEMP policies if present
drop policy if exists blog_comments_insert_temp on public.blog_post_comments;
drop policy if exists blog_comments_update_temp on public.blog_post_comments;
drop policy if exists blog_comments_delete_temp on public.blog_post_comments;

-- Authenticated users can add comments only as themselves
drop policy if exists blog_comments_insert_auth_only on public.blog_post_comments;
create policy blog_comments_insert_auth_only
on public.blog_post_comments
for insert
to authenticated
with check (
  auth.uid() is not null
  and user_id = auth.uid()
  and coalesce(length(trim(content)), 0) > 0
);

-- Users can edit only their own comments
drop policy if exists blog_comments_update_own on public.blog_post_comments;
create policy blog_comments_update_own
on public.blog_post_comments
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Users can delete only their own comments
drop policy if exists blog_comments_delete_own on public.blog_post_comments;
create policy blog_comments_delete_own
on public.blog_post_comments
for delete
to authenticated
using (user_id = auth.uid());
