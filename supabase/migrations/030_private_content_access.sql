-- 030_private_content_access.sql
-- Allows AUTHENTICATED (logged-in, non-admin) users to read objects inside the
-- private content buckets so they can generate signed URLs to view/download
-- published research documents, publications, course materials, and projects.
--
-- Security model preserved:
--   * Buckets stay PRIVATE (public=false) -> no public URL, no anonymous listing.
--   * Anonymous visitors still have NO read access (they get "unauthorized").
--   * Admins keep full CRUD (existing policies from 006_storage.sql).
--   * Authenticated users gain only SELECT (read) -> can produce client signed URLs;
--     they CANNOT upload/update/delete (those remain admin-only).
--
-- Idempotent: safe to re-run.

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'authenticated readers of private content buckets'
  ) then
    execute 'create policy "authenticated readers of private content buckets"
      on storage.objects for select
      using (
        bucket_id in (''research-documents'',''publication-documents'',''course-assets'',''project-documents'')
        and auth.role() = ''authenticated''
      )';
  end if;
end $$;
