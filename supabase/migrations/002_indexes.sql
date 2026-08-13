-- 002_indexes.sql
create index on public.research_papers(status,published_at desc);
create index on public.research_projects(status,published_at desc);
create index on public.courses(activity_date desc);
create index on public.lectures(activity_date desc);
create index on public.content_axis_links(axis_id,content_type);
create index on public.contact_submissions(status,created_at desc);
create index on public.content_views(content_type,content_id,created_at desc);
create index research_title_trgm on public.research_papers using gin (title_ar gin_trgm_ops);
create index news_title_trgm on public.news using gin (title_ar gin_trgm_ops);
