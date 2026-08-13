-- 004_triggers.sql
-- تم تعميم trigger تحديث updated_at على كل الجداول اللي تحتوي هذا العمود (17 جدول).

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- الجداول التي تحتوي عمود updated_at فعليًا حسب 001_schema.sql:
create trigger touch_profiles before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger touch_site_settings before update on public.site_settings
for each row execute function public.touch_updated_at();

create trigger touch_profile_content before update on public.profile_content
for each row execute function public.touch_updated_at();

create trigger touch_research_interests before update on public.research_interests
for each row execute function public.touch_updated_at();

create trigger touch_scientific_axes before update on public.scientific_axes
for each row execute function public.touch_updated_at();

create trigger touch_research_papers before update on public.research_papers
for each row execute function public.touch_updated_at();

create trigger touch_publications before update on public.publications
for each row execute function public.touch_updated_at();

create trigger touch_scientific_supervisions before update on public.scientific_supervisions
for each row execute function public.touch_updated_at();

create trigger touch_scientific_discussions before update on public.scientific_discussions
for each row execute function public.touch_updated_at();

create trigger touch_research_projects before update on public.research_projects
for each row execute function public.touch_updated_at();

create trigger touch_courses before update on public.courses
for each row execute function public.touch_updated_at();

create trigger touch_lectures before update on public.lectures
for each row execute function public.touch_updated_at();

create trigger touch_news before update on public.news
for each row execute function public.touch_updated_at();

create trigger touch_announcements before update on public.announcements
for each row execute function public.touch_updated_at();

create trigger touch_scientific_insights before update on public.scientific_insights
for each row execute function public.touch_updated_at();

create trigger touch_calendar_events before update on public.calendar_events
for each row execute function public.touch_updated_at();

create trigger touch_contact_submissions before update on public.contact_submissions
for each row execute function public.touch_updated_at();

-- ملاحظة: project_related_items, content_axis_links, contact_attachments, favorites,
-- content_views, content_downloads, content_shares, media, audit_logs, user_roles
-- لا تحتوي عمود updated_at في السكيما الحالية، لذلك لا تحتاج هذا الـ trigger.
