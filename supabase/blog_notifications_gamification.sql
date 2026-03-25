-- Notifications + gamification (levels) + weekly challenges
-- شغّل هذا الملف بعد:
-- blog_schema.sql + blog_auth_comments.sql + blog_member_contributors.sql + blog_engagement_bookmarks.sql

-- 1) XP / levels storage (keep it minimal and secure)
alter table public.user_profiles
  add column if not exists total_xp int not null default 0;

create index if not exists user_profiles_total_xp_idx
  on public.user_profiles (total_xp desc);

-- Prevent users from editing total_xp directly (they can still update their profile fields).
drop policy if exists user_profiles_update_own on public.user_profiles;
create policy user_profiles_update_own
on public.user_profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and total_xp = (select up.total_xp from public.user_profiles up where up.id = auth.uid())
);

-- 2) Notifications table
create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  data jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists user_notifications_user_id_idx
  on public.user_notifications (user_id, is_read, created_at desc);

alter table public.user_notifications enable row level security;

drop policy if exists user_notifications_select_own on public.user_notifications;
create policy user_notifications_select_own
on public.user_notifications
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists user_notifications_update_own on public.user_notifications;
create policy user_notifications_update_own
on public.user_notifications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists user_notifications_delete_own on public.user_notifications;
create policy user_notifications_delete_own
on public.user_notifications
for delete
to authenticated
using (auth.uid() = user_id);

-- 3) Helpers (SECURITY DEFINER) for triggers
create or replace function public.add_user_xp(target_user_id uuid, xp_delta int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_user_id is null then
    return;
  end if;

  update public.user_profiles
  set total_xp = greatest(0, coalesce(total_xp, 0) + coalesce(xp_delta, 0))
  where id = target_user_id;
end;
$$;

create or replace function public.notify_user(
  target_user_id uuid,
  notif_type text,
  notif_title text,
  notif_body text,
  notif_data jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_user_id is null then
    return;
  end if;

  insert into public.user_notifications (user_id, type, title, body, data)
  values (target_user_id, coalesce(notif_type, 'info'), coalesce(notif_title, ''), notif_body, coalesce(notif_data, '{}'::jsonb));
end;
$$;

grant execute on function public.add_user_xp(uuid, int) to authenticated;
grant execute on function public.notify_user(uuid, text, text, text, jsonb) to authenticated;

-- 4) Triggers: post review -> notification + XP
create or replace function public.handle_blog_post_review_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_status text;
  new_status text;
begin
  if new.author_user_id is null then
    return null;
  end if;

  old_status := coalesce(old.status::text, '');
  new_status := coalesce(new.status::text, '');

  if old_status = new_status then
    return null;
  end if;

  if new_status = 'published' then
    perform public.add_user_xp(new.author_user_id, 80);
    perform public.notify_user(
      new.author_user_id,
      'post_approved',
      'تم قبول مقالك ونشره',
      coalesce(new.title, ''),
      jsonb_build_object('post_id', new.id, 'post_slug', new.slug)
    );
  elsif new_status = 'rejected' then
    perform public.add_user_xp(new.author_user_id, 10);
    perform public.notify_user(
      new.author_user_id,
      'post_rejected',
      'تم رفض مقالك',
      coalesce(new.review_note, 'يمكنك تعديل المقال وإعادة إرساله للمراجعة.'),
      jsonb_build_object('post_id', new.id, 'post_slug', new.slug)
    );
  end if;

  return null;
end;
$$;

drop trigger if exists blog_posts_review_events on public.blog_posts;
create trigger blog_posts_review_events
after update on public.blog_posts
for each row
execute function public.handle_blog_post_review_events();

-- 5) Triggers: new comment on my post -> notification
create or replace function public.handle_blog_comment_notify_author()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  author_id uuid;
  post_title text;
  post_slug text;
  snippet text;
begin
  select author_user_id, title, slug
  into author_id, post_title, post_slug
  from public.blog_posts
  where id = new.post_id;

  if author_id is null or author_id = new.user_id then
    return null;
  end if;

  snippet := left(trim(coalesce(new.content, '')), 140);

  perform public.notify_user(
    author_id,
    'new_comment',
    'تعليق جديد على مقالك',
    coalesce(post_title, ''),
    jsonb_build_object('post_id', new.post_id, 'post_slug', post_slug, 'comment_id', new.id, 'snippet', snippet)
  );

  return null;
end;
$$;

drop trigger if exists blog_comments_notify_author on public.blog_comments;
create trigger blog_comments_notify_author
after insert on public.blog_comments
for each row
execute function public.handle_blog_comment_notify_author();

-- 6) Triggers: new like on my post -> notification
create or replace function public.handle_blog_post_like_notify_author()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  author_id uuid;
  post_title text;
  post_slug text;
begin
  select author_user_id, title, slug
  into author_id, post_title, post_slug
  from public.blog_posts
  where id = new.post_id;

  if author_id is null or author_id = new.user_id then
    return null;
  end if;

  perform public.notify_user(
    author_id,
    'new_like',
    'إعجاب جديد على مقالك',
    coalesce(post_title, ''),
    jsonb_build_object('post_id', new.post_id, 'post_slug', post_slug)
  );

  return null;
end;
$$;

drop trigger if exists blog_post_reactions_notify_author on public.blog_post_reactions;
create trigger blog_post_reactions_notify_author
after insert on public.blog_post_reactions
for each row
execute function public.handle_blog_post_like_notify_author();

-- 7) Weekly challenge (simple: publish 5 accepted posts this week)
create table if not exists public.weekly_challenges (
  id uuid primary key default gen_random_uuid(),
  week_start date not null unique,
  goal_published_posts int not null default 5,
  reward_xp int not null default 150,
  title text not null,
  description text not null,
  created_at timestamptz not null default now()
);

alter table public.weekly_challenges enable row level security;

drop policy if exists weekly_challenges_select_public on public.weekly_challenges;
create policy weekly_challenges_select_public
on public.weekly_challenges
for select
to anon, authenticated
using (true);

create table if not exists public.weekly_challenge_claims (
  challenge_id uuid not null references public.weekly_challenges (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  claimed_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

alter table public.weekly_challenge_claims enable row level security;

drop policy if exists weekly_challenge_claims_select_own on public.weekly_challenge_claims;
create policy weekly_challenge_claims_select_own
on public.weekly_challenge_claims
for select
to authenticated
using (auth.uid() = user_id);

-- Ensure weekly challenge row exists for current week (UTC week start).
create or replace function public.ensure_current_weekly_challenge()
returns public.weekly_challenges
language plpgsql
security definer
set search_path = public
as $$
declare
  week_start date;
  row public.weekly_challenges;
begin
  week_start := (date_trunc('week', (now() at time zone 'utc'))::date);

  insert into public.weekly_challenges (week_start, goal_published_posts, reward_xp, title, description)
  values (
    week_start,
    5,
    150,
    'تحدي الأسبوع',
    'انشر 5 مقالات مقبولة هذا الأسبوع لتحصل على مكافأة خبرة.'
  )
  on conflict (week_start) do update
  set goal_published_posts = excluded.goal_published_posts,
      reward_xp = excluded.reward_xp,
      title = excluded.title,
      description = excluded.description
  returning * into row;

  return row;
end;
$$;

grant execute on function public.ensure_current_weekly_challenge() to authenticated;

-- One RPC that powers the account UI (level + rank + weekly progress)
create or replace function public.get_my_gamification_summary()
returns table (
  total_xp int,
  level_label text,
  rank_label text,
  published_posts bigint,
  weekly_goal int,
  weekly_progress bigint,
  weekly_reward_xp int,
  weekly_claimed boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  challenge public.weekly_challenges;
  xp int;
  published_total bigint;
  weekly_count bigint;
  level_text text;
  rank_text text;
  is_claimed boolean;
begin
  challenge := public.ensure_current_weekly_challenge();

  select coalesce(up.total_xp, 0) into xp
  from public.user_profiles up
  where up.id = auth.uid();

  select count(*)::bigint into published_total
  from public.blog_posts
  where author_user_id = auth.uid()
    and status::text = 'published';

  select count(*)::bigint into weekly_count
  from public.blog_posts
  where author_user_id = auth.uid()
    and status::text = 'published'
    and (published_at at time zone 'utc')::date >= challenge.week_start
    and (published_at at time zone 'utc')::date < (challenge.week_start + 7);

  select exists (
    select 1 from public.weekly_challenge_claims c
    where c.challenge_id = challenge.id
      and c.user_id = auth.uid()
  ) into is_claimed;

  if xp >= 1000 then
    level_text := 'بارز';
  elsif xp >= 500 then
    level_text := 'متوسط';
  elsif xp >= 200 then
    level_text := 'مبتدئ';
  else
    level_text := 'جديد';
  end if;

  if published_total >= 11 then
    rank_text := 'بارز';
  elsif published_total >= 6 then
    rank_text := 'متوسط';
  elsif published_total >= 3 then
    rank_text := 'مبتدئ';
  else
    rank_text := 'جديد';
  end if;

  total_xp := xp;
  level_label := level_text;
  rank_label := rank_text;
  published_posts := published_total;
  weekly_goal := challenge.goal_published_posts;
  weekly_progress := weekly_count;
  weekly_reward_xp := challenge.reward_xp;
  weekly_claimed := is_claimed;

  return next;
end;
$$;

grant execute on function public.get_my_gamification_summary() to authenticated;

-- Claim weekly reward (once)
create or replace function public.claim_weekly_challenge_reward()
returns table (
  awarded_xp int,
  message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  challenge public.weekly_challenges;
  weekly_count bigint;
  already_claimed boolean;
begin
  challenge := public.ensure_current_weekly_challenge();

  select count(*)::bigint into weekly_count
  from public.blog_posts
  where author_user_id = auth.uid()
    and status::text = 'published'
    and (published_at at time zone 'utc')::date >= challenge.week_start
    and (published_at at time zone 'utc')::date < (challenge.week_start + 7);

  select exists (
    select 1 from public.weekly_challenge_claims c
    where c.challenge_id = challenge.id
      and c.user_id = auth.uid()
  ) into already_claimed;

  if already_claimed then
    awarded_xp := 0;
    message := 'تم استلام مكافأة هذا الأسبوع بالفعل.';
    return next;
    return;
  end if;

  if weekly_count < challenge.goal_published_posts then
    awarded_xp := 0;
    message := 'لم تكتمل مهمة الأسبوع بعد.';
    return next;
    return;
  end if;

  insert into public.weekly_challenge_claims (challenge_id, user_id)
  values (challenge.id, auth.uid());

  perform public.add_user_xp(auth.uid(), challenge.reward_xp);
  perform public.notify_user(auth.uid(), 'weekly_reward', 'مكافأة التحدي الأسبوعي', 'تمت إضافة مكافأة الخبرة إلى حسابك.', jsonb_build_object('reward_xp', challenge.reward_xp));

  awarded_xp := challenge.reward_xp;
  message := 'تم استلام مكافأة التحدي بنجاح.';
  return next;
end;
$$;

grant execute on function public.claim_weekly_challenge_reward() to authenticated;

