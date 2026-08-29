-- 029_scientific_selections.sql
-- جدول المختارات العلمية (أبحاث مختارة، مؤلفات مختارة، رسائل علمية متميزة)

CREATE TABLE IF NOT EXISTS public.scientific_selections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  section text NOT NULL CHECK (section IN ('selected_research', 'selected_publications', 'distinguished_theses')),
  title_ar text NOT NULL,
  title_en text,
  subtitle_ar text,
  subtitle_en text,
  author_ar text,
  author_en text,
  university_ar text,
  university_en text,
  journal_ar text,
  journal_en text,
  publication_year text,
  grant_year text,
  summary_ar text,
  summary_en text,
  image_path text,
  document_path text,
  read_url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast section querying and sorting
CREATE INDEX IF NOT EXISTS idx_scientific_selections_section_sort 
  ON public.scientific_selections(section, sort_order ASC, created_at DESC);

-- Trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_scientific_selections_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_scientific_selections_updated_at ON public.scientific_selections;
CREATE TRIGGER trg_scientific_selections_updated_at
  BEFORE UPDATE ON public.scientific_selections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_scientific_selections_timestamp();

-- RLS Policies
ALTER TABLE public.scientific_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public selections readable" 
  ON public.scientific_selections FOR SELECT 
  USING (is_active = true OR public.is_admin());

CREATE POLICY "admin manages selections insert" 
  ON public.scientific_selections FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "admin manages selections update" 
  ON public.scientific_selections FOR UPDATE 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());

CREATE POLICY "admin manages selections delete" 
  ON public.scientific_selections FOR DELETE 
  USING (public.is_admin());

-- Initial seed data representing reference items
INSERT INTO public.scientific_selections (
  section,
  title_ar,
  author_ar,
  university_ar,
  journal_ar,
  publication_year,
  grant_year,
  summary_ar,
  sort_order,
  is_active
) VALUES 
(
  'selected_research',
  'الخصائص المتنية والإسنادية للأحاديث التي انفرد بها البخاري في صحيحه عن مسلم في الجامع الصحيح: دراسة نظرية تطبيقية',
  'أ.د. سارة بنت عزيز الشهري',
  'جامعة الإمام عبدالرحمن بن فيصل',
  'مجلة جامعة الإمام للعلوم الشرعية',
  '2024م - 1446هـ',
  NULL,
  'دراسة استقراءية تهدف إلى الكشف عن السمات الإسنادية والمتنية اللطيفة التي تميزت بها مرويات الجامع الصحيح للإمام البخاري مقارنة بصحيح الإمام مسلم، مع دراسة تطبيقية على النماذج المنتخبة.',
  1,
  true
),
(
  'selected_publications',
  'العلل في الحديث النبوي',
  'أ.د. سارة بنت عزيز الشهري',
  'جامعة الإمام عبدالرحمن بن فيصل',
  NULL,
  '1446هـ - 2024م',
  NULL,
  'كتاب علمي محكم يتناول منهج المحدثين في كشف علل الحديث النبوي وتطبيقاته العملية، متضمناً القواعد الضابطة والمفاهيم النظرية والتطبيقية.',
  1,
  true
),
(
  'distinguished_theses',
  'الأحاديث التي ذكر البزار علتها جمعا وتخريجا ودراسة من أول مسند أبي بكر إلى نهاية مسند عبدالرحمن بن عوف رضي الله عنهما',
  'سارة بنت عزيز الشهري',
  'جامعة الإمام عبدالرحمن بن فيصل',
  NULL,
  NULL,
  '1430هـ - 2009م',
  'رسالة مقدمة لنيل درجة الدكتوراه في الحديث وعلومه، تعنى بجمع وتخريج ودراسة الأحاديث المعلولة في مسند البزار وفق قواعد النقد الحديثي الأصيل.',
  1,
  true
)
ON CONFLICT DO NOTHING;
