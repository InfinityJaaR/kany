-- Extend existing public.vets table to support imported veterinary directory data.
-- Compatible with the original Kany vets schema: keeps name/services/location/phone/hours/promo.

alter table public.vets
  add column if not exists title text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists located_in text,
  add column if not exists category_name text,
  add column if not exists search_string text,
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists website text,
  add column if not exists total_score numeric,
  add column if not exists url text,
  add column if not exists image_url text,
  add column if not exists description text,
  add column if not exists source_file text,
  add column if not exists place_id text,
  add column if not exists hours_summary text;

create unique index if not exists vets_place_id_uidx
  on public.vets (place_id)
  where place_id is not null;

create index if not exists vets_city_idx on public.vets (city);
create index if not exists vets_category_name_idx on public.vets (category_name);
create index if not exists vets_search_string_idx on public.vets (search_string);
create index if not exists vets_total_score_idx on public.vets (total_score);
