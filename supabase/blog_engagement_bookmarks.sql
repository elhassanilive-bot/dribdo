-- Post engagement (views + likes) and reading list (bookmarks)
-- شغّل هذا الملف بعد blog_schema.sql و blog_auth_comments.sql

-- 1) Views counter (simple aggregate column)
alter table public.blog_posts
  add column if not exists view_count bigint not null default 0;

create index if not exists blog_posts_view_count_idx
  on public.blog_posts (view_count desc);

-- SECURITY DEFINER: allow incrementing views from anon/authenticated without opening update policies.
create or replace function public.increment_post_view(post_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only for published posts
  update public.blog_posts
  set view_count = view_count + 1
  where slug = post_slug
    and status::text = 'published';
end;
$$;

grant execute on function public.increment_post_view(text) to anon, authenticated;

-- 2) Post reactions (likes)
create table if not exists public.blog_post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists blog_post_reactions_post_id_idx
  on public.blog_post_reactions (post_id, reaction_type, created_at desc);

create index if not exists blog_post_reactions_user_id_idx
  on public.blog_post_reactions (user_id, created_at desc);

drop trigger if exists blog_post_reactions_set_updated_at on public.blog_post_reactions;
create trigger blog_post_reactions_set_updated_at
before update on public.blog_post_reactions
for each row execute function public.set_updated_at();

alter table public.blog_post_reactions enable row level security;

drop policy if exists blog_post_reactions_select_public on public.blog_post_reactions;
create policy blog_post_reactions_select_public
on public.blog_post_reactions
for select
to anon, authenticated
using (true);

drop policy if exists blog_post_reactions_insert_own on public.blog_post_reactions;
create policy blog_post_reactions_insert_own
on public.blog_post_reactions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists blog_post_reactions_delete_own on public.blog_post_reactions;
create policy blog_post_reactions_delete_own
on public.blog_post_reactions
for delete
to authenticated
using (auth.uid() = user_id);

-- 3) Reading list (bookmarks) with optional folders
create table if not exists public.blog_post_bookmarks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  folder text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists blog_post_bookmarks_user_id_idx
  on public.blog_post_bookmarks (user_id, created_at desc);

create index if not exists blog_post_bookmarks_user_folder_idx
  on public.blog_post_bookmarks (user_id, folder, created_at desc);

drop trigger if exists blog_post_bookmarks_set_updated_at on public.blog_post_bookmarks;
create trigger blog_post_bookmarks_set_updated_at
before update on public.blog_post_bookmarks
for each row execute function public.set_updated_at();

alter table public.blog_post_bookmarks enable row level security;

drop policy if exists blog_post_bookmarks_select_own on public.blog_post_bookmarks;
create policy blog_post_bookmarks_select_own
on public.blog_post_bookmarks
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists blog_post_bookmarks_insert_own on public.blog_post_bookmarks;
create policy blog_post_bookmarks_insert_own
on public.blog_post_bookmarks
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists blog_post_bookmarks_update_own on public.blog_post_bookmarks;
create policy blog_post_bookmarks_update_own
on public.blog_post_bookmarks
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists blog_post_bookmarks_delete_own on public.blog_post_bookmarks;
create policy blog_post_bookmarks_delete_own
on public.blog_post_bookmarks
for delete
to authenticated
using (auth.uid() = user_id);

-- 4) Dashboard stats (for account page)
create or replace function public.get_my_dashboard_stats()
returns table (
  published_count bigint,
  pending_count bigint,
  rejected_count bigint,
  total_views bigint,
  total_likes bigint,
  total_comments_received bigint,
  my_comments_count bigint,
  my_bookmarks_count bigint
)
language sql
security definer
set search_path = public
as $$
  with my_posts as (
    select id, status::text as status_text, coalesce(view_count, 0) as view_count
    from public.blog_posts
    where author_user_id = auth.uid()
  ),
  my_post_counts as (
    select
      sum(case when status_text = 'published' then 1 else 0 end) as published_count,
      sum(case when status_text = 'pending' then 1 else 0 end) as pending_count,
      sum(case when status_text = 'rejected' then 1 else 0 end) as rejected_count,
      sum(view_count) as total_views
    from my_posts
  ),
  likes as (
    select count(*)::bigint as total_likes
    from public.blog_post_reactions r
    join my_posts p on p.id = r.post_id
    where r.reaction_type = 'like'
  ),
  comments_received as (
    select count(*)::bigint as total_comments_received
    from public.blog_comments c
    join my_posts p on p.id = c.post_id
    where c.status = 'published'
  ),
  my_comments as (
    select count(*)::bigint as my_comments_count
    from public.blog_comments
    where user_id = auth.uid()
      and status = 'published'
  ),
  my_bookmarks as (
    select count(*)::bigint as my_bookmarks_count
    from public.blog_post_bookmarks
    where user_id = auth.uid()
  )
  select
    coalesce(pc.published_count, 0)::bigint,
    coalesce(pc.pending_count, 0)::bigint,
    coalesce(pc.rejected_count, 0)::bigint,
    coalesce(pc.total_views, 0)::bigint,
    coalesce(l.total_likes, 0)::bigint,
    coalesce(cr.total_comments_received, 0)::bigint,
    coalesce(mc.my_comments_count, 0)::bigint,
    coalesce(mb.my_bookmarks_count, 0)::bigint
  from my_post_counts pc
  cross join likes l
  cross join comments_received cr
  cross join my_comments mc
  cross join my_bookmarks mb;
$$;

grant execute on function public.get_my_dashboard_stats() to authenticated;

-- 5) Public engagement counters (safe aggregates for UI)
-- Expose only counts (no rows) to anon/authenticated.
create or replace function public.get_post_bookmark_count(post_slug text)
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.blog_post_bookmarks b
  join public.blog_posts p on p.id = b.post_id
  where p.slug = post_slug
    and p.status::text = 'published';
$$;

grant execute on function public.get_post_bookmark_count(text) to anon, authenticated;
