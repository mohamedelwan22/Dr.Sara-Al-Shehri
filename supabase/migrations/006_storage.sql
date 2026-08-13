-- 006_storage.sql
insert into storage.buckets(id,name,public) values
('public-media','public-media',true),
('research-documents','research-documents',false),
('publication-documents','publication-documents',false),
('course-assets','course-assets',false),
('project-documents','project-documents',false),
('contact-attachments','contact-attachments',false),
('branding-assets','branding-assets',true)
on conflict(id) do nothing;

-- ============ سياسات storage.objects (كاملة لكل bucket) ============
-- ملاحظة عامة: service_role يتجاوز RLS تلقائيًا ولا يُستخدم أبدًا من المتصفح.

-- ملاحظة: storage.objects جدول مُدار من Supabase و RLS مفعّل عليه افتراضيًا في كل المشاريع (محليًا ومستضافًا).
-- لا يمكن لمستخدم الهجرة (postgres) تنفيذ: alter table storage.objects enable row level security
-- لأن تعديل ملكية الجداول المُدارة يتطلب أن يكون المُنفّذ مالكًا للجدول، فيفشل بـ:
--   ERROR: must be owner of table objects (SQLSTATE 42501)
-- لذلك نكتفي بالتحقق (قراءة من الكتالوج) من أن RLS مفعّل فعلًا، دون إعادة محاولة تفعيله.
do $$
begin
  if not exists (
    select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'storage' and c.relname = 'objects' and c.relrowsecurity
  ) then
    raise exception 'storage.objects RLS is not enabled; enable it from the Supabase dashboard before continuing';
  end if;
end $$;

-- ---- Buckets عامة: public-media, branding-assets ----
create policy "public buckets readable" on storage.objects for select
  using (bucket_id in ('public-media','branding-assets'));

create policy "admin writes public buckets" on storage.objects for insert
  with check (bucket_id in ('public-media','branding-assets') and public.is_admin());

create policy "admin updates public buckets" on storage.objects for update
  using (bucket_id in ('public-media','branding-assets') and public.is_admin())
  with check (bucket_id in ('public-media','branding-assets') and public.is_admin());

create policy "admin deletes public buckets" on storage.objects for delete
  using (bucket_id in ('public-media','branding-assets') and public.is_admin());

-- ---- Buckets خاصة تديرها الإدارة فقط: research-documents, publication-documents, course-assets, project-documents ----
create policy "admin reads private content buckets" on storage.objects for select
  using (bucket_id in ('research-documents','publication-documents','course-assets','project-documents')
         and public.is_admin());

create policy "admin writes private content buckets" on storage.objects for insert
  with check (bucket_id in ('research-documents','publication-documents','course-assets','project-documents')
              and public.is_admin());

create policy "admin updates private content buckets" on storage.objects for update
  using (bucket_id in ('research-documents','publication-documents','course-assets','project-documents')
         and public.is_admin())
  with check (bucket_id in ('research-documents','publication-documents','course-assets','project-documents')
              and public.is_admin());

create policy "admin deletes private content buckets" on storage.objects for delete
  using (bucket_id in ('research-documents','publication-documents','course-assets','project-documents')
         and public.is_admin());

-- التنزيل الفعلي للزوار/المسجلين لملفات هذه الـ buckets يتم حصرًا عبر Signed URL
-- تُنشأ من دالة سيرفر (Edge Function بصلاحية service_role) بعد التحقق من أن العنصر المرتبط status='published'.
-- بهذا لا تُمنح صلاحية SELECT مباشرة للعميل على bucket خاص، ويظل التحكم الكامل مركزيًا وقابلًا للتدقيق.

-- ---- Bucket contact-attachments (حساس: مرفقات نموذج التواصل) ----
-- الرفع مسموح لأي زائر/مستخدم (لأن نموذج التواصل قد يكون قبل تسجيل الدخول)،
-- لكن القراءة والحذف للأدمن فقط، وربط الملف بالطلب يتم عبر جدول contact_attachments (انظر 005_rls.sql).
create policy "anyone uploads contact attachment" on storage.objects for insert
  with check (bucket_id = 'contact-attachments');

create policy "admin reads contact attachments" on storage.objects for select
  using (bucket_id = 'contact-attachments' and public.is_admin());

create policy "admin deletes contact attachments" on storage.objects for delete
  using (bucket_id = 'contact-attachments' and public.is_admin());

-- ملاحظات تنفيذ إلزامية (يجب تطبيقها في طبقة التطبيق/Edge Functions، RLS وحدها لا تكفي لها):
-- 1) التحقق من نوع الملف (PDF فقط لمرفقات التواصل) والحجم الأقصى قبل الرفع.
-- 2) توليد اسم ملف عشوائي (UUID) بدل الاسم الأصلي لمنع تخمين المسارات.
-- 3) أي تنزيل لملف من bucket خاص يمر عبر signed URL محدود الصلاحية الزمنية فقط.
