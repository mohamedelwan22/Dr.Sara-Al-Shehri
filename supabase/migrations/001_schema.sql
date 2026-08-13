-- 001_schema.sql
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type public.content_status as enum ('draft','published','scheduled','archived');
create type public.app_role as enum ('admin','user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text not null default 'ar' check (locale in ('ar','en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now()
);
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null, value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false, updated_at timestamptz not null default now()
);
create table public.profile_content (
  id uuid primary key default gen_random_uuid(),
  section text unique not null,
  title_ar text, title_en text, body_ar text, body_en text,
  status public.content_status not null default 'draft',
  published_at timestamptz, updated_at timestamptz not null default now()
);
create table public.research_interests (
  id uuid primary key default gen_random_uuid(), title_ar text not null, title_en text,
  description_ar text, description_en text, sort_order int not null default 0,
  status public.content_status not null default 'published', created_at timestamptz default now(), updated_at timestamptz default now()
);

create table public.scientific_axes (
  id uuid primary key default gen_random_uuid(), slug text unique not null,
  name_ar text not null, name_en text, description_ar text, description_en text,
  status public.content_status not null default 'published', sort_order int default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table public.research_papers (
 id uuid primary key default gen_random_uuid(), slug text unique not null, title_ar text not null, title_en text,
 author_ar text, author_en text, institution_ar text, institution_en text, publication_year int,
 abstract_ar text, abstract_en text, document_path text, status public.content_status not null default 'draft',
 published_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.publications (like public.research_papers including defaults including constraints);
alter table public.publications add primary key (id);

create table public.scientific_supervisions (
 id uuid primary key default gen_random_uuid(), slug text unique not null, title_ar text not null, title_en text,
 researcher_ar text, researcher_en text, university_ar text, university_en text, degree text,
 summary_ar text, summary_en text, completion_date date, status public.content_status default 'draft',
 published_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.scientific_discussions (like public.scientific_supervisions including defaults including constraints);
alter table public.scientific_discussions add primary key (id);

create table public.research_projects (
 id uuid primary key default gen_random_uuid(), slug text unique not null, title_ar text not null, title_en text,
 description_ar text, description_en text, project_status text, start_date date, end_date date,
 status public.content_status default 'draft', published_at timestamptz,
 created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.project_related_items (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.research_projects(id) on delete cascade,
 item_type text not null check(item_type in ('supervision','discussion')), item_id uuid not null,
 sort_order int default 0, unique(project_id,item_type,item_id)
);

create table public.courses (
 id uuid primary key default gen_random_uuid(), slug text unique not null, title_ar text not null, title_en text,
 description_ar text, description_en text, activity_date timestamptz, location_ar text, location_en text,
 status public.content_status default 'draft', published_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.lectures (like public.courses including defaults including constraints);
alter table public.lectures add primary key (id);

create table public.content_axis_links (
 id uuid primary key default gen_random_uuid(), axis_id uuid not null references public.scientific_axes(id) on delete cascade,
 content_type text not null check(content_type in ('research','publication','supervision','discussion','project','course','lecture')),
 content_id uuid not null, created_at timestamptz default now(), unique(axis_id,content_type,content_id)
);

create table public.news (
 id uuid primary key default gen_random_uuid(), slug text unique not null, title_ar text not null, title_en text,
 excerpt_ar text, excerpt_en text, body_ar text, body_en text, image_path text,
 status public.content_status default 'draft', published_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.announcements (
 id uuid primary key default gen_random_uuid(), title_ar text not null, title_en text, link_url text, icon text,
 active_from timestamptz, active_until timestamptz, sort_order int default 0, is_active boolean default true,
 created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.scientific_insights (like public.news including defaults including constraints);
alter table public.scientific_insights add primary key (id);

create table public.calendar_events (
 id uuid primary key default gen_random_uuid(), title_ar text not null, title_en text, event_type text not null,
 starts_at timestamptz not null, ends_at timestamptz, location_ar text, location_en text,
 source_type text, source_id uuid, status public.content_status default 'published',
 created_at timestamptz default now(), updated_at timestamptz default now()
);

create table public.contact_submissions (
 id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
 type text not null, name text, email text, phone text, message text not null,
 payload jsonb not null default '{}'::jsonb, status text not null default 'new',
 internal_notes text, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.contact_attachments (
 id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.contact_submissions(id) on delete cascade,
 storage_path text not null, mime_type text not null, size_bytes bigint not null, created_at timestamptz default now()
);

create table public.favorites (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 content_type text not null, content_id uuid not null, created_at timestamptz default now(),
 unique(user_id,content_type,content_id)
);
create table public.content_views (
 id bigint generated always as identity primary key, user_id uuid references auth.users(id) on delete set null,
 content_type text not null, content_id uuid not null, visitor_hash text, created_at timestamptz default now()
);
create table public.content_downloads (like public.content_views including defaults);
create table public.content_shares (like public.content_views including defaults);

create table public.media (
 id uuid primary key default gen_random_uuid(), bucket text not null, storage_path text unique not null,
 alt_ar text, alt_en text, mime_type text, size_bytes bigint, created_at timestamptz default now()
);
create table public.audit_logs (
 id bigint generated always as identity primary key, actor_id uuid references auth.users(id) on delete set null,
 action text not null, entity_type text not null, entity_id uuid, metadata jsonb default '{}'::jsonb, created_at timestamptz default now()
);
