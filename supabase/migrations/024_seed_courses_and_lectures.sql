-- 024_seed_courses_and_lectures.sql
-- Seed rich real academic courses & lectures data into public.courses and public.lectures.

INSERT INTO public.courses (
  id, title_ar, title_en, slug, short_description_ar, description_ar, instructor_ar, duration_ar, duration_hours, level, delivery_mode, event_status, activity_date, registration_url, status, featured, sort_order
) VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  'مهارات البحث العلمي في الدراسات الإسلامية',
  'Research Skills in Islamic Studies',
  'research-skills-islamic-studies',
  'دورة تدريبية مخصصة لتمكين الباحثين والباحثات من أدوات البحث العلمي الأساسية في العلوم الشرعية والدراسات الإسلامية.',
  'تهدف هذه الدورة المكثفة إلى تطوير مهارات الباحثين في صياغة الإشكالية البحثية، واختيار المناهج الملائمة، وتوثيق المصادر التراثية والمعاصرة وفق الضوابط الأكاديمية.',
  'د. إيمان الحربي',
  '7 ساعات',
  7,
  'beginner',
  'in_person',
  'completed',
  '2024-05-12 09:00:00+00',
  'https://example.com/register/research-skills',
  'published',
  true,
  10
),
(
  'a0000000-0000-0000-0000-000000000002',
  'العلوم الحديثية وتطبيقاتها المعاصرة',
  'Hadith Sciences and Contemporary Applications',
  'hadith-sciences-applications',
  'دراسة تطبيقية معاصرة لقواعد نقد الحديث والتعامل مع الإشكاليات الحديثية المعاصرة وتوظيف الأدوات التقنية.',
  'تتناول الدورة المناهج الحديثية المتقدمة في معالجة الشبهات، ونقد الأسانيد والمتون باستعمال التقنيات الرقمية والذكاء الاصطناعي.',
  'د. فهد المطيري',
  '8 ساعات',
  8,
  'advanced',
  'online',
  'upcoming',
  '2025-06-15 10:00:00+00',
  'https://example.com/register/hadith-applications',
  'published',
  true,
  9
),
(
  'a0000000-0000-0000-0000-000000000003',
  'منهج الإمام البخاري في الصحيح',
  'Imam Al-Bukhari Methodology in Al-Sahih',
  'bukhari-methodology-sahih',
  'تسليط الضوء على خصائص شرط الإمام البخاري ودقته المنهجية في التبويب واستنباط الفوائد الحديثية والفقهية.',
  'شرح مفصل لطريقة استنباط الأحكام والعلل من تراجم أبواب صحيح البخاري، ودراسة نماذج تطبيقية من الأحاديث والتراجم.',
  'د. نورة السعيد',
  '6 ساعات',
  6,
  'intermediate',
  'online',
  'completed',
  '2024-10-07 09:00:00+00',
  'https://example.com/register/bukhari-methodology',
  'published',
  true,
  8
),
(
  'a0000000-0000-0000-0000-000000000004',
  'عقد الأسانيد ومجالاتها',
  'Isnad Chains and Applications',
  'isnad-chains-applications',
  'محاضرة تخصصية تعنى بعقد الأسانيد العالية ودراسة الطرق والطبقات عند المحدثين.',
  'تناول مهارات تتبع الطرق والطبقات وتمييز الرواة والمتون المتشابهة دراية ورواية.',
  'د. عبدالعزيز الهذلي',
  '4 ساعات',
  4,
  'advanced',
  'online',
  'completed',
  '2024-03-03 16:00:00+00',
  'https://example.com/register/isnad-chains',
  'published',
  false,
  7
),
(
  'a0000000-0000-0000-0000-000000000005',
  'كتابة البحث العلمي وترتيبه',
  'Academic Writing and Structuring',
  'academic-writing-structuring',
  'منهجية صياغة البحوث الأكاديمية وترتيب الفصول والمباحث وتوثيق المصادر والمراجع بالأسلوب العلمي المعتمد.',
  'دليل عملي لكتابة المقدمات والخاتمات والفهارس وتوثيق الهوامش طبقاً للدليل المعياري للجامعات.',
  'د. يوسف آل الشيخ',
  '5 ساعات',
  5,
  'beginner',
  'online',
  'completed',
  '2024-01-18 10:00:00+00',
  'https://example.com/register/academic-writing',
  'published',
  false,
  6
)
ON CONFLICT (slug) DO UPDATE SET
  title_ar = EXCLUDED.title_ar,
  short_description_ar = EXCLUDED.short_description_ar,
  description_ar = EXCLUDED.description_ar,
  instructor_ar = EXCLUDED.instructor_ar,
  duration_ar = EXCLUDED.duration_ar,
  duration_hours = EXCLUDED.duration_hours,
  level = EXCLUDED.level,
  delivery_mode = EXCLUDED.delivery_mode,
  event_status = EXCLUDED.event_status,
  activity_date = EXCLUDED.activity_date,
  status = EXCLUDED.status;

INSERT INTO public.lectures (
  id, title_ar, title_en, slug, short_description_ar, description_ar, instructor_ar, duration_ar, duration_hours, level, delivery_mode, event_status, activity_date, registration_url, status, featured, sort_order
) VALUES
(
  'b0000000-0000-0000-0000-000000000001',
  'محاضرة: عناية الأمة بالسنة النبوية',
  'Lecture: Care of the Ummah for the Prophetic Sunnah',
  'lecture-care-for-sunnah',
  'استعراض تاريخي ومنهجي لجهود الأمة الإسلامية عبر القرون في حفظ السنة النبوية وتدوينها ونقدها.',
  'محاضرة عامة تتناول معالم التدوين الحديثي ورحلات المحدثين في طلب العلم وحفظ النصوص من التحريف.',
  'د. أحمد الغامدي',
  'ساعتان',
  2,
  'general',
  'in_person',
  'upcoming',
  '2025-07-20 17:00:00+00',
  'https://example.com/register/care-for-sunnah',
  'published',
  true,
  5
)
ON CONFLICT (slug) DO UPDATE SET
  title_ar = EXCLUDED.title_ar,
  short_description_ar = EXCLUDED.short_description_ar,
  description_ar = EXCLUDED.description_ar,
  instructor_ar = EXCLUDED.instructor_ar,
  duration_ar = EXCLUDED.duration_ar,
  duration_hours = EXCLUDED.duration_hours,
  level = EXCLUDED.level,
  delivery_mode = EXCLUDED.delivery_mode,
  event_status = EXCLUDED.event_status,
  activity_date = EXCLUDED.activity_date,
  status = EXCLUDED.status;

INSERT INTO public.site_settings (key, value, is_public) VALUES
('courses_stats', '{"beneficiariesCount": 2150, "certificatesCount": 1500}', true)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
