-- Onefeed Supabase schema

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text,
  content text not null,
  image_url text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_blogs enable row level security;

drop policy if exists "Anyone can view published blog posts" on public.ai_blogs;
create policy "Anyone can view published blog posts"
  on public.ai_blogs for select
  using (true);

grant select on public.ai_blogs to anon, authenticated;

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_user_created_idx
  on public.chat_messages (user_id, created_at);

create table if not exists public.generated_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_type text not null check (asset_type in ('blog', 'image', 'video', 'whatsapp')),
  title text,
  prompt text,
  content text,
  storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists generated_assets_user_created_idx
  on public.generated_assets (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.chat_messages enable row level security;
alter table public.generated_assets enable row level security;

create policy "Users can view their profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view their chat messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "Users can create their chat messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

create policy "Users can view their generated assets"
  on public.generated_assets for select
  using (auth.uid() = user_id);

create policy "Users can create generated assets"
  on public.generated_assets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their generated assets"
  on public.generated_assets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their generated assets"
  on public.generated_assets for delete
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('generated-assets', 'generated-assets', false)
on conflict (id) do nothing;

create policy "Users can view their stored assets"
  on storage.objects for select
  using (
    bucket_id = 'generated-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can upload their stored assets"
  on storage.objects for insert
  with check (
    bucket_id = 'generated-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their stored assets"
  on storage.objects for delete
  using (
    bucket_id = 'generated-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ---- Profile pictures ----

alter table public.profiles add column if not exists avatar_url text;

drop policy if exists "Users can create their profile" on public.profiles;
create policy "Users can create their profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Public bucket: pictures are readable by URL; only the owner can write
-- inside their own folder (avatars/<user id>/...).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload their avatar" on storage.objects;
create policy "Users can upload their avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update their avatar" on storage.objects;
create policy "Users can update their avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their avatar" on storage.objects;
create policy "Users can delete their avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can list their avatar folder" on storage.objects;
create policy "Users can list their avatar folder"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
