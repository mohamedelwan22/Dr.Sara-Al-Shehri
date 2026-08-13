-- 005_rls.sql
-- تم تعميم السياسات على جميع الجداول الـ27 (تحديث كامل — لا جدول بلا RLS).

-- ============ تفعيل RLS على كل الجداول ============
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.site_settings enable row level security;
alter table public.profile_content enable row level security;
alter table public.research_interests enable row level security;
alter table public.scientific_axes enable row level security;
alter table public.research_papers enable row level security;
alter table public.publications enable row level security;
alter table public.scientific_supervisions enable row level security;
alter table public.scientific_discussions enable row level security;
alter table public.research_projects enable row level security;
alter table public.project_related_items enable row level security;
alter table public.courses enable row level security;
alter table public.lectures enable row level security;
alter table public.content_axis_links enable row level security;
alter table public.news enable row level security;
alter table public.announcements enable row level security;
alter table public.scientific_insights enable row level security;
alter table public.calendar_events enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.contact_attachments enable row level security;
alter table public.favorites enable row level security;
alter table public.content_views enable row level security;
alter table public.content_downloads enable row level security;
alter table public.content_shares enable row level security;
alter table public.media enable row level security;
alter table public.audit_logs enable row level security;

-- ============ profiles ============
create policy "own profile read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "own profile update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "admin manages profiles" on public.profiles for delete using (public.is_admin());
-- لا يوجد insert policy للمستخدم: الإدراج يتم فقط عبر trigger handle_new_user (security definer).

-- ============ user_roles ============
-- لا self-assign إطلاقًا: القراءة للمالك أو الأدمن، والتعديل/الإدراج/الحذف للأدمن فقط.
create policy "own role read" on public.user_roles for select using (user_id = auth.uid() or public.is_admin());
create policy "admin manages roles" on public.user_roles for insert with check (public.is_admin());
create policy "admin updates roles" on public.user_roles for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes roles" on public.user_roles for delete using (public.is_admin());

-- ============ site_settings ============
create policy "public settings readable" on public.site_settings for select using (is_public = true or public.is_admin());
create policy "admin manages settings" on public.site_settings for insert with check (public.is_admin());
create policy "admin updates settings" on public.site_settings for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes settings" on public.site_settings for delete using (public.is_admin());

-- ============ نمط عام: جداول محتوى بحالة status (published/draft/scheduled/archived) ============
-- profile_content, research_interests, scientific_axes*, research_papers*, publications, scientific_supervisions,
-- scientific_discussions, research_projects, courses, lectures, news, scientific_insights, calendar_events
-- (* research_papers و scientific_axes موجودتين مسبقًا وتم إبقاؤهما بنفس المنطق أدناه لضمان التناسق)

create policy "published profile_content readable" on public.profile_content for select using (status = 'published' or public.is_admin());
create policy "admin manages profile_content" on public.profile_content for insert with check (public.is_admin());
create policy "admin updates profile_content" on public.profile_content for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes profile_content" on public.profile_content for delete using (public.is_admin());

create policy "published research_interests readable" on public.research_interests for select using (status = 'published' or public.is_admin());
create policy "admin manages research_interests" on public.research_interests for insert with check (public.is_admin());
create policy "admin updates research_interests" on public.research_interests for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes research_interests" on public.research_interests for delete using (public.is_admin());

create policy "published axes readable" on public.scientific_axes for select using (status = 'published' or public.is_admin());
create policy "admin manages axes" on public.scientific_axes for insert with check (public.is_admin());
create policy "admin updates axes" on public.scientific_axes for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes axes" on public.scientific_axes for delete using (public.is_admin());

create policy "published research readable" on public.research_papers for select using (status = 'published' or public.is_admin());
create policy "admin manages research" on public.research_papers for insert with check (public.is_admin());
create policy "admin updates research" on public.research_papers for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes research" on public.research_papers for delete using (public.is_admin());

create policy "published publications readable" on public.publications for select using (status = 'published' or public.is_admin());
create policy "admin manages publications" on public.publications for insert with check (public.is_admin());
create policy "admin updates publications" on public.publications for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes publications" on public.publications for delete using (public.is_admin());

create policy "published supervisions readable" on public.scientific_supervisions for select using (status = 'published' or public.is_admin());
create policy "admin manages supervisions" on public.scientific_supervisions for insert with check (public.is_admin());
create policy "admin updates supervisions" on public.scientific_supervisions for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes supervisions" on public.scientific_supervisions for delete using (public.is_admin());

create policy "published discussions readable" on public.scientific_discussions for select using (status = 'published' or public.is_admin());
create policy "admin manages discussions" on public.scientific_discussions for insert with check (public.is_admin());
create policy "admin updates discussions" on public.scientific_discussions for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes discussions" on public.scientific_discussions for delete using (public.is_admin());

create policy "published projects readable" on public.research_projects for select using (status = 'published' or public.is_admin());
create policy "admin manages projects" on public.research_projects for insert with check (public.is_admin());
create policy "admin updates projects" on public.research_projects for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes projects" on public.research_projects for delete using (public.is_admin());

create policy "published courses readable" on public.courses for select using (status = 'published' or public.is_admin());
create policy "admin manages courses" on public.courses for insert with check (public.is_admin());
create policy "admin updates courses" on public.courses for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes courses" on public.courses for delete using (public.is_admin());

create policy "published lectures readable" on public.lectures for select using (status = 'published' or public.is_admin());
create policy "admin manages lectures" on public.lectures for insert with check (public.is_admin());
create policy "admin updates lectures" on public.lectures for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes lectures" on public.lectures for delete using (public.is_admin());

create policy "published news readable" on public.news for select using (status = 'published' or public.is_admin());
create policy "admin manages news" on public.news for insert with check (public.is_admin());
create policy "admin updates news" on public.news for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes news" on public.news for delete using (public.is_admin());

create policy "published insights readable" on public.scientific_insights for select using (status = 'published' or public.is_admin());
create policy "admin manages insights" on public.scientific_insights for insert with check (public.is_admin());
create policy "admin updates insights" on public.scientific_insights for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes insights" on public.scientific_insights for delete using (public.is_admin());

create policy "published calendar readable" on public.calendar_events for select using (status = 'published' or public.is_admin());
create policy "admin manages calendar" on public.calendar_events for insert with check (public.is_admin());
create policy "admin updates calendar" on public.calendar_events for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes calendar" on public.calendar_events for delete using (public.is_admin());

-- ============ announcements (نشط عبر is_active + تاريخ بدل status) ============
create policy "active announcements readable" on public.announcements for select
  using (
    public.is_admin()
    or (is_active = true
        and (active_from is null or active_from <= now())
        and (active_until is null or active_until >= now()))
  );
create policy "admin manages announcements" on public.announcements for insert with check (public.is_admin());
create policy "admin updates announcements" on public.announcements for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes announcements" on public.announcements for delete using (public.is_admin());

-- ============ project_related_items / content_axis_links (جداول ربط) ============
-- قراءة عامة (لا تكشف بيانات حساسة، مجرد روابط)، وإدارة للأدمن فقط.
create policy "related items readable" on public.project_related_items for select using (true);
create policy "admin manages related items" on public.project_related_items for insert with check (public.is_admin());
create policy "admin updates related items" on public.project_related_items for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes related items" on public.project_related_items for delete using (public.is_admin());

create policy "axis links readable" on public.content_axis_links for select using (true);
create policy "admin manages axis links" on public.content_axis_links for insert with check (public.is_admin());
create policy "admin updates axis links" on public.content_axis_links for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes axis links" on public.content_axis_links for delete using (public.is_admin());

-- ============ contact_submissions / contact_attachments ============
create policy "contact insert" on public.contact_submissions for insert with check (user_id is null or user_id = auth.uid());
create policy "own or admin contact read" on public.contact_submissions for select using (public.is_admin() or user_id = auth.uid());
create policy "admin contact update" on public.contact_submissions for update using (public.is_admin()) with check (public.is_admin());
create policy "admin contact delete" on public.contact_submissions for delete using (public.is_admin());

-- المرفقات حساسة: لا قراءة إلا للأدمن أو صاحب الطلب، والإدراج مرتبط بطلب تواصل قائم فعليًا.
create policy "attachment insert with submission" on public.contact_attachments for insert
  with check (
    exists (
      select 1 from public.contact_submissions s
      where s.id = submission_id
        and (s.user_id is null or s.user_id = auth.uid())
    )
  );
create policy "own or admin attachment read" on public.contact_attachments for select
  using (
    public.is_admin()
    or exists (select 1 from public.contact_submissions s where s.id = submission_id and s.user_id = auth.uid())
  );
create policy "admin attachment delete" on public.contact_attachments for delete using (public.is_admin());

-- ============ favorites ============
create policy "own favorites" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============ عدادات التفاعل: content_views / content_downloads / content_shares ============
-- لا تُقرأ من العميل مباشرة (تُجمّع عبر views/functions للأدمن)، والإدراج مقيد بألا ينتحل المستخدم هوية غيره.
create policy "admin reads views" on public.content_views for select using (public.is_admin());
create policy "insert own view" on public.content_views for insert with check (user_id is null or user_id = auth.uid());

create policy "admin reads downloads" on public.content_downloads for select using (public.is_admin());
create policy "insert own download" on public.content_downloads for insert with check (user_id is null or user_id = auth.uid());

create policy "admin reads shares" on public.content_shares for select using (public.is_admin());
create policy "insert own share" on public.content_shares for insert with check (user_id is null or user_id = auth.uid());

-- ملاحظة أمنية: RLS تمنع انتحال user_id فقط. لمنع تزوير العداد عبر إدراج متكرر من نفس الزائر
-- يجب أيضًا تطبيق Rate limiting/Unique-per-session على مستوى Edge Function أو trigger إضافي (موصى به في 29_INTERACTIONS_ANALYTICS_SPEC.md).

-- ============ media ============
-- بيانات وصفية غير حساسة ومرتبطة بمحتوى منشور أصلًا؛ قراءة عامة، إدارة للأدمن.
create policy "media readable" on public.media for select using (true);
create policy "admin manages media" on public.media for insert with check (public.is_admin());
create policy "admin updates media" on public.media for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes media" on public.media for delete using (public.is_admin());

-- ============ audit_logs ============
-- لا insert/update/delete من العميل إطلاقًا؛ الكتابة فقط عبر دوال SECURITY DEFINER من السيرفر.
create policy "admin reads audit logs" on public.audit_logs for select using (public.is_admin());
