# Configuración n8n para Kany

Guía paso a paso para conectar n8n Cloud con Kany (correo, WhatsApp e IA).

## 1. Credenciales en n8n Cloud

En **Settings → Credentials**, crea:

| Nombre | Tipo | Datos |
|--------|------|-------|
| OpenAI Kany | OpenAI | API Key de [platform.openai.com](https://platform.openai.com/api-keys) |
| Resend Kany | HTTP Header Auth | Name: `Authorization`, Value: `Bearer re_xxx` |
| Twilio Kany | Twilio | Account SID + Auth Token |

Genera una clave secreta (ej. `kany_n8n_secret_2026_xyz`) y úsala igual en:

- n8n → Header Auth de cada webhook (`x-kany-secret`)
- Kany → `.env.local` como `N8N_API_KEY`

## 2. Variables en Kany (.env.local)

```env
N8N_WEBHOOK_GENERATE_DESCRIPTION=https://TU.app.n8n.cloud/webhook/kany-generate-description
N8N_WEBHOOK_LOST_PET=https://TU.app.n8n.cloud/webhook/kany-lost-pet-alert
N8N_WEBHOOK_DONATION=https://TU.app.n8n.cloud/webhook/kany-donation-alert
N8N_API_KEY=tu-clave-secreta
RESEND_API_KEY=re_xxx
EMAIL_FROM=Kany <onboarding@resend.dev>
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

## 3. Workflow 1: Generar descripción

**Nombre:** `Kany - Generar descripcion`

Nodos: `Webhook → Set → OpenAI → Respond to Webhook`

### Webhook

- Method: POST
- Path: `kany-generate-description`
- Authentication: Header Auth → `x-kany-secret` = tu `N8N_API_KEY`
- Respond: **Using Respond to Webhook Node**

### Set (Armar prompt)

Campos desde `$json.body`:

- `tipo`, `nombre`, `raza`, `color`, `zona`, `detalles`, `organization`

### OpenAI

- Model: `gpt-4o-mini`
- System:

```
Eres asistente de Kany, plataforma de mascotas en El Salvador.
Genera textos claros, breves y empáticos para reportes de mascotas.
No inventes datos que el usuario no proporcionó.
Responde SOLO con el texto final, sin comillas ni explicaciones.
Máximo 500 caracteres.
```

- User:

```
Tipo: {{ $json.tipo }}
Genera una descripción para publicar:
Nombre: {{ $json.nombre }}, Raza: {{ $json.raza }}, Color: {{ $json.color }}, Zona: {{ $json.zona }}, Detalles: {{ $json.detalles }}
```

### Respond to Webhook

```json
{
  "text": "{{ $json.message.content }}",
  "ok": true
}
```

(Ajusta `$json.message.content` según la salida del nodo OpenAI en tu versión de n8n.)

Activa el workflow y prueba:

```bash
curl -X POST "https://TU.app.n8n.cloud/webhook/kany-generate-description" \
  -H "Content-Type: application/json" \
  -H "x-kany-secret: tu-clave-secreta" \
  -d "{\"tipo\":\"perdida\",\"nombre\":\"Max\",\"raza\":\"Golden\",\"color\":\"café\",\"zona\":\"Santa Tecla\",\"detalles\":\"se escapó del patio\"}"
```

## 4. Workflow 2: Alerta mascota perdida/encontrada

**Nombre:** `Kany - Alerta mascota`

Nodos: `Webhook → OpenAI → Set → Resend (HTTP) → Twilio`

### Webhook

- Path: `kany-lost-pet-alert`
- Method: POST
- Header Auth: mismo `x-kany-secret`
- Respond: **Immediately**

### Payload que envía Kany

```json
{
  "report_id": 42,
  "tipo": "perdida",
  "name": "Max",
  "breed": "Golden",
  "color": "café",
  "location": "Santa Tecla",
  "contact": "+50371234567",
  "description": "texto del reporte",
  "image_url": "https://...",
  "reported_by_email": "usuario@email.com",
  "app_url": "http://localhost:3000"
}
```

### OpenAI

Prompt sugerido:

```
Genera dos mensajes separados por ---:
1) Email HTML breve confirmando que el reporte fue publicado en Kany. Incluye nombre, zona, color, contacto y enlace {{ $json.body.app_url }}/perdidas
2) WhatsApp corto (máx 300 chars) para el contacto del reporte.

Datos: {{ JSON.stringify($json.body) }}
```

### Resend (HTTP Request)

- POST `https://api.resend.com/emails`
- Header: `Authorization: Bearer re_xxx`
- Body:

```json
{
  "from": "Kany <onboarding@resend.dev>",
  "to": "{{ $('Webhook').item.json.body.reported_by_email }}",
  "subject": "[Kany] Reporte publicado - {{ $('Webhook').item.json.body.name }}",
  "html": "{{ $json.emailBody }}"
}
```

### Twilio

- From: `whatsapp:+14155238886` (sandbox)
- To: `whatsapp:{{ $('Webhook').item.json.body.contact }}`
- Body: texto WhatsApp generado
- **Continue On Fail:** activado

### Twilio WhatsApp Sandbox

1. Twilio Console → Messaging → Try WhatsApp
2. Envía `join xxx-yyy` desde tu celular al número sandbox
3. Solo números registrados reciben mensajes en pruebas

Prueba:

```bash
curl -X POST "https://TU.app.n8n.cloud/webhook/kany-lost-pet-alert" \
  -H "Content-Type: application/json" \
  -H "x-kany-secret: tu-clave-secreta" \
  -d "{\"report_id\":1,\"tipo\":\"perdida\",\"name\":\"Max\",\"breed\":\"Golden\",\"color\":\"café\",\"location\":\"Santa Tecla\",\"contact\":\"+50371234567\",\"description\":\"Se busca Max\",\"reported_by_email\":\"tu@email.com\",\"app_url\":\"http://localhost:3000\"}"
```

## 5. Workflow 3: Nueva campaña (opcional)

**Nombre:** `Kany - Nueva campana`

- Path: `kany-donation-alert`
- Payload: `campaign_id`, `title`, `goal`, `organization`, `description`, `creator_email`, `app_url`
- Envía email de confirmación a `creator_email`

## 6. Errores comunes

| Error | Solución |
|-------|----------|
| 404 en webhook | Workflow no está **Active** |
| 403 | `x-kany-secret` no coincide con `N8N_API_KEY` |
| IA vacía | Revisa expresiones en Respond to Webhook |
| WhatsApp no llega | Número debe hacer `join` al sandbox Twilio |
| Email no llega | Revisa spam; en pruebas usa `onboarding@resend.dev` |

## 7. Flujo en Kany

1. Usuario pulsa **Generar con IA** → `POST /api/ai/description` → n8n Workflow 1
2. Usuario publica reporte → `POST /api/reports` → Supabase + n8n Workflow 2
3. Fundación publica campaña → `POST /api/campaigns` → Supabase + n8n Workflow 3

Las URLs de n8n nunca se exponen al navegador; solo el servidor Next.js las llama.
