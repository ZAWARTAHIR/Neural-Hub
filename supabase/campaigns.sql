-- ---- Campaign studio history ----
-- One row per campaign sent from the dashboard Campaign studio chat.
-- Run this once in the Supabase SQL editor.

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  prompt text not null,
  outputs text[] not null default '{}',
  mode text not null check (mode in ('auto', 'permission')),
  -- sending | review | generating | cancelling | cancelled | done | sent | error
  status text not null default 'sending',
  reply text,
  execution_id text,
  review jsonb,   -- n8n "awaiting_approval" response (prompts + resumeUrl)
  result jsonb,   -- n8n final result (image / blog / video / gif / whatsapp)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campaigns_user_created_idx
  on public.campaigns (user_id, created_at desc);

alter table public.campaigns enable row level security;

drop policy if exists "Users can view their campaigns" on public.campaigns;
create policy "Users can view their campaigns"
  on public.campaigns for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their campaigns" on public.campaigns;
create policy "Users can create their campaigns"
  on public.campaigns for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their campaigns" on public.campaigns;
create policy "Users can update their campaigns"
  on public.campaigns for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their campaigns" on public.campaigns;
create policy "Users can delete their campaigns"
  on public.campaigns for delete to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.campaigns to authenticated;
