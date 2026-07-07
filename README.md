# Autodiagnóstico de Fortalecimiento Institucional

Herramienta web para que **organizaciones de la sociedad civil (OSC)** autodiagnostiquen su
**madurez institucional** y reciban la recomendación del **programa** al que conviene sumarse.
Desarrollada para el **Centro para el Fortalecimiento de la Sociedad Civil (CFOSC)** en el marco
del programa *Fortalece FEC Coahuila*.

- 🌐 **Producción:** https://fec.fortalecimiento.org · **Repo:** `iteramind/auto-mad`
- 📝 Cuestionario de **10 preguntas** en **5 bloques** (el respondiente NO necesita cuenta).
- 📊 **Reporte** con nivel de madurez, **gráfica de araña**, tabla de % por área y **programa recomendado** con botón para inscribirse.
- 🔐 **Panel admin** (con login) para consultar diagnósticos y **exportar a CSV**.

## Stack

Next.js 15 (App Router, TS) · PostgreSQL + Prisma · Tailwind CSS v4 · Recharts · iron-session ·
desplegado en **Railway** (build por Dockerfile, Postgres gestionado).

## Cómo funciona

**Flujo del respondiente** (`/`): captura datos de la organización (nombre, años, donataria, puesto),
responde 10 preguntas y obtiene un reporte en `/reporte/[id]`. El puntaje se calcula **en el servidor**.

**Puntaje** (`src/lib/scoring.ts`): cada respuesta vale 1–4 puntos, **menor total = mayor madurez**.
El total (10–40) determina el nivel/programa; el % por bloque de la araña es `(4 − promedio) / 3 × 100`.

| Puntaje | Nivel / Programa recomendado |
|---|---|
| 10–14 | Escalamiento e impacto transformador |
| 15–24 | Innovación institucional |
| 25–34 | Construcción y consolidación de capacidades |
| 35–40 | Organización emergente |

Rangos, textos y programas son editables en `src/lib/scoring.ts`; las preguntas en
`src/lib/questionnaire.ts` (transcritas del cuestionario SESFI).

## Estructura

| Área | Archivo(s) |
|---|---|
| Cuestionario (contenido) | `src/lib/questionnaire.ts` |
| Motor de puntaje + tests | `src/lib/scoring.ts`, `src/lib/scoring.test.ts` |
| Formulario del respondiente | `src/components/DiagnosticForm.tsx`, `src/app/page.tsx` |
| Reporte (araña + tabla + CTA) | `src/app/reporte/[id]/page.tsx`, `src/components/RadarChartClient.tsx` |
| Panel admin | `src/app/admin/**`, `src/lib/auth.ts`, `src/lib/admins.ts` |
| API | `src/app/api/**` |
| Modelo de datos | `prisma/schema.prisma` (modelo `Submission`) |
| Marca CFOSC | `src/app/layout.tsx`, `public/brand/*.svg` |

## Desarrollo local

Requisitos: Node 20+ y PostgreSQL (o `docker compose up -d` para levantar la base en `localhost:5432`).

```bash
npm install
cp .env.example .env        # completa las variables
npx prisma migrate dev      # crea el esquema
npm run dev                 # http://localhost:3000  (panel en /admin)
npm test                    # 20 tests del motor de puntaje
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL. En Railway: `${{ Postgres.DATABASE_URL }}`. |
| `SESSION_SECRET` | Secreto (≥32 chars) para firmar la cookie de sesión admin. |
| `ADMIN_EMAIL` + `ADMIN_PASSWORD` | Credencial del admin principal (texto plano). |
| `ADMIN_PASSWORD_HASH` | Alternativa al anterior: hash bcrypt (tiene prioridad). En un `.env` local escapa cada `$` como `\$`; en Railway va literal. |
| `ADMIN_ACCOUNTS` | Admins adicionales, JSON: `[{"email":"...","password":"..."}]` (acepta `passwordHash`). |

El respondiente del diagnóstico nunca usa login; estas variables solo protegen `/admin`.

## Despliegue (Railway)

El repo está conectado al servicio `web`: **cada `git push` a `main` despliega automáticamente**.

- **Build:** usa el **Dockerfile** (no Nixpacks). Es intencional: la caché de build de Nixpacks/Railpack
  servía CSS de Tailwind obsoleto; Docker rehace el build de forma determinista ante cualquier cambio.
- **Arranque:** `npm start` corre `prisma migrate deploy && next start`, así que las migraciones se
  aplican en cada arranque.
- **Servicios:** `web` (la app) + plugin **Postgres**. Dominio propio: `fec.fortalecimiento.org`.

Para desplegar en una instancia nueva: crear proyecto en Railway desde el repo, agregar el plugin
PostgreSQL, definir las variables de entorno de arriba, y conectar un dominio.
