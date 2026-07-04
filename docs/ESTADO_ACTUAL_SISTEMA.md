# Kany — Estado actual del sistema

## Stack

- Next.js 16 App Router
- React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- ESLint + pnpm

## Comandos

```bash
cd /home/infinityjaar/hack/ChuchoPets
pnpm install
pnpm dev
pnpm lint
pnpm build
```

## Módulos activos

| # | Módulo | Rutas |
|---|--------|-------|
| 1 | Mascotas perdidas | `/perdidas`, `/encontradas`, `/reportar` |
| 2 | Donaciones | `/donaciones`, `/donaciones/nueva` |
| 3 | Tercero (env) | `/precios` o `/veterinarias` o ninguno |

## Feature flag

```env
NEXT_PUBLIC_THIRD_MODULE=prices   # prices | vets | none
```

- `prices`: landing con 3 módulos; `/veterinarias` redirige a `/`
- `vets`: landing con 3 módulos; `/precios` redirige a `/`
- `none`: landing con 2 módulos; ambas rutas bloqueadas

Middleware en [`middleware.ts`](../middleware.ts) bloquea acceso directo a rutas desactivadas o eliminadas.

## Estructura

```txt
app/
├─ page.tsx
├─ perdidas/page.tsx
├─ encontradas/page.tsx
├─ reportar/page.tsx
├─ donaciones/page.tsx
├─ donaciones/nueva/page.tsx
├─ precios/page.tsx
└─ veterinarias/page.tsx
components/layout/
data/
lib/modules.ts
middleware.ts
```

## Validación

```bash
pnpm lint && pnpm build
```
