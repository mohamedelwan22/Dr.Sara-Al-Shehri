-- 003_functions.sql
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.user_roles where user_id=auth.uid() and role='admin');
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.profiles(id,display_name) values(new.id, coalesce(new.raw_user_meta_data->>'display_name',''));
 insert into public.user_roles(user_id,role) values(new.id,'user');
 return new;
end $$;
