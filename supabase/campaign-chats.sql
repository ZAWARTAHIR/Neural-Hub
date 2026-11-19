-- ---- Campaign studio chats (New chat + history) ----
-- Every campaign belongs to a chat thread; the chat history lists threads.
-- Run once in the Supabase SQL editor (after campaigns.sql).

alter table public.campaigns add column if not exists thread_id uuid;

-- Campaigns sent before chats existed: one "earlier" chat per user.
update public.campaigns c
set thread_id = t.thread_id
from (
  select user_id, gen_random_uuid() as thread_id
  from public.campaigns
  where thread_id is null
  group by user_id
) t
where c.user_id = t.user_id
  and c.thread_id is null;

alter table public.campaigns alter column thread_id set not null;

create index if not exists campaigns_user_thread_created_idx
  on public.campaigns (user_id, thread_id, created_at);
