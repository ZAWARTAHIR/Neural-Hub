-- ---- Campaign live progress ----
-- n8n reports each generation step here; the Campaign studio chat polls the
-- row and shows the steps live. Run once in the Supabase SQL editor
-- (after campaigns.sql).

alter table public.campaigns add column if not exists progress jsonb not null default '{}'::jsonb;
alter table public.campaigns add column if not exists progress_at timestamptz;

-- progress shape:
-- {
--   "video": { "label": "Rendering scene 2 of 4", "total": 6, "state": "running",
--              "steps": { "scene1": true } },
--   "prompts": { ... }
-- }

-- Called by n8n after a step. Merges one output's entry, keeping steps already done.
create or replace function public.campaign_progress(
  p_id uuid,
  p_output text,
  p_label text,
  p_total int default null,
  p_step text default null,
  p_state text default 'running'
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.campaigns c
  set progress = coalesce(c.progress, '{}'::jsonb) || jsonb_build_object(
        p_output,
        coalesce(c.progress -> p_output, '{}'::jsonb)
          || jsonb_strip_nulls(jsonb_build_object('label', p_label, 'total', p_total, 'state', p_state))
          || jsonb_build_object(
               'steps',
               coalesce(c.progress -> p_output -> 'steps', '{}'::jsonb)
                 || case when p_step is null then '{}'::jsonb else jsonb_build_object(p_step, true) end
             )
      ),
      progress_at = now(),
      updated_at = now()
  where c.id = p_id;
$$;

-- Called by n8n with the final result, so it is saved even if the browser
-- tab was closed while generating.
create or replace function public.campaign_finish(p_id uuid, p_result jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  update public.campaigns c
  set status = case when p_result ->> 'status' = 'cancelled' then 'cancelled' else 'done' end,
      result = p_result,
      progress_at = now(),
      updated_at = now()
  where c.id = p_id;
$$;

-- n8n's "Save GIF" node stores asset_type 'gif', which the original check didn't allow.
alter table public.generated_assets drop constraint if exists generated_assets_asset_type_check;
alter table public.generated_assets add constraint generated_assets_asset_type_check
  check (asset_type in ('blog', 'image', 'video', 'gif', 'whatsapp'));

-- Only the server (n8n uses the service_role key) may call these.
revoke all on function public.campaign_progress(uuid, text, text, int, text, text) from public, anon, authenticated;
revoke all on function public.campaign_finish(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.campaign_progress(uuid, text, text, int, text, text) to service_role;
grant execute on function public.campaign_finish(uuid, jsonb) to service_role;
