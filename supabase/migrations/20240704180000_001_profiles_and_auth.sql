-- Perfiles y tipos de usuario vinculados a Supabase Auth

create type public.user_type as enum ('person', 'foundation', 'vet');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  home_location_label text,
  home_department text,
  home_municipality text,
  home_latitude double precision check (home_latitude between -90 and 90),
  home_longitude double precision check (home_longitude between -180 and 180),
  notification_radius_m integer not null default 1000 check (notification_radius_m between 100 and 10000),
  notify_nearby_lost_pets boolean not null default true,
  user_type public.user_type not null default 'person',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    user_type,
    full_name,
    home_location_label,
    home_department,
    home_municipality,
    home_latitude,
    home_longitude,
    notification_radius_m
  )
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'user_type')::public.user_type, 'person'),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'home_location_label',
    new.raw_user_meta_data->>'home_department',
    new.raw_user_meta_data->>'home_municipality',
    (new.raw_user_meta_data->>'home_latitude')::double precision,
    (new.raw_user_meta_data->>'home_longitude')::double precision,
    coalesce((new.raw_user_meta_data->>'notification_radius_m')::integer, 1000)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
