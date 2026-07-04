# Kany — Pasos en Supabase (orden recomendado)

Guía paso a paso para configurar tu proyecto Supabase y conectarlo con Kany. Sigue los pasos **en este orden**.

---

## Resumen rápido

1. Crear proyecto en Supabase
2. Copiar keys al `.env.local`
3. Ejecutar las 5 migraciones SQL (en orden)
4. Configurar Authentication (URLs + email + Google OAuth)
5. (Producción) Resend + DNS en Cloudflare + Custom SMTP
6. Ejecutar migración 006 (Storage + imágenes)
7. Probar registro, login y subida de fotos en Kany

---

## Evitar rate limit de correos (importante)

Supabase incluye un SMTP de prueba con **~2 correos/hora**. Cada registro con confirmación, magic link o reset de contraseña consume ese cupo.

| Flujo en Kany | ¿Envía email? |
|---------------|---------------|
| Login con contraseña | No |
| Login con Google | No |
| Magic link (`signInWithOtp`) | **Sí** |
| Registro con Confirm email ON | **Sí** |

**Solución inmediata (hackathon):**

1. **Authentication → Providers → Email** → desactiva **Confirm email**
2. En `.env.local`: `NEXT_PUBLIC_ENABLE_MAGIC_LINK=false` (valor por defecto en `.env.example`)
3. Usa **Google OAuth** o **correo + contraseña** como métodos principales

**Solución producción:** Custom SMTP con Resend + dominio `aseisis.com` (Pasos 5.4–5.6).

> Cloudflare **no ofrece SMTP saliente**. Email Routing solo enruta correos **entrantes**. Usa Cloudflare para los registros DNS (SPF, DKIM, DMARC) del dominio verificado en Resend.

---

## Activar inicio de sesión funcional (checklist)

Completa esto **después** de las migraciones 001–005:

- [ ] **A1.** `.env.local` con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` reales
- [ ] **A2.** Reiniciar `pnpm dev` tras cambiar `.env.local`
- [ ] **A3.** **Authentication → URL Configuration** → Site URL: `http://localhost:3000`
- [ ] **A4.** Redirect URLs: `http://localhost:3000/auth/callback` → **Save**
- [ ] **A5.** **Authentication → Providers → Email** → Enable ON → **Confirm email OFF** (hackathon) → **Save**
- [ ] **A5b.** **Authentication → Providers → Google** → Enable ON + Client ID/Secret (ver Paso 5.3)
- [ ] **A6.** `.env.local` con `NEXT_PUBLIC_ENABLE_MAGIC_LINK=false` (evita magic link hasta tener SMTP)
- [ ] **A7.** Registrar en `/auth/register` o login con Google
- [ ] **A8.** Verificar fila en **Table Editor → profiles**
- [ ] **A9.** Login en `/auth/login` → header muestra tu nombre y botón **Salir**
- [ ] **A10.** (Google) Tras primer login → `/auth/onboarding` para elegir tipo de usuario

| Síntoma | Solución |
|---------|----------|
| `Invalid API key` | Revisa `.env.local` y reinicia `pnpm dev` |
| `auth_callback_error` en login | Agrega Redirect URL exacta en A4 |
| Email not confirmed | Desactiva Confirm email (A5) |
| `Email rate limit exceeded` | Desactiva Confirm email; evita magic link; usa Google OAuth o configura Custom SMTP (5.5) |
| Header sigue en "Iniciar sesión" | Cierra sesión y vuelve a entrar; revisa keys |
| Google login falla | Revisa Client ID/Secret y redirect URI en Google Cloud (5.3) |

---

## Paso 1 — Crear cuenta y proyecto

1. Abre [https://supabase.com](https://supabase.com)
2. Haz clic en **Start your project** (o **Sign in** si ya tienes cuenta)
3. Inicia sesión con GitHub, Google o correo
4. En el dashboard, haz clic en **New project**
5. Completa el formulario:
   - **Organization**: elige una existente o crea una nueva
   - **Name**: por ejemplo `kany`
   - **Database Password**: inventa una contraseña segura y **guárdala** (la necesitarás si usas la CLI)
   - **Region**: elige la más cercana (por ejemplo `South America` si está disponible, o `East US`)
6. Haz clic en **Create new project**
7. Espera 1–2 minutos hasta que el proyecto termine de crearse (barra de progreso verde)

---

## Paso 2 — Copiar las API keys a `.env.local`

1. En el menú lateral izquierdo, haz clic en **Project Settings** (icono de engranaje abajo)
2. En el submenú, haz clic en **API**
3. Copia estos tres valores:

| En Supabase | Variable en `.env.local` |
|-------------|--------------------------|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon public** (en Project API keys) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role** (clic en **Reveal**, luego copiar) | `SUPABASE_SERVICE_ROLE_KEY` |

4. Abre el archivo `.env.local` en la raíz del proyecto Kany
5. Reemplaza los placeholders:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Importante:** nunca subas `service_role` a GitHub ni la uses en el navegador. Solo va en el servidor.

---

## Paso 3 — Ejecutar las migraciones SQL (crear tablas)

Tienes **dos opciones**. Elige una.

### Opción A — SQL Editor (más simple, sin instalar nada extra)

1. En el menú lateral, haz clic en **SQL Editor**
2. Haz clic en **New query**
3. Abre en tu editor de código cada archivo de `supabase/migrations/` **en este orden exacto**:

| Orden | Archivo |
|-------|---------|
| 1 | `20240704180000_001_profiles_and_auth.sql` |
| 2 | `20240704180100_002_lost_and_found_pets.sql` |
| 3 | `20240704180200_003_campaigns.sql` |
| 4 | `20240704180300_004_third_module_tables.sql` |
| 5 | `20240704180400_005_rls_policies.sql` |

4. Para **cada archivo**:
   - Copia todo el contenido SQL
   - Pégalo en el editor de Supabase
   - Haz clic en **Run** (botón verde abajo a la derecha, o `Ctrl+Enter`)
   - Espera el mensaje **Success. No rows returned** (o similar)
5. Repite hasta completar los 5 archivos

### Aviso de Row Level Security (modal al hacer Run)

Al ejecutar migraciones que **crean tablas**, Supabase puede mostrar este modal:

> *"This query creates a table without enabling Row Level Security..."*

Opciones del modal:

| Botón | Qué hacer en Kany |
|-------|-------------------|
| **Cancel** | No ejecuta nada. Solo si quieres revisar el SQL antes. |
| **Run without RLS** | **Usa este en migraciones 001, 002, 003 y 004.** |
| **Run and enable RLS** | **No uses este** en 001–004 (activa RLS sin las políticas del proyecto). |

**Por qué "Run without RLS" en 001–004:**

- Esas migraciones solo crean tablas y triggers.
- La migración **005** (`005_rls_policies.sql`) activa RLS **y** crea todas las políticas de acceso por rol (`person`, `foundation`, `vet`).
- Si activas RLS antes en 001–004, las tablas quedan bloqueadas hasta que corras la 005.

**Migración 005:**

- Pega el SQL de `005_rls_policies.sql` → **Run** (botón verde normal).
- Ese archivo ya incluye `enable row level security` + políticas. Supabase normalmente **no** muestra el modal, o puedes usar **Run** sin preocuparte.

**Resumen por migración:**

| # | Archivo | Botón al aparecer el modal |
|---|---------|----------------------------|
| 1 | `001_profiles_and_auth.sql` | **Run without RLS** |
| 2 | `002_lost_and_found_pets.sql` | **Run without RLS** |
| 3 | `003_campaigns.sql` | **Run without RLS** |
| 4 | `004_third_module_tables.sql` | **Run without RLS** |
| 5 | `005_rls_policies.sql` | **Run** (activa RLS + políticas) |

> Importante: corre las 5 migraciones **seguidas** en el mismo orden. No te quedes solo en la 004.

### Opción B — Supabase CLI (recomendado para el futuro)

1. En terminal, desde la carpeta del proyecto:

```bash
pnpm exec supabase login
```

(Sigue el enlace en el navegador y autoriza)

2. Obtén el **Project ref**:
   - **Project Settings** → **General** → copia **Reference ID**

3. Vincula el proyecto:

```bash
pnpm exec supabase link --project-ref TU_REFERENCE_ID
```

(Te pedirá la contraseña de la base de datos del Paso 1)

4. Sube todas las migraciones de una vez:

```bash
pnpm db:push
```

---

## Paso 4 — Verificar que las tablas existen

1. En el menú lateral, haz clic en **Table Editor**
2. Deberías ver estas tablas:

| Tabla | Para qué sirve |
|-------|----------------|
| `profiles` | Usuarios (normal, fundación, veterinaria) |
| `lost_pets` | Mascotas perdidas |
| `found_pets` | Mascotas encontradas |
| `campaigns` | Campañas de donación |
| `food_prices` | Comparador de precios (módulo tercero) |
| `vets` | Directorio de veterinarias (módulo tercero) |

Si no aparecen, vuelve al Paso 3 y revisa si alguna migración falló (mensaje rojo en SQL Editor).

---

## Paso 5 — Configurar Authentication (auth)

### 5.1 URLs de redirección

1. Menú lateral → **Authentication**
2. Pestaña **URL Configuration** (o **Sign In / Providers** → abajo **Redirect URLs**)
3. Configura:

| Campo | Valor (desarrollo local) |
|-------|--------------------------|
| **Site URL** | `http://localhost:3000` |
| **Redirect URLs** | `http://localhost:3000/auth/callback` |

4. Haz clic en **Save** si hay botón de guardar

> Cuando despliegues en producción, agrega también tu URL de producción, por ejemplo:
> `https://tu-app.netlify.app/auth/callback`
> `https://aseisis.com/auth/callback` (si usas ese dominio)

### 5.2 Proveedor de email (correo + contraseña)

1. **Authentication** → **Providers** (o **Sign In / Providers**)
2. Busca **Email** en la lista
3. Haz clic en **Email** para expandir
4. Activa:
   - **Enable Email provider** → ON
   - **Confirm email** → **OFF** para hackathon/demo (evita rate limit). ON solo con Custom SMTP (5.5)
   - **Secure email change** → ON (opcional)
5. Haz clic en **Save**

Con esto funcionan:
- Registro con **correo y contraseña** (`/auth/register`)
- Inicio de sesión con **contraseña** (`/auth/login`)

**Magic link** (enlace por correo) está **desactivado en la UI** por defecto (`NEXT_PUBLIC_ENABLE_MAGIC_LINK=false`). Actívalo solo cuando tengas Custom SMTP configurado.

### 5.3 Google OAuth (recomendado — sin emails)

Google OAuth no consume el rate limit de correos de Supabase.

#### En Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea o selecciona un proyecto
3. **APIs & Services** → **OAuth consent screen** → configura pantalla (External, nombre de app, email de soporte)
4. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Tipo: **Web application**
6. Configura:

| Campo | Valor |
|-------|-------|
| **Authorized JavaScript origins** | `http://localhost:3000`, `https://tu-dominio-produccion` |
| **Authorized redirect URIs** | `https://TU_PROJECT.supabase.co/auth/v1/callback` |

> Reemplaza `TU_PROJECT` por el ref de tu proyecto Supabase (ej. `abcdefghijklmnop`).

7. Copia **Client ID** y **Client Secret**

#### En Supabase Dashboard

1. **Authentication** → **Providers** → **Google**
2. **Enable Google** → ON
3. Pega **Client ID** y **Client Secret**
4. **Save**

#### Onboarding tras Google

Usuarios que entran con Google son redirigidos a `/auth/onboarding` para elegir su tipo (`person`, `foundation`, `vet`). El registro con correo/contraseña sigue pidiendo el tipo en `/auth/register`.

### 5.4 Resend + dominio aseisis.com (Cloudflare DNS)

Para enviar correos de auth desde tu dominio (producción):

1. Crea cuenta en [resend.com](https://resend.com)
2. **Domains** → **Add domain**
   - Recomendado: subdominio `auth.aseisis.com` o `mail.aseisis.com` (no mezcla con correo corporativo)
   - Alternativa: dominio raíz `aseisis.com`
3. Resend mostrará registros **SPF** (TXT), **DKIM** (CNAME o TXT) y opcionalmente **DMARC**
4. En **Cloudflare** → dominio `aseisis.com` → **DNS** → **Add record**:

| Tipo | Nombre | Contenido | Proxy |
|------|--------|-----------|-------|
| TXT | (según Resend) | valor SPF | DNS only |
| CNAME | (según Resend) | valor DKIM | **DNS only (gris)** |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:tu@aseisis.com` | DNS only |

> Los registros CNAME/TXT de email deben estar en **DNS only** (nube gris), no proxied (naranja).

5. Espera verificación en Resend (minutos a horas)
6. Copia tu **API Key** a `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=Kany <noreply@auth.aseisis.com>
```

### 5.5 Custom SMTP en Supabase (Resend)

Una vez verificado el dominio en Resend:

1. **Authentication** → **SMTP Settings** (o **Email Settings**)
2. Activa **Enable Custom SMTP**
3. Completa:

| Campo | Valor |
|-------|-------|
| **Sender email** | `noreply@auth.aseisis.com` (dominio verificado en Resend) |
| **Sender name** | `Kany` |
| **Host** | `smtp.resend.com` |
| **Port** | `465` (SSL) o `587` (TLS) |
| **Username** | `resend` |
| **Password** | tu `RESEND_API_KEY` de Resend |

4. **Save**

Tras activar SMTP custom, el límite sube a ~**30 emails/hora** (configurable).

### 5.6 Rate limits y magic link en producción

1. **Authentication** → **Rate Limits**
2. Ajusta **Emails sent** (`rate_limit_email_sent`) según tu plan de Resend
3. En `.env.local` de producción: `NEXT_PUBLIC_ENABLE_MAGIC_LINK=true` si quieres ofrecer magic link
4. Opcional: reactiva **Confirm email** en Providers → Email

### 5.7 Plantillas de email

1. **Authentication** → **Email Templates**
2. Personaliza: Confirm signup, Magic Link, Reset Password
3. Usa branding de Kany y remitente `@aseisis.com` coherente con SMTP

> **Nota:** Supabase Auth **no** lee `RESEND_API_KEY` del `.env` de Next.js. La clave va en **SMTP Settings** del dashboard. El `.env` sirve para emails transaccionales futuros de la app vía API de Resend.

---

## Paso 6 — (Opcional) Insertar datos de prueba (seed)

**Recomendado ahora** que las páginas leen de Supabase (`/perdidas`, `/encontradas`, `/donaciones`, `/precios`, `/veterinarias`).

Si no ejecutas el seed, esas páginas aparecerán vacías hasta que publiques desde la app.

### Con SQL Editor

1. **SQL Editor** → **New query**
2. Copia el contenido de `supabase/seed.sql`
3. **Run**

### Con CLI (solo entorno local)

```bash
pnpm db:reset
```

> `db:reset` borra y recrea la base **local** de Supabase CLI, no la nube. Para la nube usa el SQL Editor con `seed.sql`.

---

## Paso 6b — Storage para imágenes (migración 006)

Permite subir fotos en `/reportar` y `/donaciones/nueva`.

### Con SQL Editor

1. **SQL Editor** → **New query**
2. Copia el contenido de `supabase/migrations/20240705120000_006_storage_and_image_urls.sql`
3. Haz clic en **Run** (botón verde normal; no aplica el modal RLS de tablas)
4. Verifica en **Storage** que existan los buckets:
   - `pet-images`
   - `campaign-images`
   - `avatars`

### Alternativa manual (UI)

1. Menú **Storage** → **New bucket**
2. Name: `pet-images` → activa **Public bucket** → **Create bucket**
3. Repite para `campaign-images` y `avatars`
4. Igualmente corre la migración 006 para columnas `image_url` y políticas de acceso

### URL pública de una imagen

```
https://TU_PROJECT.supabase.co/storage/v1/object/public/pet-images/lost/USER_ID/archivo.jpg
```

### Probar subida

1. Inicia sesión en Kany
2. Ve a `/reportar` → selecciona imagen → publica reporte
3. En Supabase **Storage → pet-images** debería aparecer el archivo

---

## Paso 7 — Probar en Kany

1. En terminal:

```bash
pnpm dev
```

2. Abre [http://localhost:3000](http://localhost:3000)
3. Haz clic en **Iniciar sesión** (header) o ve a `/auth/register`

### Probar registro con tipos de usuario

1. Ve a **http://localhost:3000/auth/register**
2. Elige un tipo:
   - **Usuario normal** → `person`
   - **Fundación** → `foundation`
   - **Veterinaria** → `vet`
3. Completa nombre, correo y contraseña
4. Haz clic en **Registrarse**
5. Si **Confirm email** está ON, revisa tu correo y haz clic en el enlace de confirmación

### Verificar que el perfil se creó

1. En Supabase → **Table Editor** → tabla **profiles**
2. Debería aparecer una fila con tu `email` y el `user_type` que elegiste

### Probar login

**Con Google:**
1. `/auth/login` → **Continuar con Google**
2. Tras autorizar → `/auth/callback` → `/auth/onboarding` (primera vez) o inicio
3. Elige tipo de usuario en onboarding si aplica

**Con contraseña:**
1. `/auth/login` → ingresa email y contraseña → **Entrar**

**Con magic link** (solo si `NEXT_PUBLIC_ENABLE_MAGIC_LINK=true` y Custom SMTP):
1. `/auth/login` → pestaña **Enlace por correo**
2. Ingresa email → **Enviar enlace**
3. Revisa tu correo → haz clic en el enlace → `/auth/callback` → inicio

---

## Paso 8 — Cuando agregues cambios a la base de datos

1. Crea un archivo nuevo en `supabase/migrations/` con timestamp:

```
YYYYMMDDHHMMSS_descripcion.sql
```

Ejemplo: `20240705120000_006_add_pet_photos.sql`

2. Aplica el cambio:
   - **CLI:** `pnpm db:push`
   - **Manual:** SQL Editor → New query → pegar SQL → Run

Nunca edites migraciones que ya corriste en producción; siempre crea una migración nueva.

---

## Checklist final

- [ ] Proyecto creado en Supabase
- [ ] `.env.local` con las 3 keys de Supabase
- [ ] 5 migraciones ejecutadas sin error
- [ ] Migración 006 (Storage) ejecutada
- [ ] Buckets `pet-images`, `campaign-images`, `avatars` visibles
- [ ] 6 tablas visibles en Table Editor
- [ ] Site URL y Redirect URL configuradas (localhost + producción)
- [ ] Email provider activado; Confirm email OFF (hackathon) o Custom SMTP ON (producción)
- [ ] Google OAuth configurado (Client ID/Secret en Supabase)
- [ ] Registro funciona y aparece fila en `profiles`
- [ ] Login con contraseña funciona
- [ ] Login con Google funciona + onboarding de tipo de usuario
- [ ] Header muestra nombre y botón Salir
- [ ] Subida de imagen en `/reportar` funciona
- [ ] (Producción) Dominio verificado en Resend + DNS en Cloudflare
- [ ] (Producción) Custom SMTP activo en Supabase
- [ ] Magic link funciona (opcional, requiere SMTP custom)

---

## Problemas frecuentes

| Error | Solución |
|-------|----------|
| `Invalid API key` | Revisa que copiaste bien `anon` y `URL` en `.env.local`. Reinicia `pnpm dev`. |
| Magic link no redirige | Agrega `http://localhost:3000/auth/callback` en Redirect URLs. |
| `user_type` inválido al registrarse | Asegúrate de haber corrido la migración `001_profiles_and_auth.sql`. |
| No puedo crear campaña (futuro) | Solo usuarios con `user_type = foundation` pueden insertar en `campaigns` (RLS). |
| Email no llega / rate limit | Desactiva Confirm email; usa Google OAuth; configura Custom SMTP con Resend (Pasos 5.4–5.5). Revisa spam. |
| `Email rate limit exceeded` | Mismo que arriba. Evita magic link hasta tener SMTP (`NEXT_PUBLIC_ENABLE_MAGIC_LINK=false`). |
| Google redirige a login con error | Verifica redirect URI `https://TU_PROJECT.supabase.co/auth/v1/callback` en Google Cloud. |
| Usuario Google queda como `person` sin elegir | Debe pasar por `/auth/onboarding`; revisa que el middleware esté activo. |
| `pnpm db:push` pide login | Ejecuta `pnpm exec supabase login` y `supabase link` primero. |
| Error al subir imagen | Corre migración 006; debes estar logueado; máximo 5 MB JPG/PNG/WebP. |
| No puedo crear campaña | Regístrate como **Fundación**; solo ese rol puede insertar en `campaigns`. |

---

## Referencias en este repo

- Migraciones: [`supabase/migrations/`](../supabase/migrations/)
- Datos demo: [`supabase/seed.sql`](../supabase/seed.sql)
- SQL de referencia original: [`docs/consultas_supabase_kany.txt`](consultas_supabase_kany.txt)
- Variables de entorno: [`.env.example`](../.env.example)
