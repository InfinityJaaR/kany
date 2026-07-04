# ChuchoConnect AI

## Plataforma inteligente para rescate, adopción, donaciones, transporte y cuidado de mascotas

---

## 1. Contexto de la idea

La idea de **ChuchoConnect AI** nace como una evolución del concepto inicial de una app para mascotas perdidas y adopciones. Al inicio se planteó como una plataforma para reportar mascotas perdidas, encontradas y en adopción, pero luego se amplió para tener mayor alcance e impacto real en El Salvador.

La propuesta final no es solamente una app para publicar perritos, sino una **red digital completa para mascotas**, donde se conectan personas, fundaciones, rescatistas, veterinarias, transportistas, vendedores de accesorios, donantes y voluntarios.

El objetivo es centralizar en una sola plataforma todo lo que normalmente está disperso en grupos de Facebook, WhatsApp, publicaciones individuales o contactos informales.

---

## 2. Nombre del proyecto

## **ChuchoConnect AI**

### Frase corta

> **ChuchoConnect AI centraliza todo lo que una persona necesita para cuidar, encontrar, adoptar o ayudar a una mascota: reportes, adopciones, donaciones, transporte, comida y accesorios en una sola plataforma.**

---

## 3. Problemática

En El Salvador, muchas personas publican mascotas perdidas, encontradas, abandonadas o en adopción por medio de grupos de Facebook, WhatsApp, historias de Instagram o publicaciones sueltas. Esto genera varios problemas:

- La información se pierde rápido entre muchas publicaciones.
- No existe una base centralizada de mascotas perdidas y encontradas.
- Las fundaciones y rescatistas tienen dificultad para recibir donaciones y dar seguimiento a los casos.
- Muchas personas quieren ayudar, pero no saben cómo, a quién donar o qué caso es real.
- El transporte de mascotas hacia veterinarias, refugios o nuevos hogares es complicado.
- Las personas no siempre saben dónde comprar comida, accesorios o servicios veterinarios.
- Los vendedores pequeños de productos para mascotas no tienen una vitrina digital organizada.
- Los adoptantes no siempre encuentran mascotas compatibles con su estilo de vida.

---

## 4. Solución propuesta

dueño de la mascota o usuario(donaciones)
veterinaria
uberpet(usuario normal y conductor)
fundacion
tienda(vendedor y usuario)

Crear una plataforma digital llamada **ChuchoConnect AI**, donde cualquier persona pueda:

- Reportar una mascota perdida.
- Reportar una mascota encontrada.
- Publicar mascotas en adopción.
- Solicitar adopción responsable.
- Crear campañas de donación para casos veterinarios o alimento.
- Solicitar transporte tipo **UberPet**.
- Consultar veterinarias cercanas.
- Comprar comida y accesorios para mascotas.
- Comparar precios de alimento.
- Recibir recomendaciones con inteligencia artificial.
- Generar carteles automáticos para mascotas perdidas o en adopción.
- Recibir alertas por correo, WhatsApp o SMS.

La inteligencia artificial ayuda a mejorar la experiencia mediante generación de descripciones, carteles, recomendaciones, clasificación de urgencias y apoyo en la toma de decisiones.

---

## 5. Objetivo general

Desarrollar una plataforma web inteligente que centralice servicios de rescate, adopción, donaciones, transporte, veterinarias y marketplace para mascotas, facilitando la conexión entre personas, fundaciones, transportistas, veterinarias y vendedores en El Salvador.

---

## 6. Objetivos específicos

- Permitir el registro de mascotas perdidas, encontradas y en adopción.
- Facilitar la creación de campañas de donación para casos de ayuda animal.
- Implementar un módulo básico de transporte tipo UberPet.
- Crear un marketplace de comida y accesorios para mascotas.
- Incluir perfiles para distintos tipos de usuarios.
- Usar inteligencia artificial para generar descripciones, carteles y recomendaciones.
- Automatizar alertas y confirmaciones mediante flujos con n8n.
- Publicar el sistema en línea para una demo funcional en menos de 24 horas.

---

## 7. Tipos de usuarios

### 7.1 Visitante

Usuario que entra sin registrarse.

Puede:

- Ver mascotas perdidas.
- Ver mascotas encontradas.
- Ver mascotas en adopción.
- Ver campañas de donación.
- Ver productos y accesorios.
- Ver veterinarias.
- Ver información general de la plataforma.

No puede:

- Reportar mascotas.
- Donar.
- Solicitar transporte.
- Comprar productos.
- Postularse para adopción.

Para cualquier acción importante debe registrarse.

---

### 7.2 Persona registrada

Usuario común de la plataforma.

Puede:

- Reportar una mascota perdida.
- Reportar una mascota encontrada.
- Solicitar adopción.
- Donar a campañas.
- Solicitar UberPet.
- Comprar comida o accesorios.
- Guardar favoritos.
- Recibir alertas.
- Consultar historial de acciones.

---

### 7.3 Transportista / UberPet

Usuario que ofrece transporte para mascotas.

Puede:

- Registrarse como conductor.
- Indicar zonas donde trabaja.
- Indicar tipo de vehículo.
- Aceptar solicitudes de traslado.
- Ver origen y destino.
- Cambiar estado del viaje.
- Subir evidencia de recogida o entrega.
- Recibir calificaciones.

Estados del viaje:

```text
Pendiente → Aceptado → En camino → Mascota recogida → Entregado → Finalizado
```

---

### 7.4 Fundación / Rescatista

Usuario para fundaciones, refugios o rescatistas independientes.

Puede:

- Publicar mascotas en adopción.
- Crear campañas de donación.
- Solicitar transporte solidario.
- Reportar casos urgentes.
- Ver donaciones recibidas.
- Actualizar estado de mascotas.
- Publicar necesidades de alimento, medicina o hogar temporal.

---

### 7.5 Donante (puede ser cualquier usuario registrado)

Puede ser una persona natural, empresa o usuario registrado que quiere apoyar.

Puede:

- Donar dinero.
- Donar alimento.
- Donar accesorios.
- Patrocinar transporte.
- Apoyar una campaña específica.
- Ver historial de donaciones.
- Recibir comprobante.

Nota: Para el MVP, el donante puede ser tratado como una persona registrada con acciones de donación.

---

### 7.6 Veterinaria

Usuario para clínicas veterinarias o médicos veterinarios.

Puede:

- Publicar servicios.
- Registrar horarios.
- Aparecer en el directorio.
- Ofrecer descuentos o apoyo a fundaciones.
- Publicar jornadas de vacunación o esterilización.
- Recibir solicitudes de atención.

---

### 7.7tienda de mascotas

Usuario que ofrece comida, accesorios o productos para mascotas.

Puede:

- Publicar productos.
- Registrar precios de comida.
- Actualizar inventario.
- Recibir pedidos.
- Ofrecer promociones.
- Aparecer como proveedor recomendado.

Productos posibles:

- Comida.
- Collares.
- Correas.
- Camas.
- Placas.
- Juguetes.
- Transportadoras.
- Shampoo.
- Pecheras.
- Bolsas para desechos.

---

### 7.8 Administrador

Usuario encargado de controlar la plataforma.

Puede:

- Aprobar fundaciones.
- Aprobar transportistas.
- Revisar campañas.
- Bloquear publicaciones falsas.
- Gestionar usuarios.
- Validar veterinarias y vendedores.
- Revisar reportes generales.

---

## 8. Roles recomendados para el MVP

Para terminar en menos de 24 horas, se recomienda trabajar solo con estos roles:

1. Visitante.
2. Persona registrada.
3. Fundación.
4. Transportista.
5. Veterinaria.
6. tienda de mascotas.
7. Administrador interno.

---

## 9. Módulos principales del sistema

### 9.1 Módulo de mascotas perdidas

Permite registrar una mascota perdida.

Campos sugeridos:

- Nombre de la mascota.
- Tipo de mascota.
- Raza o descripción.
- Color.
- Tamaño.
- Zona donde se perdió.
- Fecha.
- Contacto.
- Foto.
- Recompensa opcional.

Funciones con IA:

- Generar descripción clara.
- Crear texto para redes sociales.
- Generar cartel de “Se busca”.
- Enviar alerta a usuarios cercanos.

---

### 9.2 Módulo de mascotas encontradas

Permite registrar animales encontrados.

Campos sugeridos:

- Foto.
- Zona donde fue encontrado.
- Descripción.
- Estado del animal.
- Contacto.

Funciones:

- Comparación básica con mascotas perdidas.
- Notificación de posible coincidencia.
- Generación de publicación automática.

Para el MVP, el match puede ser por:

- Tipo.
- Color.
- Zona.
- Fecha.
- Tamaño.

---

### 9.3 Módulo de adopciones

Permite publicar mascotas disponibles para adopción.

Campos sugeridos:

- Nombre.
- Edad aproximada.
- Tamaño.
- Personalidad.
- Estado de salud.
- Vacunas.
- Esterilización.
- Ubicación.
- Fotos.
- Requisitos de adopción.

Funciones con IA:

- Generar descripción de adopción.
- Recomendar mascotas según estilo de vida.
- Crear texto emocional para publicación.

---

### 9.4 Módulo de donaciones

Permite crear campañas de ayuda.

Ejemplo:

```text
Caso: Luna necesita cirugía por atropello
Meta: $150
Recaudado: $85
Faltante: $65
Fundación responsable: Huellitas SV
Estado: Verificado
```

Tipos de donación:

- Dinero.
- Alimento.
- Medicinas.
- Accesorios.
- Transporte.
- Hogar temporal.
- Servicios veterinarios.

Para el MVP, la donación puede ser simulada con un botón de “Donar”.

---

### 9.5 Módulo UberPet

Módulo de transporte para mascotas.

Casos de uso:

- Llevar una mascota a la veterinaria.
- Transportar una mascota adoptada.
- Recoger un animal rescatado.
- Llevar donaciones a una fundación.
- Trasladar mascotas a campañas de vacunación o esterilización.

Campos sugeridos:

- Origen.
- Destino.
- Tipo de mascota.
- Tamaño.
- Urgencia.
- Observaciones.
- Transportista asignado.
- Estado del viaje.

Estados:

```text
Pendiente
Aceptado
En camino
Mascota recogida
Entregado
Cancelado
```

Importante: Para 24 horas no hacer mapa real ni geolocalización en tiempo real. Usar direcciones escritas y estados.

---

### 9.6 Módulo de veterinarias

Directorio de veterinarias aliadas.

Campos sugeridos:

- Nombre de la clínica.
- Servicios.
- Ubicación.
- Teléfono.
- Horario.
- Contacto.
- Promociones o jornadas.

---

### 9.7 Módulo de marketplace

Permite vender comida y accesorios para mascotas.

Categorías:

- Comida.
- Collares.
- Correas.
- Camas.
- Juguetes.
- Transportadoras.
- Higiene.
- Placas.

Funciones:

- Catálogo de productos.
- Comparador de precios de comida.
- Recomendaciones de alimento o accesorios.
- Promociones.

Ejemplo de consulta:

> “Tengo un perro adulto mediano y $25, ¿qué comida me conviene?”

La IA puede recomendar el producto más adecuado del catálogo.

---

### 9.8 Módulo de precios de comida

Permite comparar precios de alimento.

Campos sugeridos:

- Marca.
- Peso.
- Precio.
- Tienda.
- Precio por libra o kilogramo.
- Disponibilidad.

Para el MVP se recomienda usar datos simulados.

---

### 9.9 Módulo de inteligencia artificial

La IA debe apoyar en funciones concretas, no estar solo de adorno.

Funciones recomendadas:

- Generar descripción de mascota perdida.
- Generar cartel o texto de publicación.
- Clasificar urgencia de un caso.
- Recomendar comida o accesorios.
- Recomendar mascotas en adopción según estilo de vida.
- Generar resumen de campaña de donación.
- Crear texto para compartir en WhatsApp o redes sociales.

---

## 10. Tecnologías recomendadas

### Stack principal para menos de 24 horas

```text
Next.js
Tailwind CSS
Supabase
Flowise
n8n
ElevenLabs
Fal
Netlify o Vercel
Zavu (para mensajes)
DataMCP / MCP
```

---

## 11. Uso de cada tecnología

### 11.1 Next.js

Framework principal para construir la aplicación web.

Se usará para:

- Crear páginas.
- Crear formularios.
- Crear paneles por rol.
- Crear rutas.
- Conectar con Supabase.
- Crear API routes si es necesario.

---

### 11.2 Tailwind CSS

Framework de estilos.

Se usará para:

- Diseñar tarjetas.
- Crear formularios bonitos.
- Crear paneles rápidos.
- Mantener una interfaz uniforme.

---

### 11.3 Supabase

Base de datos, autenticación y almacenamiento.

Se usará para:

- Registro e inicio de sesión.
- Roles de usuario.
- Guardar mascotas.
- Guardar campañas de donación.
- Guardar solicitudes de UberPet.
- Guardar productos.
- Guardar veterinarias.
- Guardar fotos en Supabase Storage.

---

### 11.4 Cursor

Editor de código con IA.

Se usará para:

- Programar más rápido.
- Crear componentes.
- Corregir errores.
- Generar formularios.
- Crear conexión con Supabase.

---

### 11.5 Codex

Agente de programación.

Se usará para:

- Apoyar en generación de código.
- Crear validaciones.
- Crear consultas.
- Corregir bugs.
- Crear APIs.

---

### 11.6 Cognition

Agente de ingeniería de software.

Puede usarse para:

- Delegar módulos grandes.
- Revisar código.
- Crear funcionalidades completas.

Para el MVP, puede usarse como apoyo, no como integración visible.

---

### 11.7 n8n

Automatización de procesos.

Flujos recomendados:

#### Flujo mascota perdida

```text
Formulario de mascota perdida
↓
Webhook de n8n
↓
Guardar o recibir datos
↓
Enviar alerta por correo/WhatsApp
↓
Confirmar publicación
```

#### Flujo donación

```text
Usuario dona
↓
n8n registra la donación
↓
Actualiza campaña
↓
Envía comprobante
```

#### Flujo UberPet

```text
Usuario solicita viaje
↓
n8n notifica transportista
↓
Transportista acepta
↓
n8n avisa al usuario
```

---

### 11.8 Flowise

Herramienta para crear asistentes IA.

Se usará para:

- Generar descripción de mascota.
- Recomendar productos.
- Clasificar urgencias.
- Crear texto de adopción.
- Ayudar al usuario a llenar formularios.

Prompt sugerido:

```text
Eres un asistente de una plataforma de mascotas en El Salvador.
Genera textos claros, breves y humanos para reportes de mascotas perdidas, adopciones, campañas de donación y recomendaciones de productos.
Usa lenguaje sencillo y empático.
No inventes datos que el usuario no proporcionó.
```

---

### 11.9 ElevenLabs

Generación de voz.

Se usará para:

- Crear audios para campañas.
- Crear audios de mascotas perdidas.
- Narrar historias de adopción.
- Generar mensajes para compartir.

Ejemplo:

> “Rocky está perdido desde ayer en Santa Tecla. Si lo has visto, comunícate con su familia.”

---

### 11.10 Fal

Generación de imágenes o contenido visual.

Se usará para:

- Carteles de “Se busca”.
- Carteles de “En adopción”.
- Banners de campañas.
- Promociones de accesorios.

Si no da tiempo, se puede usar una plantilla HTML o imagen base y dejar Fal como mejora.

---

### 11.11 Zavu

Mensajería multicanal.

Se usará para:

- WhatsApp.
- SMS.
- Correo.
- Alertas.
- Confirmaciones.
- Mensajes a transportistas.

Si no se logra integrar, se puede simular con n8n y correo.

---

### 11.12 DataMCP / MCP

Conexión entre IA y datos del sistema.

Se usaría para que la IA consulte:

- Mascotas perdidas.
- Mascotas en adopción.
- Productos.
- Campañas.
- Viajes.

Para el MVP, se puede reemplazar por consultas directas a Supabase o datos mock.

---

### 11.13 Abacus AI

Análisis de datos.

Se usaría para:

- Zonas con más mascotas perdidas.
- Campañas con más donaciones.
- Productos más consultados.
- Viajes UberPet más frecuentes.
- Adopciones exitosas.

Para el MVP, se puede crear un dashboard simple con estadísticas simuladas.

---

### 11.14 Exa

Búsqueda inteligente en internet.

Se podría usar para:

- Buscar veterinarias.
- Buscar recursos sobre cuidado animal.
- Buscar precios públicos de comida.
- Buscar campañas o servicios disponibles.

Para 24 horas, se recomienda dejarlo como mejora o usarlo en una sección pequeña.

---

### 11.15 Firecrawl

Extracción de información de sitios web.

Se podría usar para:

- Extraer precios de comida de sitios públicos.
- Extraer información de tiendas.
- Extraer servicios veterinarios.

Para el MVP, se recomienda usar datos simulados para evitar bloqueos o problemas de scraping.

---

### 11.16 Netlify o Vercel

Plataforma para publicar la aplicación.

Se usará para:

- Tener un enlace público.
- Presentar la demo.
- Hacer deploy rápido.

Para Next.js, Vercel suele ser más directo, pero Netlify también puede funcionar.

---

### 11.17 Dropbox

Almacenamiento de archivos.

Se podría usar para:

- Fotos de mascotas.
- Comprobantes.
- Carteles generados.
- Recetas veterinarias.
- Documentos de fundaciones.

En el MVP, Supabase Storage puede cubrir esta función. Dropbox puede mencionarse como integración adicional.

### 11.19 Flow

Creación de video con IA.

Se podría usar para:

- Video promocional del proyecto.
- Video de adopción.
- Video de campaña.

Para el MVP puede quedar como recurso de presentación si sobra tiempo.

---

## 12. Tablas mínimas en Supabase

### 12.1 `profiles`

```text
id
full_name
email
phone
role
created_at
```

Roles sugeridos:

```text
person
foundation
driver
vet
seller
admin
```

---

### 12.2 `pets`

```text
id
name
type
status
size
color
description
location
image_url
owner_id
created_at
```

Status:

```text
lost
found
adoption
rescued
```

---

### 12.3 `donation_campaigns`

```text
id
title
description
goal_amount
current_amount
image_url
foundation_id
status
created_at
```

---

### 12.4 `donations`

```text
id
campaign_id
donor_id
amount
payment_status
created_at
```

---

### 12.5 `rides`

```text
id
user_id
driver_id
pet_id
pickup_location
dropoff_location
status
price
created_at
```

Status:

```text
pending
accepted
on_the_way
picked_up
delivered
cancelled
```

---

### 12.6 `products`

```text
id
seller_id
name
category
price
description
image_url
stock
created_at
```

Categorías:

```text
food
collar
leash
bed
toy
carrier
hygiene
accessory
```

---

### 12.7 `vets`

```text
id
profile_id
clinic_name
services
location
phone
schedule
created_at
```

---

## 13. Estructura recomendada del proyecto Next.js

```text
/src
  /app
    /(public)
      /page.tsx
    /auth
      /login
      /register
    /dashboard
      /page.tsx
    /pets
      /page.tsx
      /new
      /[id]
    /adoptions
      /page.tsx
    /donations
      /page.tsx
      /new
    /uberpet
      /page.tsx
      /new
      /driver
    /marketplace
      /page.tsx
    /vets
      /page.tsx
  /components
    /ui
    /pets
    /donations
    /uberpet
    /marketplace
    /vets
  /lib
    supabaseClient.ts
    ai.ts
    n8n.ts
  /data
    mockPets.ts
    mockProducts.ts
    mockVets.ts
    mockCampaigns.ts
```

---

## 14. División de trabajo para 5 personas

### Persona 1: Base del proyecto, auth, layout e integración

Responsabilidades:

- Crear proyecto Next.js.
- Configurar Tailwind.
- Configurar Supabase.
- Crear estructura de carpetas.
- Crear navbar y layout general.
- Crear login/registro.
- Crear roles.
- Publicar en Netlify o Vercel.
- Integrar ramas al final.

Pantallas:

- Inicio.
- Login.
- Registro.
- Dashboard.

---

### Persona 2: Mascotas perdidas, encontradas y adopción

Responsabilidades:

- Formulario de mascota perdida.
- Formulario de mascota encontrada.
- Publicar mascota en adopción.
- Listado de mascotas.
- Detalle de mascota.
- Solicitud de adopción básica.
- Subida de fotos.

IA:

- Generar descripción de mascota.
- Generar texto de cartel.

---

### Persona 3: Donaciones y fundaciones

Responsabilidades:

- Perfil básico de fundación.
- Crear campaña de donación.
- Listar campañas.
- Simular donación.
- Actualizar monto recaudado.
- Mostrar barra de progreso.
- Confirmación de donación.

Automatización:

- n8n para enviar confirmación por correo o mensaje.

---

### Persona 4: UberPet y transportistas

Responsabilidades:

- Formulario para solicitar transporte.
- Panel de transportista.
- Ver solicitudes pendientes.
- Aceptar viaje.
- Cambiar estado del viaje.
- Historial de viajes.

Importante:

- No hacer mapa real.
- Usar origen/destino en texto.
- Mostrar estados del viaje.

---

### Persona 5: Marketplace, veterinarias e IA

Responsabilidades:

- Catálogo de accesorios.
- Catálogo de comida.
- Comparador de precios.
- Directorio de veterinarias.
- Recomendador de comida/accesorio con IA.
- Integración con Flowise, ElevenLabs o Fal si da tiempo.

---

## 15. Flujo de trabajo en Git

### Ramas sugeridas

```text
main
dev
feature/base-auth-layout
feature/pets-adoptions
feature/donations-foundations
feature/uberpet
feature/marketplace-vets-ai
```

### Reglas

- No trabajar todos en los mismos archivos.
- Cada persona trabaja en su carpeta o módulo.
- Hacer commits pequeños.
- Integrar primero en `dev`.
- Solo pasar a `main` cuando la demo funcione.
- Una persona debe ser responsable de integrar.

---

## 16. Plan de trabajo en menos de 24 horas

### Hora 0 a 1: Definición rápida

Decidir:

- Nombre final.
- Colores.
- Stack.
- Roles.
- Tablas.
- Pantallas.
- Persona integradora.
- Repositorio.

---

### Hora 1 a 3: Base técnica

Persona 1 crea:

- Proyecto Next.js.
- Tailwind.
- Supabase.
- Layout.
- Navbar.
- Rutas principales.
- Estructura de carpetas.

Los demás preparan datos mock y diseños de sus módulos.

---

### Hora 3 a 10: Desarrollo por módulos

Cada persona trabaja su módulo de forma independiente.

Prioridad:

- Formularios funcionales.
- Listados.
- Cards.
- Estados.
- Datos en Supabase o mock.

---

### Hora 10 a 14: Primera integración

Integrar:

- Mascotas.
- Donaciones.
- UberPet.
- Marketplace.
- Veterinarias.
- Menú.

Corregir:

- Rutas rotas.
- Errores visuales.
- Conflictos de Git.
- Problemas de Supabase.

---

### Hora 14 a 18: IA y automatizaciones

Integrar lo más llamativo:

- Flowise para generar descripción.
- n8n para alertas o confirmaciones.
- ElevenLabs para audio de campaña o mascota perdida.
- Fal para cartel o imagen si da tiempo.

---

### Hora 18 a 21: Pulido visual

Agregar:

- Cards bonitas.
- Botones claros.
- Mensajes de éxito.
- Estados visuales.
- Datos realistas.
- Dashboard simple.
- Gráficos básicos si da tiempo.

---

### Hora 21 a 23: Preparación del pitch y demo

Preparar:

- Historia del problema.
- Flujo de demostración.
- Roles del equipo.
- Tecnologías usadas.
- Impacto.
- Próximos pasos.

---

### Hora 23 a 24: Ensayo final

Ensayar:

- Quién habla.
- Quién maneja la demo.
- Qué flujo se mostrará.
- Qué hacer si algo falla.
- Capturas o video de respaldo.

---

## 17. MVP mínimo obligatorio

Si el tiempo se complica, el sistema debe tener al menos:

1. Página de inicio.
2. Entrada como visitante.
3. Registro/login o selección simulada de rol.
4. Listado de mascotas perdidas y adopciones.
5. Formulario para reportar mascota.
6. Campañas de donación.
7. Solicitud de UberPet.
8. Catálogo de productos.
9. Directorio de veterinarias.
10. Una función IA visible.
11. Deploy en línea.

---

## 19. Demo recomendada

### Flujo de demo

1. Visitante entra y ve la plataforma.
2. Se registra como persona.
3. Reporta un perro perdido.
4. La IA genera una descripción o cartel.
5. Se muestra alerta o confirmación automática.
6. Fundación crea campaña de donación.
7. Donante realiza donación simulada.
8. Usuario solicita UberPet.
9. Transportista acepta el viaje.
10. Vendedor muestra comida y accesorios.
11. Veterinaria aparece como aliada.

---

## 20. Pitch largo

**ChuchoConnect AI** es una plataforma inteligente para mascotas en El Salvador que centraliza rescate, adopción, donaciones, transporte, veterinarias y productos para mascotas en un solo lugar.

Actualmente, cuando una mascota se pierde, necesita adopción o requiere ayuda veterinaria, la información se dispersa en grupos de Facebook, WhatsApp o publicaciones individuales. Esto hace que los casos se pierdan rápido, que las fundaciones tengan dificultad para recibir apoyo y que muchas personas no sepan dónde acudir.

Nuestra solución permite que cualquier persona pueda reportar una mascota perdida, publicar una mascota en adopción, donar a campañas verificadas, solicitar transporte tipo UberPet, consultar veterinarias y comprar comida o accesorios. La inteligencia artificial ayuda a generar carteles, redactar publicaciones, recomendar productos, clasificar casos urgentes y enviar alertas automáticas.

El impacto de ChuchoConnect AI es que conecta a dueños, adoptantes, fundaciones, veterinarias, transportistas y tiendas en una misma red, facilitando ayuda real para los animales y creando oportunidades para pequeños negocios relacionados con mascotas.

---

## 21. Pitch corto

> **ChuchoConnect AI es una plataforma que conecta personas, fundaciones, veterinarias, transportistas y tiendas para resolver necesidades de mascotas: encontrar perros perdidos, facilitar adopciones, recibir donaciones, pedir transporte tipo UberPet y comprar comida o accesorios en un solo lugar.**

---

## 22. Frase de impacto

> **No queremos que una mascota perdida dependa de que alguien vea una publicación perdida en Facebook. Queremos centralizar la búsqueda, conectar reportes y aumentar las posibilidades de que vuelva a casa.**

---

## 23. Recomendación final

Para terminar en menos de 24 horas, el equipo debe enfocarse en construir un **MVP funcional**, no una plataforma perfecta.

La prioridad debe ser:

1. Que el flujo principal funcione.
2. Que los módulos estén conectados visualmente.
3. Que haya una función de IA visible.
4. Que exista una demo clara.
5. Que el proyecto esté desplegado.

El alcance ideal es:

```text
Mascotas perdidas + Adopciones + Donaciones + UberPet básico + Marketplace + Veterinarias + IA para textos/carteles
```

Con eso, ChuchoConnect AI se presenta como una solución grande, útil y realizable en una primera versión.
