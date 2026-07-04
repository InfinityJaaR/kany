# Plan completo para desarrollar ChuchoConnect AI

Guía ordenada para construir el proyecto completo tomando como base `ChuchoConnectAI_Plan_24h (1).md`.

## 1. Objetivo

Construir una plataforma web para El Salvador que centralice:

- Mascotas perdidas.
- Mascotas encontradas.
- Adopciones.
- Donaciones.
- Transporte UberPet.
- Veterinarias.
- Marketplace.
- Comparador de precios.
- Asistente IA.
- Roles y administración.

## 2. Stack recomendado

```txt
Frontend:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend/BaaS:
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase Row Level Security

Automatizaciones:
- n8n

IA:
- OpenAI / Anthropic / Gemini / Flowise
- Fal.ai para carteles o imágenes
- ElevenLabs para audio opcional

Pagos:
- Stripe o Wompi/PayPal si se adapta al país

Deploy:
- Vercel
```

## 3. Estructura completa recomendada

```txt
ChuchoConnectAI/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ globals.css
│  ├─ auth/
│  │  ├─ login/page.tsx
│  │  ├─ register/page.tsx
│  │  └─ callback/route.ts
│  ├─ dashboard/page.tsx
│  ├─ roles/page.tsx
│  ├─ pets/
│  │  ├─ page.tsx
│  │  ├─ new/page.tsx
│  │  └─ [id]/page.tsx
│  ├─ perdidas/page.tsx
│  ├─ encontradas/page.tsx
│  ├─ reportar/page.tsx
│  ├─ adopciones/
│  │  ├─ page.tsx
│  │  ├─ solicitud/page.tsx
│  │  └─ [id]/page.tsx
│  ├─ donaciones/
│  │  ├─ page.tsx
│  │  ├─ nueva/page.tsx
│  │  └─ [id]/page.tsx
│  ├─ transporte/
│  │  ├─ page.tsx
│  │  ├─ nuevo/page.tsx
│  │  ├─ driver/page.tsx
│  │  └─ [id]/page.tsx
│  ├─ marketplace/
│  │  ├─ page.tsx
│  │  ├─ nuevo/page.tsx
│  │  └─ [id]/page.tsx
│  ├─ precios/page.tsx
│  ├─ veterinarias/
│  │  ├─ page.tsx
│  │  ├─ nueva/page.tsx
│  │  └─ [id]/page.tsx
│  ├─ ia/page.tsx
│  ├─ fundaciones/page.tsx
│  ├─ admin/page.tsx
│  └─ api/
│     ├─ ai/route.ts
│     ├─ n8n/route.ts
│     ├─ donations/route.ts
│     ├─ upload/route.ts
│     └─ webhooks/
│        ├─ stripe/route.ts
│        └─ n8n/route.ts
├─ components/
│  ├─ ui/
│  ├─ layout/
│  │  ├─ site-header.tsx
│  │  ├─ sidebar.tsx
│  │  └─ footer.tsx
│  ├─ pets/
│  │  ├─ pet-card.tsx
│  │  ├─ pet-form.tsx
│  │  ├─ pet-filters.tsx
│  │  └─ match-card.tsx
│  ├─ adoptions/
│  ├─ donations/
│  ├─ uberpet/
│  ├─ marketplace/
│  ├─ vets/
│  ├─ ai/
│  └─ admin/
├─ data/
│  ├─ mockPets.ts
│  ├─ mockProducts.ts
│  ├─ mockVets.ts
│  └─ mockCampaigns.ts
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts
│  │  ├─ server.ts
│  │  └─ middleware.ts
│  ├─ ai.ts
│  ├─ n8n.ts
│  ├─ stripe.ts
│  ├─ validations.ts
│  ├─ utils.ts
│  └─ constants.ts
├─ types/
│  ├─ database.ts
│  ├─ pet.ts
│  ├─ donation.ts
│  ├─ ride.ts
│  └─ product.ts
├─ supabase/
│  ├─ schema.sql
│  ├─ seed.sql
│  └─ policies.sql
├─ public/
├─ .env.example
├─ package.json
└─ README.md
```

## 4. Variables de entorno

Crear `.env.local` y `.env.example`.

### `.env.example`

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ChuchoConnect AI

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# IA - usar el proveedor elegido
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-key
FLOWISE_API_URL=https://your-flowise-instance/api/v1/prediction/your-chatflow-id
FLOWISE_API_KEY=your-flowise-key

# n8n
N8N_WEBHOOK_LOST_PET=https://your-n8n/webhook/lost-pet
N8N_WEBHOOK_DONATION=https://your-n8n/webhook/donation
N8N_WEBHOOK_UBERPET=https://your-n8n/webhook/uberpet
N8N_API_KEY=your-n8n-api-key

# Fal.ai
FAL_KEY=your-fal-key

# ElevenLabs
ELEVENLABS_API_KEY=your-elevenlabs-key
ELEVENLABS_VOICE_ID=your-voice-id

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email / Resend
RESEND_API_KEY=your-resend-key
EMAIL_FROM=ChuchoConnect <noreply@chuchoconnect.ai>

# WhatsApp / Twilio opcional
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Maps opcional
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

## 5. Instalaciones base

```bash
pnpm add @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers
pnpm add sonner date-fns
pnpm add openai ai
pnpm add stripe @stripe/stripe-js
pnpm add resend
pnpm add lucide-react
```

Opcional:

```bash
pnpm add @google/generative-ai
pnpm add @anthropic-ai/sdk
pnpm add twilio
```

## 6. Base de datos Supabase

### Tablas principales

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text check (role in ('visitor','person','foundation','driver','vet','store','admin')) default 'person',
  avatar_url text,
  created_at timestamptz default now()
);

create table pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  name text,
  type text,
  status text check (status in ('lost','found','adoption')),
  breed text,
  color text,
  size text,
  location text,
  lost_or_found_date date,
  description text,
  contact_phone text,
  reward numeric default 0,
  urgency text default 'normal',
  image_url text,
  created_at timestamptz default now()
);

create table donation_campaigns (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references profiles(id),
  title text not null,
  description text,
  goal numeric not null,
  current_amount numeric default 0,
  campaign_type text,
  status text default 'active',
  image_url text,
  created_at timestamptz default now()
);

create table donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references donation_campaigns(id),
  donor_id uuid references profiles(id),
  amount numeric,
  donation_type text,
  payment_status text default 'pending',
  created_at timestamptz default now()
);

create table rides (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references profiles(id),
  driver_id uuid references profiles(id),
  origin text,
  destination text,
  pet_type text,
  pet_size text,
  urgency text,
  notes text,
  status text default 'pending',
  price numeric,
  created_at timestamptz default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references profiles(id),
  name text,
  brand text,
  category text,
  price numeric,
  weight text,
  stock integer default 0,
  image_url text,
  created_at timestamptz default now()
);

create table vets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  name text,
  services text[],
  location text,
  phone text,
  hours text,
  promotions text,
  created_at timestamptz default now()
);
```

## 7. Conexión con Supabase

### `lib/supabase/client.ts`

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

### `lib/supabase/server.ts`

```ts
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        },
      },
    },
  )
}
```

## 8. Módulos completos a desarrollar

### 8.1 Mascotas perdidas

Archivos:

```txt
app/perdidas/page.tsx
app/reportar/page.tsx
app/pets/[id]/page.tsx
components/pets/pet-card.tsx
components/pets/pet-form.tsx
components/pets/pet-filters.tsx
```

Funciones:

- Listar mascotas con `status = lost`.
- Crear reporte.
- Subir foto a Supabase Storage.
- Generar descripción con IA.
- Crear alerta con n8n.

### 8.2 Mascotas encontradas

Funciones:

- Listar mascotas con `status = found`.
- Crear reporte.
- Comparar con mascotas perdidas por tipo, color, tamaño, zona y fecha.
- Mostrar posibles coincidencias.

### 8.3 Adopciones

Funciones:

- Listar mascotas con `status = adoption`.
- Solicitar adopción.
- Formulario responsable.
- Recomendador IA según estilo de vida.

### 8.4 Donaciones

Funciones:

- Listar campañas.
- Crear campaña.
- Donación simulada o Stripe real.
- Webhook para confirmar pago.
- Notificación con n8n.

### 8.5 UberPet

Funciones:

- Solicitar viaje.
- Transportista acepta viaje.
- Estados:

```txt
Pendiente → Aceptado → En camino → Mascota recogida → Entregado → Finalizado
```

### 8.6 Marketplace

Funciones:

- Catálogo.
- Crear producto.
- Filtros por categoría.
- Comparador de precios.
- Recomendador IA de comida/accesorio.

### 8.7 Veterinarias

Funciones:

- Directorio.
- Registrar veterinaria.
- Servicios, horarios, promociones.
- Jornadas de vacunación o esterilización.

### 8.8 IA

Funciones visibles:

- Generar descripción de mascota.
- Generar texto para redes.
- Crear cartel.
- Recomendar alimento.
- Recomendar adopción.
- Resumir campaña.

## 9. Conexión con IA

### Opción OpenAI `lib/ai.ts`

```ts
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generatePetPost(input: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Eres asistente para reportes de mascotas en El Salvador.' },
      { role: 'user', content: `Genera un texto claro para redes: ${input}` },
    ],
  })

  return response.choices[0]?.message?.content ?? ''
}
```

### API route `app/api/ai/route.ts`

```ts
import { NextResponse } from 'next/server'
import { generatePetPost } from '@/lib/ai'

export async function POST(req: Request) {
  const body = await req.json()
  const text = await generatePetPost(body.prompt)
  return NextResponse.json({ text })
}
```

## 10. Conexión con n8n

### `lib/n8n.ts`

```ts
export async function sendLostPetAlert(payload: unknown) {
  await fetch(process.env.N8N_WEBHOOK_LOST_PET!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
```

Flujos recomendados en n8n:

1. Mascota perdida:
   - Webhook recibe reporte.
   - Envía email/WhatsApp.
   - Guarda log.
2. Donación:
   - Webhook recibe donación.
   - Envía comprobante.
   - Notifica a fundación.
3. UberPet:
   - Webhook recibe solicitud.
   - Notifica transportistas.
   - Confirma asignación.

## 11. Conexión con Stripe

### `lib/stripe.ts`

```ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
})
```

### Crear checkout

```ts
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: { name: 'Donación ChuchoConnect' },
      unit_amount: amountInCents,
    },
    quantity: 1,
  }],
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/donaciones?success=1`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/donaciones?cancel=1`,
})
```

## 12. Supabase Storage

Buckets:

```txt
pets
campaigns
products
vets
avatars
```

Ejemplo:

```ts
const { data, error } = await supabase.storage
  .from('pets')
  .upload(`lost/${file.name}`, file)
```

## 13. Orden de desarrollo recomendado

### Fase 1: Base

1. Crear estructura.
2. Configurar tema.
3. Crear layout global.
4. Crear navegación.
5. Crear `.env.example`.

### Fase 2: Supabase

1. Crear proyecto Supabase.
2. Ejecutar `schema.sql`.
3. Crear policies RLS.
4. Configurar Auth.
5. Conectar cliente y servidor.

### Fase 3: Módulos principales

1. Mascotas perdidas.
2. Mascotas encontradas.
3. Adopciones.
4. Donaciones.
5. UberPet.
6. Marketplace.
7. Veterinarias.

### Fase 4: IA y automatizaciones

1. API `/api/ai`.
2. Generación de texto.
3. Recomendaciones.
4. Webhooks n8n.
5. Alertas.

### Fase 5: Admin y roles

1. Dashboard por rol.
2. Validación de fundaciones.
3. Validación de transportistas.
4. Moderación de reportes.

### Fase 6: Deploy

1. Subir a GitHub.
2. Conectar Vercel.
3. Agregar variables de entorno.
4. Probar flujos.
5. Preparar demo.

## 14. README final sugerido

Debe incluir:

- Descripción.
- Stack.
- Instalación.
- Variables de entorno.
- Estructura.
- Módulos.
- Scripts.
- Deploy.
- Capturas.
- Flujo de demo.

## 15. Flujo de demo completo

1. Usuario entra a `/`.
2. Selecciona rol en `/roles`.
3. Se registra en `/auth/register`.
4. Reporta mascota en `/reportar`.
5. Genera texto IA.
6. Revisa coincidencias en `/encontradas`.
7. Entra a `/donaciones` y dona.
8. Solicita UberPet en `/transporte/nuevo`.
9. Revisa productos en `/marketplace`.
10. Compara comida en `/precios`.
11. Consulta veterinarias en `/veterinarias`.
12. Admin modera en `/admin`.

## 16. Resultado esperado

Una plataforma completa, escalable y lista para conectar servicios reales, manteniendo una primera versión funcional para demo y pitch.
