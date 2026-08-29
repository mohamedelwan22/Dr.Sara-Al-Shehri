-- 028_extend_scientific_production.sql
-- التوسع في جداول الإنتاج العلمي (الأبحاث والمؤلفات) لإضافة صورة الغلاف ونوع البحث والترتيب والتميز

ALTER TABLE public.research_papers
  ADD COLUMN IF NOT EXISTS image_path text,
  ADD COLUMN IF NOT EXISTS research_type text,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

ALTER TABLE public.publications
  ADD COLUMN IF NOT EXISTS image_path text,
  ADD COLUMN IF NOT EXISTS research_type text,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

-- Create index for sorting and featured items
CREATE INDEX IF NOT EXISTS idx_research_papers_sort_featured ON public.research_papers(sort_order, featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_publications_sort_featured ON public.publications(sort_order, featured, created_at DESC);
