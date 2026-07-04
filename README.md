# Kany

Plataforma comunitaria de cuidado animal para El Salvador. Conecta personas para reportar mascotas perdidas, apoyar donaciones y acceder a módulos opcionales de precios o veterinarias.

## Módulos

| Módulo | Rutas |
|--------|-------|
| Mascotas perdidas | `/perdidas`, `/encontradas`, `/reportar` |
| Donaciones | `/donaciones`, `/donaciones/nueva` |
| Tercero (configurable) | `/precios` o `/veterinarias` — o desactivado |

## Inicio rápido

```bash
cd /home/infinityjaar/hack/ChuchoPets
pnpm install
pnpm dev
```

Abrir http://localhost:3000

## Feature flags

En `.env.local` (copiar desde `.env.example`):

```env
NEXT_PUBLIC_APP_NAME=Kany
NEXT_PUBLIC_THIRD_MODULE=prices
```

Valores de `NEXT_PUBLIC_THIRD_MODULE`:

- `prices` — activa comparador de precios
- `vets` — activa directorio de veterinarias
- `none` — solo 2 módulos; rutas del tercero bloqueadas

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm lint` | ESLint |
| `pnpm start` | Servidor de producción |

## Despliegue

Configurado para Netlify (`netlify.toml`) y CI en GitHub (`.github/workflows/ci.yml`).

Configurar `NEXT_PUBLIC_THIRD_MODULE` en Netlify UI por entorno.

## Documentación

- [Pasos en Supabase (configuración paso a paso)](docs/PASOS_SUPABASE.md)
- [Estado actual del sistema](docs/ESTADO_ACTUAL_SISTEMA.md)
- [Features](docs/FEATURES.md)
- Planes históricos ChuchoConnect en [`docs/`](docs/)

## Licencia

MIT
