-- 019_admin_roles.sql
-- Secure admin role management.
--  - admin_set_user_role(): SECURITY DEFINER RPC, guarded by is_admin(), enforces the
--    "never remove the last admin" invariant atomically, writes to public.user_roles.
--  - user_roles_protect_last_admin(): BEFORE UPDATE/DELETE trigger that hard-enforces the
--    same invariant at the DB level for ANY write path (service_role/dashboard included),
--    so RLS alone is never the only protection.
-- Mirrors the SECURITY DEFINER + is_admin() pattern from 003/009/017. No service key in the browser.

create or replace function public.admin_set_user_role(p_user_id uuid, p_role public.app_role)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  other_admins int;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  -- لا يمكن إنزال آخر مشرف (سواء كان هو الهدف نفسه أو غيره).
  if p_role <> 'admin' then
    select count(*) into other_admins
      from public.user_roles
     where role = 'admin'
       and user_id <> p_user_id;
    if other_admins = 0 then
      raise exception 'last_admin';
    end if;
  end if;

  insert into public.user_roles (user_id, role)
  values (p_user_id, p_role)
  on conflict (user_id)
  do update set role = excluded.role;

  return jsonb_build_object('user_id', p_user_id, 'role', p_role);
end $$;

grant execute on function public.admin_set_user_role(uuid, public.app_role) to authenticated;

create or replace function public.user_roles_protect_last_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  other_admins int;
begin
  -- الحماية تنطبق فقط عند تعديل/حذف صف كان دوره admin.
  if old.role = 'admin' then
    select count(*) into other_admins
      from public.user_roles
     where role = 'admin'
       and user_id <> old.user_id;
    if other_admins = 0 then
      raise exception 'last_admin';
    end if;
  end if;
  return coalesce(new, old);
end $$;

drop trigger if exists trg_user_roles_protect_last_admin on public.user_roles;
create trigger trg_user_roles_protect_last_admin
before update or delete on public.user_roles
for each row execute function public.user_roles_protect_last_admin();
