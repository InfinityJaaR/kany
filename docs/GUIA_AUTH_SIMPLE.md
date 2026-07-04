# Guía simple — Autenticación y rate limit

Esta guía es para configurar el login de Kany **sin saber de Supabase**. Si algo falla, empieza aquí. La guía larga está en `[PASOS_SUPABASE.md](PASOS_SUPABASE.md)`.

---

## ¿Qué es el rate limit?

Cuando alguien se registra o pide un “enlace por correo”, Supabase intenta **enviar un email**. En el plan gratuito, Supabase solo permite enviar **unos 2 correos por hora** (a veces menos).

Si ves un error como **“Email rate limit exceeded”**, significa: *“ya se gastaron los correos de prueba de hoy”*.

**Importante:** entrar con **contraseña** o con **Google** **no gasta** esos correos.

---



## Solución rápida (5 minutos) — para demo o hackathon

Haz esto en el panel de Supabase (supabase.com → tu proyecto):

### 1. Apagar la confirmación por correo

1. Menú izquierdo → **Authentication**
2. **Providers** → **Email**
3. Deja **Enable Email provider** en ON
4. Pon **Confirm email** en **OFF**
5. Clic en **Save**

Así, al registrarse con correo y contraseña, la persona entra **al instante** sin esperar un email.

### 2. Revisar las URLs

1. **Authentication** → **URL Configuration**
2. **Site URL:** `http://localhost:3000` (en tu PC) o tu URL de producción
3. **Redirect URLs:** agrega esta línea exacta:
  ```
   http://localhost:3000/auth/callback
  ```
4. Si ya publicaste la app, agrega también:
  ```
   https://TU-DOMINIO/auth/callback
  ```
5. **Save**



### 3. Variable en tu proyecto (archivo `.env.local`)

Abre `.env.local` en la raíz del proyecto y asegúrate de tener:

```env
NEXT_PUBLIC_ENABLE_MAGIC_LINK=false

```

Reinicia el servidor:

```bash
pnpm dev
```

Con eso la app **no muestra** el login por “enlace por correo” (que también gasta emails).

---



## Cómo puede entrar la gente (después de lo anterior)


| Método              | ¿Funciona sin emails? | Dónde                                  |
| ------------------- | --------------------- | -------------------------------------- |
| Google              | Sí                    | `/auth/login` → “Continuar con Google” |
| Correo + contraseña | Sí                    | `/auth/login` o `/auth/register`       |
| Enlace por correo   | No (gasta cupo)       | Oculto hasta que configures SMTP       |


---



## Activar login con Google (recomendado)

Google no usa los correos de Supabase. Es la mejor opción para usuarios reales.

### Paso A — Google Cloud

1. Entra a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un proyecto (o elige uno)
3. **APIs & Services** → **OAuth consent screen** → completa lo básico (nombre de la app, tu email)
4. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
5. Tipo: **Web application**
6. Rellena:
  **Authorized JavaScript origins**
   (y tu URL de producción cuando la tengas)
   **Authorized redirect URIs** — usa la URL de Supabase, no la de Kany:
  > `TU-PROYECTO` lo ves en Supabase → **Project Settings** → **General** → **Reference ID**  
  > O copia la **Project URL** (ej. `https://abcdefgh.supabase.co`) y añade `/auth/v1/callback`
7. Copia el **Client ID** y el **Client Secret**



### Paso B — Supabase

1. **Authentication** → **Providers** → **Google**
2. Activa **Enable Google**
3. Pega Client ID y Client Secret
4. **Save**



### Paso C — Probar

1. `pnpm dev`
2. Abre `http://localhost:3000/auth/login`
3. Clic en **Continuar con Google**
4. La primera vez te lleva a **elegir tipo de usuario** (normal, fundación o veterinaria)
5. Deberías ver tu nombre arriba a la derecha en la app

---



## Producción: correos con tu dominio ([aseisis.com](http://aseisis.com))

Solo necesitas esto si quieres:

- confirmación por email,
- “olvidé mi contraseña”, o
- login por enlace mágico.

**Cloudflare no envía correos.** Solo sirve para poner registros DNS. Los correos los envía **Resend** (u otro servicio parecido).

### Resumen en 4 pasos

1. **Resend** ([resend.com](https://resend.com)) → agrega dominio `auth.aseisis.com` (o `aseisis.com`)
2. **Cloudflare** → DNS de `aseisis.com` → copia los registros que te da Resend (SPF, DKIM). Ponlos en **DNS only** (nube gris)
3. Espera a que Resend diga “Verified”
4. **Supabase** → **Authentication** → **SMTP Settings**:

  | Campo              | Valor                      |
  | ------------------ | -------------------------- |
  | Enable Custom SMTP | ON                         |
  | Sender email       | `noreply@auth.aseisis.com` |
  | Sender name        | `Kany`                     |
  | Host               | `smtp.resend.com`          |
  | Port               | `465`                      |
  | Username           | `resend`                   |
  | Password           | tu API key de Resend       |

5. En `.env.local` de producción puedes poner `NEXT_PUBLIC_ENABLE_MAGIC_LINK=true` si quieres el enlace por correo otra vez

Detalle completo: `[PASOS_SUPABASE.md](PASOS_SUPABASE.md)` secciones 5.4–5.6.

---



## Errores frecuentes


| Lo que ves                                         | Qué hacer                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------------- |
| `Email rate limit exceeded`                        | Confirm email OFF + no uses magic link + usa Google o contraseña                |
| `auth_callback_error`                              | Falta `http://localhost:3000/auth/callback` en Redirect URLs                    |
| `Invalid API key`                                  | Revisa `.env.local` (URL y anon key de Supabase) y reinicia `pnpm dev`          |
| Google no funciona                                 | Revisa que el redirect en Google sea `https://XXX.supabase.co/auth/v1/callback` |
| “Email not confirmed”                              | Desactiva Confirm email en Supabase                                             |
| Entro con Google pero soy siempre “usuario normal” | Completa `/auth/onboarding` la primera vez                                      |


---



## Checklist mínimo

- [ ] `.env.local` con las 3 keys de Supabase
- [ ] Confirm email **OFF**
- [ ] Redirect URL `http://localhost:3000/auth/callback`
- [ ] `NEXT_PUBLIC_ENABLE_MAGIC_LINK=false`
- [ ] (Opcional) Google OAuth configurado
- [ ] Prueba registro en `/auth/register` o login con Google
- [ ] En Supabase → **Table Editor** → `profiles` aparece tu usuario

---



## ¿Qué ya está hecho en el código?

No tienes que programar nada para lo básico. La app ya incluye:

- Botón **Continuar con Google** en login y registro
- Página `/auth/onboarding` para elegir tipo de usuario tras Google
- Magic link **desactivado** por defecto (variable de entorno)

Tú solo configuras Supabase (y Google Cloud si usas Google).