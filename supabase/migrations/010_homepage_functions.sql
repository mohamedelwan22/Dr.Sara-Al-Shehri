-- 010_homepage_functions.sql
-- دوال عامة (public) للواجهة الرئيسية.
-- تُعتمد RLS الحالية: جداول analytics / profiles للقراءة محصورة بالإدارة فقط،
-- لذلك يُلجأ إلى نمط migration 009 (SECURITY DEFINER مع search_path مؤمَّن)
-- لتوفير إجماليات عامة للواجهة العامة دون كشف بيانات خاصة أو تجاوز RLS.
-- كل دالة تفرض شروطها بنفسها (published فقط) ولا تتطلب admin.

-- إجماليات الواجهة الرئيسية (زوار / تنزيلات / مستفيدون / أبحاث منشورة)
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
    'total_users',
      (select count(*) from public.profiles),
    'published_research',
      (select count(*) from public.research_papers where status = 'published')
  ) into result;
  return result;
end;
$$;

-- محاور الواجهة الرئيسية مع عدد العناصر المنشورة المرتبطة بكل محور (published فقط)
create or replace function public.homepage_categories()
returns table (
  axis_id uuid,
  slug text,
  name_ar text,
  name_en text,
  description_ar text,
  description_en text,
  sort_order int,
  published_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    a.id,
    a.slug,
    a.name_ar,
    a.name_en,
    a.description_ar,
    a.description_en,
    a.sort_order,
    (
      select count(*) from (
        select r.id
          from public.research_papers r
          join public.content_axis_links l
            on l.content_type = 'research' and l.content_id = r.id
         where l.axis_id = a.id and r.status = 'published'
        union all
        select r.id
          from public.publications r
          join public.content_axis_links l
            on l.content_type = 'publication' and l.content_id = r.id
         where l.axis_id = a.id and r.status = 'published'
        union all
        select s.id
          from public.scientific_supervisions s
          join public.content_axis_links l
            on l.content_type = 'supervision' and l.content_id = s.id
         where l.axis_id = a.id and s.status = 'published'
        union all
        select s.id
          from public.scientific_discussions s
          join public.content_axis_links l
            on l.content_type = 'discussion' and l.content_id = s.id
         where l.axis_id = a.id and s.status = 'published'
        union all
        select p.id
          from public.research_projects p
          join public.content_axis_links l
            on l.content_type = 'project' and l.content_id = p.id
         where l.axis_id = a.id and p.status = 'published'
        union all
        select c.id
          from public.courses c
          join public.content_axis_links l
            on l.content_type = 'course' and l.content_id = c.id
         where l.axis_id = a.id and c.status = 'published'
        union all
        select c.id
          from public.lectures c
          join public.content_axis_links l
            on l.content_type = 'lecture' and l.content_id = c.id
         where l.axis_id = a.id and c.status = 'published'
      ) t
    ) as published_count
  from public.scientific_axes a
  where a.status = 'published'
  order by a.sort_order asc nulls last, a.name_ar asc;
end;
$$;
