# Diseño: Capturar datos de contacto al inicio del diagnóstico

Fecha: 2026-07-09

## Contexto

Hoy el flujo del autodiagnóstico es:

1. **Intake** (org): nombre, antigüedad, donataria, puesto de quien contesta.
2. **10 preguntas** → crea `Submission` → redirige a `/reporte/[id]`.
3. **En el reporte**, `EnrollCta` captura los datos de contacto (nombre, correo,
   teléfono) solo si el usuario hace clic en "Quiero más información", y marca
   `wantsToEnroll = true`.

Los datos de contacto se piden al final y son opcionales, por lo que se pierden
muchos leads que completan el diagnóstico pero no llenan el formulario final.

## Objetivo

Pedir los datos de contacto **al inicio**, junto con los datos de la
organización, para capturar el lead de todos los que empiezan el diagnóstico.

## Decisiones

- **Modelo de flujo:** capturar contacto al inicio y **eliminar el formulario de
  contacto del final**.
- **Campos requeridos al inicio:** nombre, correo y teléfono, **todos
  obligatorios** (además de los datos de organización ya existentes).
- **CTA del reporte:** se conserva un **botón simple de interés** ("Me interesa
  este programa") que marca `wantsToEnroll = true` con un clic, sin formulario.

## Diseño

### Pantalla de intake (una sola pantalla, dos secciones)

- **Datos de contacto**
  - Nombre de contacto — requerido
  - Puesto de quien contesta (`respondentRole`) — requerido (campo ya existente)
  - Correo electrónico — requerido, validado como email
  - Teléfono — requerido
- **Datos de la organización**
  - Nombre de la organización — requerido
  - Antigüedad en años — requerido (entero, 0..300)
  - ¿Donataria autorizada? — requerido

No se avanza a las preguntas hasta que todos los campos sean válidos.

### Validación (`src/lib/validation.ts`)

- `submissionSchema` se amplía con:
  - `contactName: string` (trim, min 1, max 200)
  - `contactEmail: string` (email, max 200)
  - `contactPhone: string` (trim, min 1, max 50) — ahora requerido
- El path de enroll deja de recibir datos de contacto.

### API de creación (`POST /api/submissions`)

- Recibe y guarda `contactName`, `contactEmail`, `contactPhone` al crear la
  `Submission`. `wantsToEnroll` permanece en `false` al crear.

### API de enroll (`POST /api/submissions/[id]/enroll`)

- Se simplifica: solo marca `wantsToEnroll = true`. Ya no requiere cuerpo ni
  datos de contacto.

### Reporte (`EnrollCta.tsx`)

- Se elimina el formulario. Queda un **botón único** que hace POST al endpoint
  de enroll y muestra el mensaje de agradecimiento existente. El contacto ya
  está en la base.

### Modelo de datos (`prisma/schema.prisma`)

- **Sin migración**: las columnas `contactName/contactEmail/contactPhone` ya
  existen (nullable). Ahora siempre se poblarán al crear. Los registros previos
  conservan sus nulos; se mantienen nullable para evitar backfill.

### Admin

- Sin cambios. Los campos de contacto que ya muestra ahora estarán siempre
  presentes.

## Fuera de alcance

- Migración a columnas NOT NULL (se mantiene nullable).
- Consentimiento/aviso de privacidad explícito (se puede abordar aparte).
- Cambios en el cálculo de puntaje o en el contenido del cuestionario.
