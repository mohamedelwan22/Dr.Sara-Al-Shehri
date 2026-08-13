-- 011_phase_2_database_integrity.sql
-- Phase 2: Database integrity & Supabase hardening.
-- All changes are additive, safe, idempotent, and non-destructive.
-- Verified against migrations 001-010 and application code (src/**).
--
-- Scope applied here (rest items verified as already-satisfied or deferred, see report):
--   1) content_downloads & content_shares: add PRIMARY KEY + GENERATED IDENTITY on `id`
--      (these were created via `LIKE content_views INCLUDING DEFAULTS`, which copies
--       columns/defaults but NOT the PRIMARY KEY or GENERATED IDENTITY. App inserts
--       omit `id`, so without an identity the insert fails with a NOT NULL violation.)
--   2) Add user_id FK -> auth.users(id) ON DELETE SET NULL on both (mirrors content_views),
--      guarded against orphaned rows.
--   3) Add missing performance/integrity indexes:
--        - (status, published_at DESC) on public list/timeline tables
--        - (content_type, content_id, created_at DESC) on counter tables
--        - GIN trigram (gin_trgm_ops) on title_ar of searchable content tables
--        - (created_at DESC) / (entity_type, created_at DESC) on audit_logs
--   4) UNIQUE(slug) on publications/discussions/lectures/insights: ALREADY EXISTS
--      (copied via `LIKE ... INCLUDING CONSTRAINTS`). Verified, no change needed.
--   5) Polymorphic FK on content_* content_id, and uniqueness on counter tables:
--      intentionally DEFERRED (would break legitimate multiple events / is impossible
--      for polymorphic references). See docs/PHASE-2-DATABASE-INTEGRITY-REPORT.md.

-- ============================================================
-- 1) PRIMARY KEY + GENERATED IDENTITY on content_downloads.id
-- ============================================================
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_type = 'PRIMARY KEY'
      and table_schema = 'public'
      and table_name = 'content_downloads'
  ) then
    alter table public.content_downloads add primary key (id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'content_downloads'
      and column_name = 'id'
      and is_identity = 'YES'
  ) then
    alter table public.content_downloads alter column id add generated always as identity;
    execute format(
      'select setval(pg_get_serial_sequence(''public.content_downloads'', ''id''), '
      || 'coalesce((select max(id) from public.content_downloads), 1))'
    );
  end if;
end $$;

-- ============================================================
-- 1) PRIMARY KEY + GENERATED IDENTITY on content_shares.id
-- ============================================================
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_type = 'PRIMARY KEY'
      and table_schema = 'public'
      and table_name = 'content_shares'
  ) then
    alter table public.content_shares add primary key (id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'content_shares'
      and column_name = 'id'
      and is_identity = 'YES'
  ) then
    alter table public.content_shares alter column id add generated always as identity;
    execute format(
      'select setval(pg_get_serial_sequence(''public.content_shares'', ''id''), '
      || 'coalesce((select max(id) from public.content_shares), 1))'
    );
  end if;
end $$;

-- ============================================================
-- 2) user_id FK -> auth.users (guarded against orphans)
-- ============================================================
do $$
declare
  v_orphans int;
begin
  select count(*) into v_orphans
  from public.content_downloads d
  where d.user_id is not null
    and not exists (select 1 from auth.users u where u.id = d.user_id);

  if v_orphans = 0 then
    if not exists (
      select 1 from information_schema.table_constraints
      where constraint_name = 'content_downloads_user_id_fkey'
    ) then
      alter table public.content_downloads
        add constraint content_downloads_user_id_fkey
        foreign key (user_id) references auth.users(id) on delete set null;
    end if;
  else
    raise notice 'Phase2: skipped FK on content_downloads (orphaned user_id=% rows); resolve orphans first', v_orphans;
  end if;
end $$;

do $$
declare
  v_orphans int;
begin
  select count(*) into v_orphans
  from public.content_shares s
  where s.user_id is not null
    and not exists (select 1 from auth.users u where u.id = s.user_id);

  if v_orphans = 0 then
    if not exists (
      select 1 from information_schema.table_constraints
      where constraint_name = 'content_shares_user_id_fkey'
    ) then
      alter table public.content_shares
        add constraint content_shares_user_id_fkey
        foreign key (user_id) references auth.users(id) on delete set null;
    end if;
  else
    raise notice 'Phase2: skipped FK on content_shares (orphaned user_id=% rows); resolve orphans first', v_orphans;
  end if;
end $$;

-- ============================================================
-- 3) Missing performance / integrity indexes
-- ============================================================

-- Composite (status, published_at DESC) used by public listing + timeline queries.
create index if not exists publications_status_published_at_idx
  on public.publications (status, published_at desc);
create index if not exists scientific_supervisions_status_published_at_idx
  on public.scientific_supervisions (status, published_at desc);
create index if not exists scientific_discussions_status_published_at_idx
  on public.scientific_discussions (status, published_at desc);
create index if not exists news_status_published_at_idx
  on public.news (status, published_at desc);
create index if not exists scientific_insights_status_published_at_idx
  on public.scientific_insights (status, published_at desc);

-- Counter tables filtered by (content_type, content_id) + time-ordered.
create index if not exists content_downloads_content_type_id_idx
  on public.content_downloads (content_type, content_id, created_at desc);
create index if not exists content_shares_content_type_id_idx
  on public.content_shares (content_type, content_id, created_at desc);

-- Trigram search indexes (mirror migration 002 pattern using gin_trgm_ops).
-- Requires pg_trgm extension created in migration 001.
create index if not exists publications_title_trgm_idx
  on public.publications using gin (title_ar gin_trgm_ops);
create index if not exists scientific_supervisions_title_trgm_idx
  on public.scientific_supervisions using gin (title_ar gin_trgm_ops);
create index if not exists scientific_discussions_title_trgm_idx
  on public.scientific_discussions using gin (title_ar gin_trgm_ops);
create index if not exists research_projects_title_trgm_idx
  on public.research_projects using gin (title_ar gin_trgm_ops);
create index if not exists courses_title_trgm_idx
  on public.courses using gin (title_ar gin_trgm_ops);
create index if not exists lectures_title_trgm_idx
  on public.lectures using gin (title_ar gin_trgm_ops);
create index if not exists scientific_insights_title_trgm_idx
  on public.scientific_insights using gin (title_ar gin_trgm_ops);

-- audit_logs listing/sort support.
create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at desc);
create index if not exists audit_logs_entity_created_at_idx
  on public.audit_logs (entity_type, created_at desc);
