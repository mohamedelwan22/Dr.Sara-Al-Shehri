-- 015_phase_4_profile_section_keys.sql
-- Phase 4: reconcile legacy profile_content section keys with the admin editor.
--
-- The public Privacy/Terms pages render profile_content sections `privacy` and `terms`,
-- and the admin profile editor uses `mission` for the mission statement. However the
-- original seed (008_seed_content.sql) wrote those rows under the legacy keys
-- `scientific-mission`, `privacy-policy` and `terms-of-use`.
--
-- This migration merges each legacy row into its canonical key WITHOUT overwriting
-- content the admin may already have saved under the canonical key (do nothing on
-- conflict), then removes the legacy rows.
--
-- Idempotent: after the first run the legacy rows no longer exist, so re-running is a no-op.

do $$
declare
  src record;
  target_key text;
begin
  for src in
    select section, title_ar, title_en, body_ar, body_en, status, published_at
    from public.profile_content
    where section in ('scientific-mission', 'privacy-policy', 'terms-of-use')
  loop
    target_key := case src.section
      when 'scientific-mission' then 'mission'
      when 'privacy-policy' then 'privacy'
      when 'terms-of-use' then 'terms'
    end;

    insert into public.profile_content(section, title_ar, title_en, body_ar, body_en, status, published_at)
    values (target_key, src.title_ar, src.title_en, src.body_ar, src.body_en, src.status, src.published_at)
    on conflict (section) do nothing;
  end loop;
end $$;

delete from public.profile_content
where section in ('scientific-mission', 'privacy-policy', 'terms-of-use');
