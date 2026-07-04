# Guía demo para el jurado — Kany

Cuentas preconfiguradas para probar los flujos por rol durante el hackathon.

## Requisitos previos

1. Migraciones aplicadas en Supabase (001–011, incluyendo `donate_to_campaign` y lock de rol).
2. Variables en `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_THIRD_MODULE=vets`
3. En Supabase Dashboard → Authentication → Providers → Email: **Confirm email = OFF** (login inmediato).
4. Datos demo de contenido:
   - **Instalación nueva:** `supabase/seed.sql` en el SQL Editor (o `pnpm db:reset` en local).
   - **Ya corriste seed.sql antes:** solo el incremental `supabase/seeds/seed_role_flows_update.sql` (no duplica mascotas ni campañas).

## Actualizar base existente (sin duplicar datos)

Si ya tenías datos del seed original, ejecuta en este orden:

```bash
# 1. SQL incremental (coordenadas de veterinarias para "cerca de ti")
#    Pegar en Supabase SQL Editor: supabase/seeds/seed_role_flows_update.sql

# 2. Cuentas demo + campañas vinculadas + clínica demo
pnpm seed:demo
# Alternativa directa: node scripts/seed-demo-users.mjs
```

## Crear cuentas demo (solo)

```bash
pnpm seed:demo
```

## Credenciales

| Rol | Email | Contraseña |
|-----|-------|------------|
| Usuario normal | `demo.usuario@kany.sv` | `DemoKany2026!` |
| Fundación | `demo.fundacion@kany.sv` | `DemoKany2026!` |
| Veterinaria | `demo.vet@kany.sv` | `DemoKany2026!` |

También visibles en `/auth/login` bajo **Cuentas demo para jurado**.

## Flujos a probar

### 1. Visitante (sin login)

- `/perdidas` — ver mascotas perdidas
- `/encontradas` — ver mascotas encontradas
- `/donaciones` — ver campañas (donar pide login)
- `/veterinarias` — directorio + botón de ubicación
- `/reportar` — redirige a login

### 2. Usuario normal (`demo.usuario@kany.sv`)

1. Iniciar sesión → onboarding ya completado
2. `/reportar` — publicar mascota perdida o encontrada
3. `/donaciones` — donar $5/$10/$25 (simulado)
4. `/veterinarias` — **Usar mi ubicación** para ver clínicas cercanas

### 3. Fundación (`demo.fundacion@kany.sv`)

1. Home muestra panel de fundación
2. `/donaciones/nueva` — crear campaña
3. Nav incluye **Crear campaña**

### 4. Veterinaria (`demo.vet@kany.sv`)

1. Home muestra panel de veterinaria
2. `/veterinarias/registrar` — registrar o editar clínica
3. Nav incluye **Mi clínica**

### Cambiar de rol

El rol se elige **una sola vez** en el onboarding. Para probar otro rol:

1. Clic en **Salir**
2. Iniciar sesión con otra cuenta demo

Si intentas una acción de otro rol (ej. crear campaña como usuario), verás un aviso en la home.

## Troubleshooting

| Problema | Solución |
|----------|----------|
| "Cuenta demo no encontrada" | Ejecutar `pnpm seed:demo` |
| Donar falla con error RPC | Aplicar migración `011_donate_to_campaign.sql` |
| No aparecen veterinarias cerca | Ejecutar `supabase/seeds/seed_role_flows_update.sql` o importar CSV de vets con lat/lng |
| Email no confirmado | Desactivar confirmación en Supabase Auth settings |
