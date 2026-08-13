-- create-admin.sql
-- Promote an existing platform user to admin.
--
-- Safe by design:
--   * Requires the user to ALREADY exist in auth.users (no admin self-creation).
--   * Idempotent — re-running is harmless (upserts the admin role).
--   * Only inserts the 'admin' app_role; it never exposes service_role.
--
-- HOW TO USE
--   1. Sign the account up through the app (or create it in Supabase Auth).
--   2. Open the Supabase SQL Editor.
--   3. Change the email below and run the whole script.
--   4. Sign in with that account — the /admin area will now be accessible.

do $$
declare
  v_user_id uuid;
  v_email text := 'admin@example.com'; -- <-- CHANGE THIS to the real email
begin
  select id into v_user_id from auth.users where email = v_email;

  if v_user_id is null then
    raise exception 'No auth user with email "%" was found. Create/sign up the account first.', v_email;
  end if;

  -- Ensure a profile row exists (normally created by the handle_new_user trigger).
  insert into public.profiles (id, display_name, locale)
  values (v_user_id, split_part(v_email, '@', 1), 'ar')
  on conflict (id) do nothing;

  -- Promote to admin (upsert).
  insert into public.user_roles (user_id, role)
  values (v_user_id, 'admin')
  on conflict (user_id) do update set role = 'admin';

  raise notice 'User % promoted to admin.', v_email;
end $$;
