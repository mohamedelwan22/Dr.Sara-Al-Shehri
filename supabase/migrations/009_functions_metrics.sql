-- 009_functions_metrics.sql
-- دوال تطبيقية أمنة (SECURITY DEFINER) لتجميع المقاييس والبحث والخريطة العلمية.
-- هذه الدوال تنفّذ على الخادم وتفرض شروطها بنفسها (published / is_admin) لأنها تتجاوز RLS.
-- لا تُستخدم service_role من المتصفح إطلاقًا.

-- ============ مقاييس عنصر محتوى (عامة للعرض العام) ============
create or replace function public.count_content_metrics(
  p_content_type text,
  p_content_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'views',      count(distinct v.id),
    'downloads',  count(distinct d.id),
    'shares',     count(distinct s.id),
    'favorites',  count(distinct f.id)
  )
  into result
  from (select 1) t
  left join public.content_views v
    on v.content_type = p_content_type and v.content_id = p_content_id
  left join public.content_downloads d
    on d.content_type = p_content_type and d.content_id = p_content_id
  left join public.content_shares s
    on s.content_type = p_content_type and s.content_id = p_content_id
  left join public.favorites f
    on f.content_type = p_content_type and f.content_id = p_content_id;
  return coalesce(result, '{}'::jsonb);
end $$;

-- ============ إحصائيات إجمالية للوحة التحكم (أدمن فقط) ============
create or replace function public.admin_analytics_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  select jsonb_build_object(
    'total_views',        (select count(*) from public.content_views),
    'total_downloads',    (select count(*) from public.content_downloads),
    'total_shares',       (select count(*) from public.content_shares),
    'total_favorites',    (select count(*) from public.favorites),
    'total_submissions',  (select count(*) from public.contact_submissions),
    'new_submissions',    (select count(*) from public.contact_submissions where status = 'new'),
    'published_research', (select count(*) from public.research_papers where status = 'published'),
    'registered_users',   (select count(*) from public.profiles)
  ) into result;
  return result;
end $$;

-- ============ البحث عبر المحتوى المنشور (مؤمَّن: published فقط) ============
create or replace function public.search_site(p_query text)
returns table (
  content_type text,
  content_id uuid,
  slug text,
  title_ar text,
  title_en text,
  excerpt_ar text,
  excerpt_en text,
  published_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  q text := trim(p_query);
begin
  if q is null or q = '' then
    return;
  end if;
  return query
  select 'research'::text as content_type, r.id, r.slug, r.title_ar, r.title_en, r.abstract_ar, r.abstract_en, r.published_at
    from public.research_papers r where r.status = 'published'
      and (r.title_ar % q or r.title_en % q or r.abstract_ar % q)
  union all
  select 'publication', r.id, r.slug, r.title_ar, r.title_en, r.abstract_ar, r.abstract_en, r.published_at
    from public.publications r where r.status = 'published'
      and (r.title_ar % q or r.title_en % q or r.abstract_ar % q)
  union all
  select 'supervision', s.id, s.slug, s.title_ar, s.title_en, s.summary_ar, s.summary_en, s.published_at
    from public.scientific_supervisions s where s.status = 'published'
      and (s.title_ar % q or s.title_en % q or s.researcher_ar % q)
  union all
  select 'discussion', s.id, s.slug, s.title_ar, s.title_en, s.summary_ar, s.summary_en, s.published_at
    from public.scientific_discussions s where s.status = 'published'
      and (s.title_ar % q or s.title_en % q or s.researcher_ar % q)
  union all
  select 'project', p.id, p.slug, p.title_ar, p.title_en, p.description_ar, p.description_en, p.published_at
    from public.research_projects p where p.status = 'published'
      and (p.title_ar % q or p.title_en % q or p.description_ar % q)
  union all
  select 'course', c.id, c.slug, c.title_ar, c.title_en, c.description_ar, c.description_en, c.published_at
    from public.courses c where c.status = 'published' and (c.title_ar % q or c.title_en % q)
  union all
  select 'lecture', c.id, c.slug, c.title_ar, c.title_en, c.description_ar, c.description_en, c.published_at
    from public.lectures c where c.status = 'published' and (c.title_ar % q or c.title_en % q)
  union all
  select 'axis', a.id, a.slug, a.name_ar, a.name_en, a.description_ar, a.description_en, null::timestamptz
    from public.scientific_axes a where a.status = 'published'
      and (a.name_ar % q or a.name_en % q or a.description_ar % q)
  union all
  select 'news', n.id, n.slug, n.title_ar, n.title_en, n.excerpt_ar, n.excerpt_en, n.published_at
    from public.news n where n.status = 'published' and (n.title_ar % q or n.body_ar % q)
  union all
  select 'insight', n.id, n.slug, n.title_ar, n.title_en, n.excerpt_ar, n.excerpt_en, n.published_at
    from public.scientific_insights n where n.status = 'published' and (n.title_ar % q or n.body_ar % q)
  order by published_at desc nulls last
  limit 100;
end $$;

-- ============ محتوى محور علمي (مؤمَّن: published فقط) ============
create type public.axis_item_result as (
  content_type text,
  content_id uuid,
  slug text,
  title_ar text,
  title_en text,
  published_at timestamptz
);

create or replace function public.get_axis_content(p_axis_id uuid)
returns setof public.axis_item_result
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 'research'::text, r.id, r.slug, r.title_ar, r.title_en, r.published_at
    from public.research_papers r
    join public.content_axis_links l on l.content_type = 'research' and l.content_id = r.id
    where l.axis_id = p_axis_id and r.status = 'published'
  union all
  select 'publication', r.id, r.slug, r.title_ar, r.title_en, r.published_at
    from public.publications r
    join public.content_axis_links l on l.content_type = 'publication' and l.content_id = r.id
    where l.axis_id = p_axis_id and r.status = 'published'
  union all
  select 'supervision', s.id, s.slug, s.title_ar, s.title_en, s.published_at
    from public.scientific_supervisions s
    join public.content_axis_links l on l.content_type = 'supervision' and l.content_id = s.id
    where l.axis_id = p_axis_id and s.status = 'published'
  union all
  select 'discussion', s.id, s.slug, s.title_ar, s.title_en, s.published_at
    from public.scientific_discussions s
    join public.content_axis_links l on l.content_type = 'discussion' and l.content_id = s.id
    where l.axis_id = p_axis_id and s.status = 'published'
  union all
  select 'project', p.id, p.slug, p.title_ar, p.title_en, p.published_at
    from public.research_projects p
    join public.content_axis_links l on l.content_type = 'project' and l.content_id = p.id
    where l.axis_id = p_axis_id and p.status = 'published'
  union all
  select 'course', c.id, c.slug, c.title_ar, c.title_en, c.published_at
    from public.courses c
    join public.content_axis_links l on l.content_type = 'course' and l.content_id = c.id
    where l.axis_id = p_axis_id and c.status = 'published'
  union all
  select 'lecture', c.id, c.slug, c.title_ar, c.title_en, c.published_at
    from public.lectures c
    join public.content_axis_links l on l.content_type = 'lecture' and l.content_id = c.id
    where l.axis_id = p_axis_id and c.status = 'published'
  order by published_at desc nulls last;
end $$;
