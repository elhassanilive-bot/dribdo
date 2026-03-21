-- Blog interactions (comments + reactions) - DEV policies included

create table if not exists public.blog_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  session_id text not null default '',
  user_id uuid,
  author_name text not null,
  content text not null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

-- Ensure new columns exist when table was created previously
alter table public.blog_post_comments
  add column if not exists user_id uuid;

alter table public.blog_post_comments
  add column if not exists is_hidden boolean not null default false;

create index if not exists blog_post_comments_post_id_created_at_idx
  on public.blog_post_comments (post_id, created_at desc);

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

-- updated_at trigger for reactions
drop trigger if exists blog_post_reactions_set_updated_at on public.blog_post_reactions;
create trigger blog_post_reactions_set_updated_at
before update on public.blog_post_reactions
for each row execute function public.set_updated_at();

-- RLS
alter table public.blog_post_comments enable row level security;
alter table public.blog_post_comment_reports enable row level security;
alter table public.blog_post_reactions enable row level security;

-- Public read: comments/reactions only for published posts
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

-- View for comment counts
create or replace view public.blog_post_comment_counts as
select post_id, count(*)::int as comment_count
from public.blog_post_comments
where is_hidden = false
  and (
    select count(*) from public.blog_post_comment_reports r
    where r.comment_id = blog_post_comments.id
  ) < 3
group by post_id;

-- View for report counts
create or replace view public.blog_post_comment_report_counts as
select comment_id, count(*)::int as report_count
from public.blog_post_comment_reports
group by comment_id;
