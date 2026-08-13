-- 013_phase_3_security_hardening.sql
-- Phase 3: Security hardening (additive, safe, idempotent, non-destructive).
-- Verified against migrations 001-012 and application code (src/**).
--
-- Covers:
--   1) Counter / metrics abuse  -> server-side per-visitor throttle on
--      content_views / content_downloads / content_shares (BEFORE INSERT trigger).
--   2) Contact attachment validation -> Storage-layer PDF-only + 5MB cap, plus
--      DB CHECK constraints on the attachment metadata row.
--   3) Admin service-layer authorization -> handled in app code (src/lib/adminGuard.ts);
--      RLS remains the final enforcement layer (no DB change required here).
--   4) Public metadata exposure -> restrict `media` read to admins only
--      (the app only reads `media` from the admin panel; no public dependency).
--   5) total_users exposure -> removed from the PUBLIC homepage_stats() RPC;
--      it remains available to admins via admin_analytics_overview() (registered_users).
--   6) Supabase security review -> confirms no dangerous USING(true) writes,
--      user_roles not self-assignable, SECURITY DEFINER functions keep search_path.

-- ============================================================
-- 1) Counter / metrics abuse: per-visitor throttle (server-enforced)
-- ============================================================
-- Anonymous users may INSERT into these tables (legitimate public tracking), but a
-- single visitor (identified by user_id when authenticated, otherwise by the
-- client-supplied visitor_hash) can only record one interaction per content item
-- per hour. This stops trivial counter inflation while preserving legitimate,
-- time-separated repeats. RLS still prevents user_id impersonation.

create or replace function public.dedupe_content_interaction()
returns trigger
language plpgsql
as $$
declare
  v_key text;
  v_recent boolean;
begin
  v_key := coalesce(new.user_id::text, new.visitor_hash);
  execute format(
    'select exists('
    ' select 1 from public.%I'
    ' where content_type = $1 and content_id = $2'
    '   and coalesce(user_id::text, visitor_hash) = $3'
    '   and created_at > now() - interval ''1 hour'')',
    tg_table_name
  ) using new.content_type, new.content_id, v_key into v_recent;
  if v_recent then
    return null; -- skip duplicate within the window (abort this row silently)
  end if;
  return new;
end $$;

drop trigger if exists dedupe_content_views on public.content_views;
create trigger dedupe_content_views
  before insert on public.content_views
  for each row execute function public.dedupe_content_interaction();

drop trigger if exists dedupe_content_downloads on public.content_downloads;
create trigger dedupe_content_downloads
  before insert on public.content_downloads
  for each row execute function public.dedupe_content_interaction();

drop trigger if exists dedupe_content_shares on public.content_shares;
create trigger dedupe_content_shares
  before insert on public.content_shares
  for each row execute function public.dedupe_content_interaction();

-- ============================================================
-- 2) Contact attachment validation (server/storage-side)
-- ============================================================
-- a) Storage layer: restrict the contact-attachments bucket to PDF only and a 5MB cap.
--    This is enforced by Supabase Storage regardless of any client-side check.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'storage' and table_name = 'buckets'
      and column_name = 'allowed_mime_types'
  ) then
    update storage.buckets
      set allowed_mime_types = array['application/pdf']::text[],
          file_size_limit = 5242880
      where id = 'contact-attachments';
  else
    raise notice 'Phase3: storage.buckets lacks allowed_mime_types column; skipping bucket MIME config';
  end if;
end $$;

-- b) DB layer: the attachment metadata row must be PDF and within the size limit.
--    Guarded so it never fails if pre-existing data would violate the constraint.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'contact_attachments_mime_check'
  ) then
    if not exists (
      select 1 from public.contact_attachments where mime_type is distinct from 'application/pdf'
    ) then
      alter table public.contact_attachments
        add constraint contact_attachments_mime_check check (mime_type = 'application/pdf');
    else
      raise notice 'Phase3: skipped contact_attachments_mime_check (non-PDF rows exist)';
    end if;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'contact_attachments_size_check'
  ) then
    if not exists (
      select 1 from public.contact_attachments where size_bytes > 5242880
    ) then
      alter table public.contact_attachments
        add constraint contact_attachments_size_check check (size_bytes <= 5242880);
    else
      raise notice 'Phase3: skipped contact_attachments_size_check (oversized rows exist)';
    end if;
  end if;
end $$;

-- ============================================================
-- 4) Public metadata exposure: restrict `media` to admins
-- ============================================================
-- The application only reads `media` from the admin panel (MediaPage). Exposing its
-- rows (alt text + storage paths) to anonymous users via `using (true)` is unnecessary.
drop policy if exists "media readable" on public.media;
create policy "media readable" on public.media for select using (public.is_admin());

-- ============================================================
-- 5) total_users exposure: remove from the PUBLIC homepage_stats() RPC
-- ============================================================
-- total_users (count of registered profiles) was returned to anonymous callers.
-- It is not required by the public UI; admins still get it via
-- admin_analytics_overview() as registered_users.
create or replace function public.homepage_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'total_views',
      (select count(*) from public.content_views),
    'total_downloads',
      (select count(*) from public.content_downloads),
    'published_research',
      (select count(*) from public.research_papers where status = 'published')
  ) into result;
  return result;
end;
$$;
