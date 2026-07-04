# Importar veterinarias en Supabase remoto usando `vets`

Este proyecto usa la tabla oficial `public.vets`. Los archivos originales de `C:\Users\14dq5014la\Downloads\Veterinaria` venían preparados para una tabla separada llamada `veterinaria`, pero se adaptaron para no romper lo que ya hicieron los compañeros.

## Archivos generados/adaptados

- Migración para extender `vets`:
  - `supabase/migrations/20260704150000_extend_vets_for_import.sql`
- CSV listo para importar a `vets`:
  - `supabase/seeds/vets_import_clean.csv`
- Código actualizado:
  - `lib/data/queries.ts`
  - `app/veterinarias/page.tsx`

## Qué cambia en `vets`

La tabla original tenía:

```sql
name, services, location, phone, hours, promo, owner_id, created_at
```

Se mantienen esos campos y se agregan campos extra del dataset:

```sql
title, latitude, longitude, located_in, category_name, search_string,
address, city, website, total_score, url, image_url, description,
source_file, place_id, hours_summary
```

## Mapeo del CSV

El archivo original `veterinaria_todos_clean.csv` se convirtió a `vets_import_clean.csv` así:

| Campo en `vets` | Sale de |
|---|---|
| `name` | `title` |
| `services` | `category_name` o `search_string` |
| `location` | `city`, si no `address`, si no `located_in` |
| `phone` | `phone` |
| `hours` | `hours_summary` |
| `promo` | vacío |
| campos extendidos | mismos nombres del CSV original |

## Paso a paso en Supabase remoto

### 1. Ejecutar la migración

1. Entra a Supabase Dashboard.
2. Abre tu proyecto remoto.
3. Ve a **SQL Editor**.
4. Crea un **New query**.
5. Copia todo el contenido de:

```txt
supabase/migrations/20260704150000_extend_vets_for_import.sql
```

6. Pégalo en Supabase y ejecuta **Run**.

Esto no borra datos; solo agrega columnas e índices si faltan.

### 2. Verificar columnas

En Supabase:

1. Ve a **Table Editor**.
2. Abre `vets`.
3. Confirma que existan columnas como:
   - `name`
   - `services`
   - `location`
   - `city`
   - `address`
   - `category_name`
   - `search_string`
   - `image_url`
   - `place_id`
   - `hours_summary`

### 3. Importar CSV

1. Ve a **Table Editor → vets**.
2. Busca opción **Import data from CSV** o **Insert → Import from CSV**.
3. Selecciona este archivo local del repo:

```txt
supabase/seeds/vets_import_clean.csv
```

4. Confirma que la primera fila se use como encabezado.
5. Ejecuta la importación.

Debe importar 999 registros.

### 4. Verificar conteo

En SQL Editor ejecuta:

```sql
select count(*) from public.vets;
```

También puedes verificar solo los datos importados:

```sql
select count(*) from public.vets
where source_file is not null;
```

### 5. Si necesitas reimportar

Si ya importaste una vez y querés volver a importar el CSV, primero elimina los registros importados desde esos archivos:

```sql
delete from public.vets
where source_file is not null;
```

Luego vuelve a importar `supabase/seeds/vets_import_clean.csv`.

No uses `truncate vets` si tus compañeros ya tienen datos manuales en esa tabla.

## Configuración local necesaria

En `.env.local` debe estar activo el módulo de veterinarias:

```env
NEXT_PUBLIC_THIRD_MODULE=vets
```

Y deben estar las keys reales de Supabase remoto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

Después de cambiar `.env.local`, reinicia:

```bash
pnpm dev
```

## Prueba en la app

Abre:

```txt
http://localhost:3000/veterinarias
```

Debe mostrar:

- nombre
- imagen si existe
- categorías/servicios
- ciudad o ubicación
- dirección
- teléfono
- horario
- rating
- botón Web
- botón Mapa

## Problemas comunes

### No aparecen datos

Revisa:

```sql
select count(*) from public.vets;
```

Si da `0`, no importaste el CSV.

### Error de columna inexistente al importar

No ejecutaste la migración nueva. Ejecuta primero:

```txt
supabase/migrations/20260704150000_extend_vets_for_import.sql
```

### Error por `place_id` duplicado

Probablemente ya importaste antes. Ejecuta:

```sql
delete from public.vets
where source_file is not null;
```

Luego importa otra vez.

### `/veterinarias` redirige al inicio

Revisa `.env.local`:

```env
NEXT_PUBLIC_THIRD_MODULE=vets
```

Reinicia `pnpm dev`.
