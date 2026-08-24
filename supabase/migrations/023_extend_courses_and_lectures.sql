-- 023_extend_courses_and_lectures.sql
-- Extend courses and lectures tables with CMS fields matching academic platform design requirements.
-- Idempotent and non-destructive.

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS short_description_ar text,
  ADD COLUMN IF NOT EXISTS short_description_en text,
  ADD COLUMN IF NOT EXISTS instructor_ar text,
  ADD COLUMN IF NOT EXISTS instructor_en text,
  ADD COLUMN IF NOT EXISTS duration_ar text,
  ADD COLUMN IF NOT EXISTS duration_en text,
  ADD COLUMN IF NOT EXISTS duration_hours numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS delivery_mode text,
  ADD COLUMN IF NOT EXISTS event_status text,
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

ALTER TABLE public.lectures
  ADD COLUMN IF NOT EXISTS short_description_ar text,
  ADD COLUMN IF NOT EXISTS short_description_en text,
  ADD COLUMN IF NOT EXISTS instructor_ar text,
  ADD COLUMN IF NOT EXISTS instructor_en text,
  ADD COLUMN IF NOT EXISTS duration_ar text,
  ADD COLUMN IF NOT EXISTS duration_en text,
  ADD COLUMN IF NOT EXISTS duration_hours numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS delivery_mode text,
  ADD COLUMN IF NOT EXISTS event_status text,
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Indexes for performance and sorting
CREATE INDEX IF NOT EXISTS idx_courses_activity_date ON public.courses(activity_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_courses_sort_order ON public.courses(sort_order DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON public.courses(featured) WHERE featured = true;

CREATE INDEX IF NOT EXISTS idx_lectures_activity_date ON public.lectures(activity_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_lectures_sort_order ON public.lectures(sort_order DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_lectures_featured ON public.lectures(featured) WHERE featured = true;
