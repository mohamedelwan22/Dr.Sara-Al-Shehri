-- 016_phase_4_content_links_files.sql
-- Phase 4: additive content fields for the admin content-management scope.
--
--   * courses / lectures: registration/meeting/video URLs, image, materials file, end time
--   * announcements: Arabic/English body (title-only until now)
--   * calendar_events: external link + Arabic/English description
--
-- All changes are additive and idempotent (`add column if not exists`).
-- RLS stays row-level (existing policies cover new columns), and storage needs no change.

alter table public.courses
  add column if not exists registration_url text,
  add column if not exists meeting_url text,
  add column if not exists video_url text,
  add column if not exists image_path text,
  add column if not exists materials_path text,
  add column if not exists ends_at timestamptz;

alter table public.lectures
  add column if not exists registration_url text,
  add column if not exists meeting_url text,
  add column if not exists video_url text,
  add column if not exists image_path text,
  add column if not exists materials_path text,
  add column if not exists ends_at timestamptz;

alter table public.announcements
  add column if not exists body_ar text,
  add column if not exists body_en text;

alter table public.calendar_events
  add column if not exists link_url text,
  add column if not exists description_ar text,
  add column if not exists description_en text;
