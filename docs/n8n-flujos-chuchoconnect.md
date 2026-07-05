# Cómo crear los flujos de n8n — ChuchoConnect AI

Guía paso a paso para montar en n8n las automatizaciones del MVP.

**Alcance:** mascotas perdidas, mascotas encontradas, donaciones/campañas.
**Fuera de alcance:** UberPet, adopciones, marketplace.

## 1. Antes de empezar

### Instancia n8n

| Opción | Cómo acceder |
|--------|-------------|
| n8n Cloud | app.n8n.cloud → crear workspace |
| Docker | `docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n` |

Necesitas URL HTTPS pública para conectar Next.js (Cloud, VPS o ngrok en dev).

### Credenciales (Settings → Credentials)

| Credencial | Uso |
|-----------|-----|
| Resend o SMTP | Emails |
| Twilio (opcional) | WhatsApp/SMS |
| Header Auth (opcional) | Fal / ElevenLabs |

### En `.env`:

```
N8N_WEBHOOK_LOST_PET=https://tu-instancia/webhook/lost-pet
N8N_WEBHOOK_DONATION=https://tu-instancia/webhook/donation
N8N_WEBHOOK_SECRET=un-secreto-largo-y-aleatorio
```

## 2. Convención de eventos

| event | Origen | Tabla |
|-------|--------|-------|
| lost | Formulario perdida (reporte creado) | lost_pets |
| found | Botón "Marcar como encontrada" | lost_pets |
| pet.found.created | Formulario encontrada (fuera de alcance de este webhook) | found_pets |
| campaign.created | Nueva campaña | campaigns |
| donation.completed | Stripe OK | campaigns |

## 3. Flujo 1 — Mascotas

1. **Add workflow** → `ChuchoConnect — Mascotas`
2. **Nodo Webhook:** POST, path `lost-pet`, Respond immediately → `200` → `{ "ok": true }`
3. Copiar Production URL → `N8N_WEBHOOK_LOST_PET`
4. **Activar workflow (Active)**

### Switch

| Condición | Ruta |
|-----------|------|
| `{{ $json.body.event }}` = `lost` | Mascota perdida (reporte recién creado) |
| `{{ $json.body.event }}` = `found` | Mascota marcada como encontrada |

Si el JSON llega plano: `{{ $json.event }}`

### Payload — mascotas perdidas (`/webhook/lost-pet`)

El payload siempre tiene los mismos 9 campos; solo cambia el valor de `event` y el contenido de `user_email` según el caso:

- `email`: correo de la cuenta del usuario que reportó la mascota (el dueño del reporte).
- `user_email`:
  - En `event: "lost"` es un **array** con los correos de los usuarios cercanos a la ubicación del reporte (para alertarlos).
  - En `event: "found"` es el **correo único** de la persona que marcó la mascota como encontrada.

**`event: "lost"`** (se dispara al crear el reporte):

```json
{
  "event": "lost",
  "name": "Rocky",
  "breed": "Mestizo",
  "color": "Café",
  "location": "Santa Tecla",
  "description": "Collar rojo",
  "reward": "$50",
  "email": "ar19063@ues.edu.sv",
  "app_url": "http://localhost:3000/mascotas/perdidas/12",
  "user_email": ["landaverde.kevin04@gmail.com"]
}
```

**Dos emails en paralelo** (Resend):

- **Reportante** — Subject: `Recibimos tu reporte — {{ name }}`
- **Alerta interna / cercanos** — Subject: `[URGENTE] {{ name }} — {{ location }}`

**`event: "found"`** (se dispara al marcar la mascota como encontrada):

```json
{
  "event": "found",
  "name": "Rocky",
  "breed": "Mestizo",
  "color": "Café",
  "location": "Santa Tecla",
  "description": "Collar rojo",
  "reward": "$50",
  "email": "ar19063@ues.edu.sv",
  "app_url": "http://localhost:3000/mascotas/perdidas/12",
  "user_email": "landaverde.kevin04@gmail.com"
}
```

**Email:** confirmación de cierre del reporte, Subject: `{{ name }} fue marcado como encontrado`.

### Rama encontrada — payload ejemplo

```json
{
  "event": "pet.found.created",
  "pet_id": 8,
  "type": "Perro",
  "location": "San Salvador",
  "condition": "Buen estado",
  "contact": "+50370005678",
  "match": null,
  "app_url": "http://localhost:3000/mascotas/encontradas/8"
}
```

**Emails:** confirmación al reportante + alerta `[ENCONTRADA]`.

### Opcional

- **Fal:** HTTP POST → cartel «Se busca»
- **ElevenLabs:** audio para compartir en demo

## 4. Flujo 2 — Donaciones

1. **Add workflow** → `ChuchoConnect — Donaciones`
2. **Webhook:** POST, path `donation`, respond immediately
3. URL → `N8N_WEBHOOK_DONATION`
4. **Active**

### Switch

| Salida | event |
|--------|-------|
| Nueva campaña | campaign.created |
| Donación | donation.completed |

El payload siempre tiene los mismos 8 campos; solo cambia el valor de `event` y el contenido de `amount`/`donor_email` según el caso:

- `organization_email`: correo de la cuenta del usuario fundación que creó la campaña. Igual en ambos eventos.
- `amount` / `donor_email`: van vacíos (`0` / `""`) en `campaign.created`, y con el monto y correo del donante en `donation.completed`.

### `campaign.created`

Se dispara al crear una campaña nueva. `amount` y `donor_email` van vacíos porque todavía no hay donaciones.

```json
{
  "event": "campaign.created",
  "campaign_title": "Cirugía para Luna",
  "amount": 0,
  "donor_email": "",
  "organization_email": "fundacion@ejemplo.com",
  "goal": 500,
  "current": 0,
  "app_url": "http://localhost:3000/donaciones/7"
}
```

Email al `organization_email`: campaña creada, meta, enlace `app_url`.
Opcional: email al admin para revisión.

### `donation.completed`

Se dispara al completar una donación a una campaña específica (las donaciones directas a la plataforma no generan este evento).

```json
{
  "event": "donation.completed",
  "campaign_title": "Cirugía para Luna",
  "amount": 25,
  "donor_email": "donante@ejemplo.com",
  "organization_email": "fundacion@ejemplo.com",
  "goal": 500,
  "current": 275,
  "app_url": "http://localhost:3000/donaciones/7"
}
```

- **Donante:** comprobante (monto, progreso current/goal)
- **Organización:** aviso de nueva donación
- **Opcional IF:** si `current / goal >= 0.8` → email de hito

## 5. Seguridad

**IF** tras Webhook: header `x-webhook-secret` = tu secreto. Si falla → Stop and Error.

## 6. Probar con curl

```bash
# Mascota perdida (reporte creado)
curl -X POST "https://TU-N8N/webhook/lost-pet" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: tu-secreto" \
  -d '{"event":"lost","name":"Rocky","breed":"Mestizo","color":"Café","location":"Santa Tecla","description":"Collar rojo","reward":"$50","email":"tu@email.com","app_url":"http://localhost:3000/mascotas/perdidas/1","user_email":["cercano@email.com"]}'

# Mascota marcada como encontrada
curl -X POST "https://TU-N8N/webhook/lost-pet" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: tu-secreto" \
  -d '{"event":"found","name":"Rocky","breed":"Mestizo","color":"Café","location":"Santa Tecla","description":"Collar rojo","reward":"$50","email":"tu@email.com","app_url":"http://localhost:3000/mascotas/perdidas/1","user_email":"quien-encontro@email.com"}'
```

```bash
# Campaña creada
curl -X POST "https://TU-N8N/webhook/donation" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: tu-secreto" \
  -d '{"event":"campaign.created","campaign_title":"Cirugía para Luna","amount":0,"donor_email":"","organization_email":"fundacion@ejemplo.com","goal":500,"current":0,"app_url":"http://localhost:3000/donaciones/7"}'

# Donación completada
curl -X POST "https://TU-N8N/webhook/donation" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: tu-secreto" \
  -d '{"event":"donation.completed","campaign_title":"Cirugía para Luna","amount":25,"donor_email":"tu@email.com","organization_email":"fundacion@ejemplo.com","goal":500,"current":275,"app_url":"http://localhost:3000/donaciones/7"}'
```

Revisa **Executions** en n8n.

## 7. Desde Next.js

```ts
async function notifyN8n(url: string | undefined, payload: object) {
  if (!url) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET ?? '',
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('n8n webhook failed:', err)
  }
}
```

Llamar después del insert en Supabase, sin bloquear la respuesta al usuario.

## 8. Checklist

- [ ] Resend configurado
- [ ] Workflow Mascotas activo
- [ ] Workflow Donaciones activo
- [ ] Secret en n8n y `.env`
- [ ] Prueba curl OK
- [ ] Export JSON del workflow (backup)

## 9. Troubleshooting

| Problema | Solución |
|----------|----------|
| 404 | Workflow inactivo o URL de test → usar Production URL + Active |
| Email no llega | Nodo rojo en Executions; verificar Resend |
| `$json.body` vacío | Usar `$json.event` |
| Timeout en app | Webhook → Respond immediately |
| Emails duplicados | Enviar `event_id` único |

## Resumen

| Workflow | Path | Eventos |
|----------|------|---------|
| Mascotas | `/webhook/lost-pet` | `lost`, `found` |
| Donaciones | `/webhook/donation` | `campaign.created`, `donation.completed` |
