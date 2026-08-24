-- 022: Extend research_projects with comprehensive CMS fields
-- Adds researcher/academic info, descriptions, scientific fields, media, display controls

ALTER TABLE public.research_projects
  -- Short description for cards
  ADD COLUMN IF NOT EXISTS short_description_ar text,
  ADD COLUMN IF NOT EXISTS short_description_en text,

  -- Project type (flexible free text, NOT an enum)
  ADD COLUMN IF NOT EXISTS project_type text,

  -- People & academic info
  ADD COLUMN IF NOT EXISTS researcher_ar text,
  ADD COLUMN IF NOT EXISTS researcher_en text,
  ADD COLUMN IF NOT EXISTS university_ar text,
  ADD COLUMN IF NOT EXISTS university_en text,
  ADD COLUMN IF NOT EXISTS faculty_ar text,
  ADD COLUMN IF NOT EXISTS faculty_en text,
  ADD COLUMN IF NOT EXISTS department_ar text,
  ADD COLUMN IF NOT EXISTS department_en text,
  ADD COLUMN IF NOT EXISTS supervisor_ar text,
  ADD COLUMN IF NOT EXISTS supervisor_en text,
  ADD COLUMN IF NOT EXISTS academic_degree text,
  ADD COLUMN IF NOT EXISTS participation_type text,

  -- Scientific content
  ADD COLUMN IF NOT EXISTS objectives_ar text,
  ADD COLUMN IF NOT EXISTS objectives_en text,
  ADD COLUMN IF NOT EXISTS methodology_ar text,
  ADD COLUMN IF NOT EXISTS methodology_en text,
  ADD COLUMN IF NOT EXISTS outcomes_ar text,
  ADD COLUMN IF NOT EXISTS outcomes_en text,
  ADD COLUMN IF NOT EXISTS keywords text,

  -- Media
  ADD COLUMN IF NOT EXISTS image_path text,

  -- Display controls
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_research_projects_sort_order ON public.research_projects(sort_order DESC NULLS LAST);

-- Index for featured filtering
CREATE INDEX IF NOT EXISTS idx_research_projects_featured ON public.research_projects(featured) WHERE featured = true;

-- Index for project_type filtering
CREATE INDEX IF NOT EXISTS idx_research_projects_type ON public.research_projects(project_type);
