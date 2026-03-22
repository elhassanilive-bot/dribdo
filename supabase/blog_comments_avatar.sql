-- Add avatar URL support for blog/forum comments
-- Run in Supabase SQL editor

alter table public.blog_post_comments
  add column if not exists author_avatar_url text;

create index if not exists blog_post_comments_post_id_created_at_idx
  on public.blog_post_comments (post_id, created_at desc);
