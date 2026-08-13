-- 014_phase_3_storage_fixes.sql
-- Phase 3 final verification: storage configuration fixes.
--
-- Issue investigated: admin image upload (MediaPage -> public-media bucket) could
-- succeed at upload (admin write is allowed) yet fail to preview/persist visibly when
-- the bucket is not correctly marked public or carries restrictive MIME/size limits.
-- public-media / branding-assets are INTENDED to be public (site media: logos, hero,
-- gallery images, public PDFs). This migration idempotently enforces that config so
-- admin uploads are accessible through the intended public security model.
--
-- It does NOT touch private buckets (contact-attachments, *-documents, course-assets,
-- project-documents) — those remain private and are accessed via signed URLs / Edge
-- Functions, in line with the security model.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'storage' and table_name = 'buckets'
      and column_name = 'allowed_mime_types'
  ) then
    update storage.buckets
      set public = true,
          allowed_mime_types = null,
          file_size_limit = 15728640  -- 15 MB
      where id in ('public-media', 'branding-assets');
  else
    update storage.buckets
      set public = true
      where id in ('public-media', 'branding-assets');
  end if;
end $$;
