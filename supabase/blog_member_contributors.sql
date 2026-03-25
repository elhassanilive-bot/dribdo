-- Member contributors, pending submissions, and admin review
-- شغّل هذا الملف بعد blog_schema.sql و blog_auth_comments.sql

do $$
begin
  alter type public.blog_post_status add value if not exists 'pending';
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter type public.blog_post_status add value if not exists 'rejected';
exception
  when duplicate_object then null;
end $$;

alter table public.blog_posts
  add column if not exists author_user_id uuid references auth.users (id) on delete set null;

alter table public.blog_posts
  add column if not exists author_display_name text;

alter table public.blog_posts
  add column if not exists author_avatar_url text;

alter table public.blog_posts
  add column if not exists reviewed_at timestamptz;

alter table public.blog_posts
  add column if not exists review_note text;

create table if not exists public.site_admins (
  email text primary key,
  display_name text,
  created_at timestamptz not null default now()
);

-- بعد تشغيل هذا الملف أضف بريد حسابك الإداري هنا:
-- insert into public.site_admins (email, display_name)
-- values ('you@example.com', 'Owner')
-- on conflict (email) do update set display_name = excluded.display_name;

create index if not exists blog_posts_author_user_id_idx
  on public.blog_posts (author_user_id, created_at desc);

create index if not exists blog_posts_status_author_user_id_idx
  on public.blog_posts (status, author_user_id, created_at desc);

drop policy if exists blog_posts_member_read_own on public.blog_posts;
create policy blog_posts_member_read_own
on public.blog_posts
for select
to authenticated
using (author_user_id = auth.uid());

drop policy if exists blog_posts_member_insert_own on public.blog_posts;
create policy blog_posts_member_insert_own
on public.blog_posts
for insert
to authenticated
with check (
  author_user_id = auth.uid()
  and status::text = 'pending'
);

drop policy if exists blog_posts_member_update_own on public.blog_posts;
create policy blog_posts_member_update_own
on public.blog_posts
for update
to authenticated
using (author_user_id = auth.uid())
with check (
  author_user_id = auth.uid()
  -- Any edit from a member re-sends the post to admin review, even if it was published before.
  and status::text = 'pending'
);

drop policy if exists blog_posts_member_delete_own on public.blog_posts;
create policy blog_posts_member_delete_own
on public.blog_posts
for delete
to authenticated
using (author_user_id = auth.uid());

drop policy if exists blog_posts_admin_review_read on public.blog_posts;
create policy blog_posts_admin_review_read
on public.blog_posts
for select
to authenticated
using (
  exists (
    select 1
    from public.site_admins admins
    where lower(admins.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);

drop policy if exists blog_posts_admin_review_update on public.blog_posts;
create policy blog_posts_admin_review_update
on public.blog_posts
for update
to authenticated
using (
  exists (
    select 1
    from public.site_admins admins
    where lower(admins.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
)
with check (
  exists (
    select 1
    from public.site_admins admins
    where lower(admins.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);
