-- 018_admin_dashboard_fix.sql
-- Fix runtime errors in the dashboard RPCs introduced in 017 (surfaced as HTTP 400):
--  1) admin_dashboard_stats: the `recent` CTE mixed the `content_status` enum with a
--     text literal in the announcements branch → UNION type mismatch (SQLSTATE 42804).
--     Fix: cast `status` to text in every union branch.
--  2) admin_dashboard_series: the `published` CTE selected `published_at` from
--     research_interests and calendar_events, which have no such column (SQLSTATE 42703).
--     Fix: drop those two branches (interests/calendar are evergreen, not publish-timeline).
-- Same signatures + return type (jsonb), so `create or replace` swaps them in place;
-- no grant changes required.

create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  totals jsonb;
  entities jsonb;
  content jsonb;
  announcements jsonb;
  recent jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  totals := (
    select jsonb_build_object(
      'views',            (select count(*) from public.content_views),
      'downloads',        (select count(*) from public.content_downloads),
      'shares',           (select count(*) from public.content_shares),
      'favorites',        (select count(*) from public.favorites),
      'submissions',      (select count(*) from public.contact_submissions),
      'new_submissions',  (select count(*) from public.contact_submissions where status = 'new'),
      'users',            (select count(*) from public.profiles),
      'submissions_by_status', (
        select coalesce(jsonb_object_agg(status, n), '{}'::jsonb) from (
          select status, count(*) as n from public.contact_submissions group by status
        ) sub
      )
    )
  );

  entities := (
    select coalesce(jsonb_object_agg(tbl, jsonb_build_object(
      'total', total,
      'published', published,
      'draft', draft,
      'scheduled', scheduled,
      'archived', archived
    )), '{}'::jsonb)
    from (
      select tbl,
        count(*) as total,
        count(*) filter (where status = 'published') as published,
        count(*) filter (where status = 'draft') as draft,
        count(*) filter (where status = 'scheduled') as scheduled,
        count(*) filter (where status = 'archived') as archived
      from (
        select 'research_papers' as tbl, status from public.research_papers
        union all
        select 'publications', status from public.publications
        union all
        select 'scientific_supervisions', status from public.scientific_supervisions
        union all
        select 'scientific_discussions', status from public.scientific_discussions
        union all
        select 'research_projects', status from public.research_projects
        union all
        select 'courses', status from public.courses
        union all
        select 'lectures', status from public.lectures
        union all
        select 'scientific_axes', status from public.scientific_axes
        union all
        select 'scientific_insights', status from public.scientific_insights
        union all
        select 'news', status from public.news
        union all
        select 'research_interests', status from public.research_interests
        union all
        select 'calendar_events', status from public.calendar_events
      ) s
      group by tbl
    ) t
  );

  content := (
    select jsonb_build_object(
      'published', (select count(*) from (
          select 1 from public.research_papers where status = 'published'
        union all select 1 from public.publications where status = 'published'
        union all select 1 from public.scientific_supervisions where status = 'published'
        union all select 1 from public.scientific_discussions where status = 'published'
        union all select 1 from public.research_projects where status = 'published'
        union all select 1 from public.courses where status = 'published'
        union all select 1 from public.lectures where status = 'published'
        union all select 1 from public.scientific_axes where status = 'published'
        union all select 1 from public.scientific_insights where status = 'published'
        union all select 1 from public.news where status = 'published'
        union all select 1 from public.research_interests where status = 'published'
        union all select 1 from public.calendar_events where status = 'published'
      ) x),
      'draft', (select count(*) from (
          select 1 from public.research_papers where status = 'draft'
        union all select 1 from public.publications where status = 'draft'
        union all select 1 from public.scientific_supervisions where status = 'draft'
        union all select 1 from public.scientific_discussions where status = 'draft'
        union all select 1 from public.research_projects where status = 'draft'
        union all select 1 from public.courses where status = 'draft'
        union all select 1 from public.lectures where status = 'draft'
        union all select 1 from public.scientific_axes where status = 'draft'
        union all select 1 from public.scientific_insights where status = 'draft'
        union all select 1 from public.news where status = 'draft'
        union all select 1 from public.research_interests where status = 'draft'
        union all select 1 from public.calendar_events where status = 'draft'
      ) x),
      'scheduled', (select count(*) from (
          select 1 from public.research_papers where status = 'scheduled'
        union all select 1 from public.publications where status = 'scheduled'
        union all select 1 from public.scientific_supervisions where status = 'scheduled'
        union all select 1 from public.scientific_discussions where status = 'scheduled'
        union all select 1 from public.research_projects where status = 'scheduled'
        union all select 1 from public.courses where status = 'scheduled'
        union all select 1 from public.lectures where status = 'scheduled'
        union all select 1 from public.scientific_axes where status = 'scheduled'
        union all select 1 from public.scientific_insights where status = 'scheduled'
        union all select 1 from public.news where status = 'scheduled'
        union all select 1 from public.research_interests where status = 'scheduled'
        union all select 1 from public.calendar_events where status = 'scheduled'
      ) x),
      'archived', (select count(*) from (
          select 1 from public.research_papers where status = 'archived'
        union all select 1 from public.publications where status = 'archived'
        union all select 1 from public.scientific_supervisions where status = 'archived'
        union all select 1 from public.scientific_discussions where status = 'archived'
        union all select 1 from public.research_projects where status = 'archived'
        union all select 1 from public.courses where status = 'archived'
        union all select 1 from public.lectures where status = 'archived'
        union all select 1 from public.scientific_axes where status = 'archived'
        union all select 1 from public.scientific_insights where status = 'archived'
        union all select 1 from public.news where status = 'archived'
        union all select 1 from public.research_interests where status = 'archived'
        union all select 1 from public.calendar_events where status = 'archived'
      ) x)
    )
  );

  announcements := (
    select jsonb_build_object(
      'total', count(*),
      'active', count(*) filter (where is_active),
      'inactive', count(*) filter (where not is_active)
    ) from public.announcements
  );

  recent := (
    select coalesce(jsonb_agg(r), '[]'::jsonb)
    from (
      select * from (
        select 'research' as entity, id, slug, title_ar, title_en, status::text, published_at, updated_at
          from public.research_papers
        union all
        select 'publication', id, slug, title_ar, title_en, status::text, published_at, updated_at
          from public.publications
        union all
        select 'supervision', id, slug, title_ar, title_en, status::text, published_at, updated_at
          from public.scientific_supervisions
        union all
        select 'discussion', id, slug, title_ar, title_en, status::text, published_at, updated_at
          from public.scientific_discussions
        union all
        select 'project', id, slug, title_ar, title_en, status::text, published_at, updated_at
          from public.research_projects
        union all
        select 'course', id, slug, title_ar, title_en, status::text, published_at, updated_at
          from public.courses
        union all
        select 'lecture', id, slug, title_ar, title_en, status::text, published_at, updated_at
          from public.lectures
        union all
        select 'axis', id, slug, name_ar, name_en, status::text, null::timestamptz, updated_at
          from public.scientific_axes
        union all
        select 'insight', id, slug, title_ar, title_en, status::text, published_at, updated_at
          from public.scientific_insights
        union all
        select 'news', id, slug, title_ar, title_en, status::text, published_at, updated_at
          from public.news
        union all
        select 'interest', id, null::text, title_ar, title_en, status::text, null::timestamptz, updated_at
          from public.research_interests
        union all
        select 'calendar', id, null::text, title_ar, title_en, status::text, null::timestamptz, updated_at
          from public.calendar_events
        union all
        select 'announcement', id, null::text, title_ar, title_en,
               case when is_active then 'published'::text else 'draft'::text end,
               null::timestamptz, updated_at
          from public.announcements
      ) u
      order by u.updated_at desc nulls last
      limit 15
    ) r
  );

  return jsonb_build_object(
    'totals', totals,
    'entities', entities,
    'content', content,
    'announcements', announcements,
    'recent', recent
  );
end $$;

create or replace function public.admin_dashboard_series(p_period text default '30d')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  days int;
  points jsonb;
  published jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  days := case p_period when '7d' then 7 when '90d' then 90 else 30 end;

  points := (
    select coalesce(jsonb_agg(jsonb_build_object(
      'date', to_char(d, 'YYYY-MM-DD'),
      'views', coalesce(v.n, 0),
      'downloads', coalesce(vd.n, 0)
    )), '[]'::jsonb)
    from generate_series(current_date - (days - 1), current_date, '1 day') d
    left join (
      select created_at::date as day, count(*) as n
      from public.content_views
      where created_at >= current_date - (days - 1)
      group by created_at::date
    ) v on v.day = d
    left join (
      select created_at::date as day, count(*) as n
      from public.content_downloads
      where created_at >= current_date - (days - 1)
      group by created_at::date
    ) vd on vd.day = d
  );

  published := (
    select coalesce(jsonb_agg(jsonb_build_object(
      'date', to_char(d, 'YYYY-MM-DD'),
      'count', coalesce(p.n, 0)
    )), '[]'::jsonb)
    from generate_series(current_date - (days - 1), current_date, '1 day') d
    left join (
      select day, sum(n) as n from (
        select published_at::date as day, count(*) as n from public.research_papers where published_at is not null group by published_at::date
        union all select published_at::date, count(*) from public.publications where published_at is not null group by published_at::date
        union all select published_at::date, count(*) from public.scientific_supervisions where published_at is not null group by published_at::date
        union all select published_at::date, count(*) from public.scientific_discussions where published_at is not null group by published_at::date
        union all select published_at::date, count(*) from public.research_projects where published_at is not null group by published_at::date
        union all select published_at::date, count(*) from public.courses where published_at is not null group by published_at::date
        union all select published_at::date, count(*) from public.lectures where published_at is not null group by published_at::date
        union all select published_at::date, count(*) from public.scientific_insights where published_at is not null group by published_at::date
        union all select published_at::date, count(*) from public.news where published_at is not null group by published_at::date
      ) x
      group by day
    ) p on p.day = d
  );

  return jsonb_build_object('period', p_period, 'points', points, 'published', published);
end $$;

grant execute on function public.admin_dashboard_stats() to authenticated;
grant execute on function public.admin_dashboard_series(text) to authenticated;
