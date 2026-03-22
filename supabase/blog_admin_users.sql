-- Blog admin allowlist
-- Run in Supabase SQL editor

create table if not exists public.blog_admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text not null unique,
  role text not null default 'admin' check (role in ('owner', 'admin', 'editor')),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists blog_admin_users_email_idx
  on public.blog_admin_users (lower(email));

alter table public.blog_admin_users enable row level security;

drop trigger if exists blog_admin_users_set_updated_at on public.blog_admin_users;
create trigger blog_admin_users_set_updated_at
before update on public.blog_admin_users
for each row execute function public.set_updated_at();

drop policy if exists blog_admin_users_no_public_read on public.blog_admin_users;
create policy blog_admin_users_no_public_read
on public.blog_admin_users
for select
to authenticated, anon
using (false);

drop policy if exists blog_admin_users_no_public_insert on public.blog_admin_users;
create policy blog_admin_users_no_public_insert
on public.blog_admin_users
for insert
to authenticated, anon
with check (false);

drop policy if exists blog_admin_users_no_public_update on public.blog_admin_users;
create policy blog_admin_users_no_public_update
on public.blog_admin_users
for update
to authenticated, anon
using (false)
with check (false);

drop policy if exists blog_admin_users_no_public_delete on public.blog_admin_users;
create policy blog_admin_users_no_public_delete
on public.blog_admin_users
for delete
to authenticated, anon
using (false);

insert into public.blog_admin_users (email, role, is_active)
values ('elhassanilive@gmail.com', 'owner', true)
on conflict (email) do update set
  role = excluded.role,
  is_active = excluded.is_active;
