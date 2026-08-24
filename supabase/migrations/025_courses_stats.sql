-- 025_courses_stats.sql
-- Real, database-driven statistics for the Courses & Lectures public page.
-- Replaces the manually-entered `courses_stats` site_setting (fake beneficiaries/certificates)
-- with a SECURITY DEFINER aggregate RPC that computes live counts/sums from real tables.
-- No service key in the browser; RLS is bypassed only inside the function body.

-- 1) Remove the now-unused manually configured fake statistics row.
DELETE FROM public.site_settings WHERE key = 'courses_stats';

-- 2) Aggregate real statistics for published courses & lectures + recorded views.
--    Publication rule reused: only `status = 'published'` rows are counted
--    (matches the existing public list/query logic in courseService.listDated).
--    Views come from the existing content_views interaction table
--    (content_type values 'course' / 'lecture' as used by interactionService.recordView).
--    Participants/Certificates are reported as 0 because no real registration or
--    certificate system exists in this database (honest zero, never a fabricated number).
CREATE OR REPLACE FUNCTION public.get_courses_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_courses integer;
  v_lectures integer;
  v_hours numeric;
  v_views bigint;
BEGIN
  SELECT count(*) INTO v_courses FROM public.courses WHERE status = 'published';
  SELECT count(*) INTO v_lectures FROM public.lectures WHERE status = 'published';

  SELECT coalesce(sum(duration_hours), 0) INTO v_hours
  FROM (
    SELECT duration_hours FROM public.courses WHERE status = 'published'
    UNION ALL
    SELECT duration_hours FROM public.lectures WHERE status = 'published'
  ) t;

  SELECT count(*) INTO v_views
  FROM public.content_views
  WHERE content_type IN ('course', 'lecture');

  RETURN jsonb_build_object(
    'total_courses',        v_courses,
    'total_lectures',       v_lectures,
    'total_items',          v_courses + v_lectures,
    'total_training_hours', v_hours,
    'total_views',          v_views,
    'total_participants',   0,
    'total_certificates',   0
  );
END $$;

GRANT EXECUTE ON FUNCTION public.get_courses_stats() TO anon, authenticated;
