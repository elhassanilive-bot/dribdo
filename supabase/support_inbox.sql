-- Support inbox tables for website forms and admin replies
create extension if not exists pgcrypto;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  request_type text not null,
  source text,
  status text not null default 'open',
  priority text not null default 'normal',
  requester_name text,
  requester_email text not null,
  subject text,
  message text,
  payload jsonb not null default '{}'::jsonb,
  attachment_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_reply_at timestamptz,
  last_replied_by text,
  closed_at timestamptz
);

create table if not exists public.support_ticket_replies (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author_name text not null default 'Support Team',
  author_email text,
  message text not null,
  sent_to_email text,
  email_delivery_status text not null default 'pending',
  email_error text,
  created_at timestamptz not null default now()
);

create index if not exists support_tickets_created_at_idx on public.support_tickets(created_at desc);
create index if not exists support_tickets_status_idx on public.support_tickets(status);
create index if not exists support_tickets_request_type_idx on public.support_tickets(request_type);
create index if not exists support_tickets_requester_email_idx on public.support_tickets(requester_email);
create index if not exists support_ticket_replies_ticket_id_idx on public.support_ticket_replies(ticket_id);

create or replace function public.set_support_tickets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_support_tickets_updated_at on public.support_tickets;
create trigger trg_support_tickets_updated_at
before update on public.support_tickets
for each row execute function public.set_support_tickets_updated_at();

alter table public.support_tickets enable row level security;
alter table public.support_ticket_replies enable row level security;

-- No public policies on purpose: access should happen through service role key only.