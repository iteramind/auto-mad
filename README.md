# Autodiagnóstico de Fortalecimiento Institucional (SESFI)

Herramienta web auto‑hospedada para que **organizaciones de la sociedad civil (OSC)**
autodiagnostiquen su **madurez institucional** y reciban la recomendación del
**programa** al que conviene sumarse.

- Cuestionario de **10 preguntas** en **5 bloques** (sin usuario ni contraseña para el respondiente).
- **Reporte** con nivel de madurez, **gráfica de araña** y **tabla** de porcentajes por área, y **programa recomendado** con botón para **sumarse**.
- **Panel administrativo** (con login) para consultar y **exportar a CSV** todos los diagnósticos.

## Stack

Next.js 15 (App Router, TypeScript) · PostgreSQL + Prisma · Tailwind CSS · Recharts · iron-session.

## Estructura

| Área | Archivo |
|---|---|
| Contenido del cuestionario | `src/lib/questionnaire.ts` |
| Motor de puntaje (+ tests) | `src/lib/scoring.ts`, `src/lib/scoring.test.ts` |
| Formulario del respondiente | `src/components/DiagnosticForm.tsx`, `src/app/page.tsx` |
| Reporte + araña + CTA | `src/app/reporte/[id]/page.tsx` |
| API | `src/app/api/**` |
| Panel admin | `src/app/admin/**` |
| Modelo de datos | `prisma/schema.prisma` |

### Lógica de puntaje

Cada respuesta vale 1–4 puntos (**menor puntaje = mayor madurez**). El total (10–40) determina el nivel:

| Puntaje | Nivel / Programa recomendado |
|---|---|
| 10–14 | Escalamiento e impacto transformador |
| 15–24 | Innovación institucional |
| 25–34 | Construcción y consolidación de capacidades |
| 35–40 | Organización emergente |

Porcentaje de madurez por bloque (araña): `(4 − promedio) / 3 × 100`.
Los rangos y textos son editables en `src/lib/scoring.ts`.

## Desarrollo local

Requisitos: Node 20+ y un PostgreSQL accesible.

```bash
npm install
cp .env.example .env          # completa las variables (ver abajo)
npx prisma migrate dev        # crea el esquema en tu base de datos
npm run dev                   # http://localhost:3000
npm test                      # tests del motor de puntaje
```

Con Docker para la base local: `docker compose up -d` levanta PostgreSQL en `localhost:5432`
(usa el `DATABASE_URL` del `.env.example`).

Panel admin en `/admin`.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL. |
| `ADMIN_EMAIL` | Correo del panel admin. |
| `ADMIN_PASSWORD` | Contraseña del admin en texto plano (opción recomendada). |
| `ADMIN_PASSWORD_HASH` | Alternativa: hash bcrypt. Si se define, tiene prioridad. En un `.env` local escapa cada `$` como `\$`. |
| `SESSION_SECRET` | Secreto (≥32 chars) para firmar la cookie de sesión. |

## Despliegue en Railway

1. **Nuevo proyecto** → *Deploy from GitHub repo* → `rosquillas/auto-mad`.
2. Agrega el plugin **PostgreSQL** (New → Database → PostgreSQL).
3. En el servicio de la app, define las variables:
   - `DATABASE_URL` = `${{ Postgres.DATABASE_URL }}` (referencia al plugin).
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET`.
4. **No requiere comandos personalizados**: `npm run build` corre `prisma generate && next build`,
   y `npm start` corre `prisma migrate deploy && next start` (aplica migraciones y arranca).
5. Railway asigna un dominio público. Los diagnósticos quedan en `/`, el panel en `/admin`.

> Nota: en Railway las variables se guardan **literales**, por lo que un hash bcrypt con `$`
> funciona sin escaparse. El escape `\$` solo aplica a archivos `.env` locales.
