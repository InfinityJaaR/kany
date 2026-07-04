-- Ubicacion base del usuario para alertas por cercania

alter table public.profiles
  add column if not exists home_location_label text,
  add column if not exists home_department text,
  add column if not exists home_municipality text,
  add column if not exists home_latitude double precision check (home_latitude between -90 and 90),
  add column if not exists home_longitude double precision check (home_longitude between -180 and 180),
  add column if not exists notification_radius_m integer not null default 1000 check (notification_radius_m between 100 and 10000),
  add column if not exists notify_nearby_lost_pets boolean not null default true;

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
