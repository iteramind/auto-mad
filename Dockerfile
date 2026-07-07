# Build deterministico para Railway (evita cachés de CSS obsoletas de Nixpacks/Railpack).
FROM node:22-alpine AS build
WORKDIR /app

# Instala dependencias (postinstall corre `prisma generate`, por eso copiamos el schema antes).
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# Copia el resto del código y compila (prisma generate + next build).
COPY . .
RUN npm run build

# Imagen de ejecución.
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copia la app ya compilada con sus dependencias.
COPY --from=build /app ./

EXPOSE 3000
# `npm start` aplica migraciones (prisma migrate deploy) y arranca Next.
CMD ["npm", "start"]
