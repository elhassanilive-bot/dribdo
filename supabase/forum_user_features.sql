-- Forum ownership + comment reactions (production-safe)
-- Run this after blog_schema.sql + blog_interactions.sql

-- 1) Post ownership columns
alter table public.blog_posts
  add column if not exists author_user_id uuid;

alter table public.blog_posts
  add column if not exists author_name text;

create index if not exists blog_posts_author_user_id_idx
  on public.blog_posts (author_user_id);

-- 2) Tighten forum publishing policies (remove wide-open temp policies)
drop policy if exists blog_posts_insert_temp on public.blog_posts;
drop policy if exists blog_posts_update_temp on public.blog_posts;
drop policy if exists blog_posts_delete_temp on public.blog_posts;

-- Allow authenticated users to create forum posts as themselves
drop policy if exists blog_posts_forum_insert_own on public.blog_posts;
create policy blog_posts_forum_insert_own
on public.blog_posts
for insert
to authenticated
with check (
  category = 'forum'
  and author_user_id = auth.uid()
);

-- Allow authenticated users to update only their own forum posts
drop policy if exists blog_posts_forum_update_own on public.blog_posts;
create policy blog_posts_forum_update_own
on public.blog_posts
for update
to authenticated
using (
  category = 'forum'
  and author_user_id = auth.uid()
)
with check (
  category = 'forum'
  and author_user_id = auth.uid()
);

-- Allow authenticated users to delete only their own forum posts
drop policy if exists blog_posts_forum_delete_own on public.blog_posts;
create policy blog_posts_forum_delete_own
on public.blog_posts
for delete
to authenticated
using (
  category = 'forum'
  and author_user_id = auth.uid()
);

-- 3) Comment reactions table
create table if not exists public.blog_comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.blog_post_comments(id) on delete cascade,
  session_id text not null,
  reaction text not null check (reaction in ('like','dislike')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (comment_id, session_id)
);

create index if not exists blog_comment_reactions_comment_id_idx
  on public.blog_comment_reactions (comment_id);

create index if not exists blog_comment_reactions_session_id_idx
  on public.blog_comment_reactions (session_id);

alter table public.blog_comment_reactions enable row level security;

drop trigger if exists blog_comment_reactions_set_updated_at on public.blog_comment_reactions;
create trigger blog_comment_reactions_set_updated_at
before update on public.blog_comment_reactions
for each row execute function public.set_updated_at();

-- Public read reactions on visible comments
drop policy if exists blog_comment_reactions_read_published on public.blog_comment_reactions;
create policy blog_comment_reactions_read_published
on public.blog_comment_reactions
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.blog_post_comments c
    join public.blog_posts p on p.id = c.post_id
    where c.id = blog_comment_reactions.comment_id
      and p.status = 'published'
      and c.is_hidden = false
  )
);

-- Write by authenticated users (session based, one reaction per session)
drop policy if exists blog_comment_reactions_insert_auth on public.blog_comment_reactions;
create policy blog_comment_reactions_insert_auth
on public.blog_comment_reactions
for insert
to authenticated
with check (coalesce(length(session_id), 0) > 0);

drop policy if exists blog_comment_reactions_update_auth on public.blog_comment_reactions;
create policy blog_comment_reactions_update_auth
on public.blog_comment_reactions
for update
to authenticated
using (coalesce(length(session_id), 0) > 0)
with check (coalesce(length(session_id), 0) > 0);

drop policy if exists blog_comment_reactions_delete_auth on public.blog_comment_reactions;
create policy blog_comment_reactions_delete_auth
on public.blog_comment_reactions
for delete
to authenticated
using (coalesce(length(session_id), 0) > 0);
