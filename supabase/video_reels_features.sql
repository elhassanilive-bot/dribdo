-- Video/Reels production schema additions for Dribdo Web

create table if not exists public.video_analytics_events (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  user_id uuid null,
  event_type text not null,
  watch_seconds integer not null default 0,
  session_id text null,
  user_agent text null,
  page_path text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_video_analytics_post_id on public.video_analytics_events(post_id);
create index if not exists idx_video_analytics_created_at on public.video_analytics_events(created_at desc);
create index if not exists idx_video_analytics_event_type on public.video_analytics_events(event_type);

create table if not exists public.saved_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  post_id uuid not null,
  created_at timestamptz not null default now(),
  unique(user_id, post_id)
);

create index if not exists idx_saved_posts_user_id on public.saved_posts(user_id);
create index if not exists idx_saved_posts_post_id on public.saved_posts(post_id);

alter table public.video_analytics_events enable row level security;
alter table public.saved_posts enable row level security;

-- saved_posts policies
DROP POLICY IF EXISTS saved_posts_select_own ON public.saved_posts;
create policy saved_posts_select_own
on public.saved_posts
for select
using (auth.uid() = user_id);

DROP POLICY IF EXISTS saved_posts_insert_own ON public.saved_posts;
create policy saved_posts_insert_own
on public.saved_posts
for insert
with check (auth.uid() = user_id);

DROP POLICY IF EXISTS saved_posts_delete_own ON public.saved_posts;
create policy saved_posts_delete_own
on public.saved_posts
for delete
using (auth.uid() = user_id);

-- No public read/write for analytics table from anon/auth clients
DROP POLICY IF EXISTS video_analytics_no_client_select ON public.video_analytics_events;
create policy video_analytics_no_client_select
on public.video_analytics_events
for select
using (false);

DROP POLICY IF EXISTS video_analytics_no_client_insert ON public.video_analytics_events;
create policy video_analytics_no_client_insert
on public.video_analytics_events
for insert
with check (false);

DROP POLICY IF EXISTS video_analytics_no_client_update ON public.video_analytics_events;
create policy video_analytics_no_client_update
on public.video_analytics_events
for update
using (false)
with check (false);

DROP POLICY IF EXISTS video_analytics_no_client_delete ON public.video_analytics_events;
create policy video_analytics_no_client_delete
on public.video_analytics_events
for delete
using (false);
