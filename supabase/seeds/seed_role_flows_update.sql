-- Seed incremental: flujos por rol (hackathon)
-- Ejecutar SOLO si ya corriste seed.sql antes de estos cambios.
-- No inserta datos duplicados; solo actualiza lo necesario para vets cerca y demo.

-- 1. Coordenadas en veterinarias demo (requerido para "Vets cerca de ti")
update public.vets
set
  latitude = 13.6929,
  longitude = -89.1875,
  city = 'San Salvador',
  address = 'San Salvador'
where name = 'Clínica Veterinaria Huellitas'
  and (latitude is null or longitude is null);

update public.vets
set
  latitude = 13.6769,
  longitude = -89.2795,
  city = 'Santa Tecla',
  address = 'Santa Tecla'
where name = 'VetCare Santa Tecla'
  and (latitude is null or longitude is null);

update public.vets
set
  latitude = 13.6649,
  longitude = -89.2532,
  city = 'Antiguo Cuscatlán',
  address = 'Antiguo Cuscatlán'
where name = 'Animalia 24/7'
  and (latitude is null or longitude is null);

-- 2. Cuentas demo, campañas vinculadas y clínica del vet demo:
--    ejecutar en terminal →  pnpm seed:demo
--    (usa SUPABASE_SERVICE_ROLE_KEY; ver docs/DEMO_JURADO.md)
