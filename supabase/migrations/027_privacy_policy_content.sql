-- 027_privacy_policy_content.sql
-- Privacy Policy Dynamic CMS Schema & Seed Data

CREATE TABLE IF NOT EXISTS public.privacy_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_number TEXT NOT NULL DEFAULT '01',
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  content_en TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Shield',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.privacy_sections ENABLE ROW LEVEL SECURITY;

-- Public read policy
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'privacy_sections' AND policyname = 'Public privacy sections viewable'
  ) THEN
    CREATE POLICY "Public privacy sections viewable" ON public.privacy_sections
      FOR SELECT USING (is_active = true OR (auth.role() = 'authenticated' AND public.is_admin()));
  END IF;
END $$;

-- Admin write policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'privacy_sections' AND policyname = 'Admins insert privacy sections'
  ) THEN
    CREATE POLICY "Admins insert privacy sections" ON public.privacy_sections
      FOR INSERT WITH CHECK (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'privacy_sections' AND policyname = 'Admins update privacy sections'
  ) THEN
    CREATE POLICY "Admins update privacy sections" ON public.privacy_sections
      FOR UPDATE USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'privacy_sections' AND policyname = 'Admins delete privacy sections'
  ) THEN
    CREATE POLICY "Admins delete privacy sections" ON public.privacy_sections
      FOR DELETE USING (public.is_admin());
  END IF;
END $$;

-- Index
CREATE INDEX IF NOT EXISTS idx_privacy_sections_sort ON public.privacy_sections(sort_order, created_at);

-- Seed general privacy_info site setting
INSERT INTO public.site_settings (key, value, is_public)
VALUES (
  'privacy_info',
  '{
    "title_ar": "سياسة الخصوصية",
    "title_en": "Privacy Policy",
    "subtitle_ar": "ترحب منصة أ.د. سارة بنت عزيز الشهري بزواره، وتلتزم بالمحافظة على خصوصية مستخدمي الموقع وسرية بياناتهم، وتوضح هذه السياسة آلية جمع المعلومات واستخدامها وحمايتها.",
    "subtitle_en": "Prof. Sara Al-Shehri platform welcomes its visitors and is committed to preserving privacy and confidentiality, outlining data collection and protection mechanisms.",
    "quote_ar": "خصوصيتك تهمنا، ونلتزم بحمايتها والحفاظ عليها.",
    "quote_en": "Your privacy matters to us, and we are committed to protecting and preserving it.",
    "artwork_url": "/images/policy.png"
  }',
  true
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Seed the 5 dynamic privacy sections if none exist
INSERT INTO public.privacy_sections (section_number, title_ar, title_en, content_ar, content_en, icon, sort_order, is_active)
SELECT '01',
  'أولاً: البيانات التي يتم جمعها',
  'First: Collected Data',
  'قد يجمع الموقع بعض البيانات التي يقدمها المستخدم عند التسجيل أو التواصل، مثل:
• الاسم.
• البريد الإلكتروني.
• الجهة أو الجامعة.
• المعلومات التي يختار المستخدم إرسالها من خلال نماذج التواصل.

كما قد تُجمع بيانات تقنية تلقائيًا، مثل:
• عنوان بروتوكول الإنترنت (IP).
• نوع المتصفح.
• نظام التشغيل.
• الصفحات التي تمت زيارتها داخل الموقع.',
  'The website may collect certain data provided by the user upon registration or contact, such as:
• Name.
• Email address.
• Organization or University.
• Information sent through contact forms.

Technical data may also be collected automatically, such as:
• IP address.
• Browser type.
• Operating system.
• Pages visited within the platform.',
  'ClipboardList',
  1,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.privacy_sections WHERE section_number = '01');

INSERT INTO public.privacy_sections (section_number, title_ar, title_en, content_ar, content_en, icon, sort_order, is_active)
SELECT '02',
  'ثانياً: استخدام البيانات',
  'Second: Data Usage',
  'تُستخدم البيانات للأغراض الآتية:
• الرد على الاستفسارات والمراسلات.
• تحسين تجربة استخدام الموقع.
• تطوير الخدمات والمحتوى العلمي.
• إرسال الإشعارات المتعلقة بالخدمات أو الأنشطة العلمية للموقع عند موافقة المستخدم.',
  'Data is used for the following purposes:
• Responding to inquiries and correspondence.
• Improving user experience.
• Developing services and scientific content.
• Sending notifications regarding scientific activities with user consent.',
  'Target',
  2,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.privacy_sections WHERE section_number = '02');

INSERT INTO public.privacy_sections (section_number, title_ar, title_en, content_ar, content_en, icon, sort_order, is_active)
SELECT '03',
  'ثالثاً: حماية المعلومات',
  'Third: Information Protection',
  'يحرص الموقع على اتخاذ الإجراءات التقنية والتنظيمية المناسبة لحماية البيانات الشخصية من الوصول غير المصرح به أو الاستخدام أو الإفصاح غير المشروع.',
  'The platform takes appropriate technical and organizational measures to protect personal data from unauthorized access, use, or disclosure.',
  'ShieldCheck',
  3,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.privacy_sections WHERE section_number = '03');

INSERT INTO public.privacy_sections (section_number, title_ar, title_en, content_ar, content_en, icon, sort_order, is_active)
SELECT '04',
  'رابعاً: مشاركة البيانات',
  'Fourth: Data Sharing',
  'لا يتم بيع أو مشاركة أو تأجير البيانات الشخصية لأي جهة خارجية، إلا إذا اقتضى ذلك التزام نظامي أو وافق المستخدم على ذلك صراحة.',
  'Personal data is not sold, shared, or rented to any third parties, unless required by legal obligations or explicitly consented to by the user.',
  'Users',
  4,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.privacy_sections WHERE section_number = '04');

INSERT INTO public.privacy_sections (section_number, title_ar, title_en, content_ar, content_en, icon, sort_order, is_active)
SELECT '05',
  'خامساً: تعديل السياسة',
  'Fifth: Policy Amendments',
  'يحتفظ الموقع بحق تحديث سياسة الخصوصية عند الحاجة، ويصبح التعديل نافذًا بمجرد نشره في هذه الصفحة.',
  'The platform reserves the right to update this Privacy Policy as needed. Amendments become effective immediately upon publication on this page.',
  'FileEdit',
  5,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.privacy_sections WHERE section_number = '05');
