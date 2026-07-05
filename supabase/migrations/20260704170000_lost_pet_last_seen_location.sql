-- Ubicacion georreferenciada de la ultima vez que se vio la mascota perdida

alter table public.lost_pets
  add column if not exists location_department text,
  add column if not exists location_municipality text,
  add column if not exists latitude double precision check (latitude between -90 and 90),
  add column if not exists longitude double precision check (longitude between -180 and 180);

create index if not exists lost_pets_location_coordinates_idx
  on public.lost_pets (latitude, longitude)
  where latitude is not null and longitude is not null;
