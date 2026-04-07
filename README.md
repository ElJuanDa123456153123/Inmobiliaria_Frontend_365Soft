# 🏠 Plataforma Inmobiliaria — Frontend

Frontend de la plataforma inmobiliaria boliviana. Interfaz responsiva con búsqueda avanzada, mapa interactivo, publicación vía WhatsApp y panel de agente con CRM integrado.

## 🚀 Stack Tecnológico

| Capa | Tecnología | Framework |
|------|------------|-----------|
| Frontend | Next.js 14 (App Router) | React |
| Estilos | Tailwind CSS | - |
| Componentes | shadcn/ui | - |
| Mapa | Leaflet.js + OpenStreetMap | - |
| Estado global | Zustand | - |
| Fetching | TanStack Query (React Query) | - |
| Formularios | React Hook Form + Zod | - |
| Lenguaje | TypeScript | - |

## 📋 Requisitos Previos

- **Node.js** 20+
- **npm** 10+ o **pnpm** 9+
- Backend corriendo en `http://localhost:3001`
- Opcional: Docker + Docker Compose (para PostgreSQL + Redis)

## 🔧 Crear desde Cero

```bash
# 1. Crear proyecto Next.js
npx create-next-app@latest . --typescript --tailwind --eslint --app

# 2. Inicializar shadcn/ui
npx shadcn@latest init

# 3. Instalar dependencias adicionales
npm install zustand @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod
npm install leaflet react-leaflet
npm install -D @types/leaflet

# 4. Configurar next.config.ts
# Agregar: output: 'standalone'

# 5. Copiar .env
cp .env.example .env.local

# 6. Iniciar
npm run dev
```

## 📥 Instalación desde Repositorio

⚠️ **IMPORTANTE:** Para evitar problemas con las rutas en Docker Compose, sigue estos pasos exactamente:

```bash
# 1. Crear carpeta principal del proyecto
mkdir Inmobiliaria365Soft
cd Inmobiliaria365Soft

# 2. Clonar el repositorio frontend
git clone https://github.com/365Soft-Bolivia/Inmobiliaria_Frontend_365Soft.git

# 3. Volver a la carpeta raiz
cd ..

# 4. Clonar el repositorio backend
git clone https://github.com/365Soft-Bolivia/Inmobiliaria_Backend_365Soft.git

# 5. Entrar a la carpeta frontend
cd Inmobiliaria_Frontend_365Soft

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Editar .env.local con tus valores
```

**Estructura esperada:**
```
Inmobiliaria365Soft/
├── Inmobiliaria_Frontend_365Soft/
└── Inmobiliaria_Backend_365Soft/
```

Esta estructura es necesaria para que el `docker-compose.yml` funcione correctamente con las rutas relativas.

## ⚙️ Variables de Entorno

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Mapa (no requiere API key con OpenStreetMap)
NEXT_PUBLIC_MAP_CENTER_LAT=-17.3895
NEXT_PUBLIC_MAP_CENTER_LNG=-66.1568
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=13

# WhatsApp (número del chatbot)
NEXT_PUBLIC_WHATSAPP_NUMBER=591XXXXXXXXX

# App
NEXT_PUBLIC_APP_NAME=Inmobiliaria Bolivia
NEXT_PUBLIC_APP_URL=https://tudominio.com
```

## 🎯 Modos de Ejecución

### Desarrollo
```bash
npm run dev
# Abre http://localhost:3000
```

### Build de producción
```bash
npm run build
npm start
```

### Verificar tipos TypeScript
```bash
npm run type-check
```

## 🐳 Docker (Desarrollo)

**Requiere Docker y Docker Compose instalados.**

⚠️ **IMPORTANTE:** Asegúrate de tener ambos repositorios clonados en la misma carpeta principal siguiendo las instrucciones de la sección "Instalación desde Repositorio".

```bash
# Desde la carpeta principal Inmobiliaria365Soft
cd Inmobiliaria365Soft

# Levantar todos los servicios (Frontend + Backend + PostgreSQL + Redis)
docker-compose up --build

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f frontend
```

**Servicios disponibles:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## 🧪 Probar la Instalación

```bash
# 1. Frontend - Abrir en navegador
# http://localhost:3000

# 2. Backend - Probar endpoint
curl http://localhost:3001/health
# Respuesta esperada: {"status":"ok","message":"API is running"}

# 3. Backend - Probar API
curl http://localhost:3001/api
# Respuesta esperada: {"message":"Bienvenido a la API de Inmobiliaria Bolivia"}

# 4. Verificar PostgreSQL (Docker)
docker exec -it inmobiliaria-postgres psql -U inmobiliaria_user -d inmobiliaria

# 5. Verificar Redis (Docker)
docker exec -it inmobiliaria-redis redis-cli ping
# Respuesta esperada: PONG
```

## 📁 Estructura del Proyecto

```
.
├── app/                        # App Router de Next.js 14
│   ├── (public)/
│   │   ├── page.tsx            # Página principal / buscador
│   │   ├── propiedades/
│   │   │   ├── page.tsx        # Listado de propiedades
│   │   │   └── [id]/page.tsx   # Ficha de detalle
│   │   └── inmobiliarias/
│   │       └── page.tsx        # Directorio de agentes
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── registro/page.tsx
│   ├── (panel)/
│   │   ├── panel/page.tsx      # Dashboard del agente
│   │   ├── mis-propiedades/    # Gestión de propiedades
│   │   ├── favoritos/          # Propiedades guardadas
│   │   └── crm/                # CRM de contactos
│   └── (admin)/
│       └── admin/              # Panel de administración
├── components/
│   ├── ui/                     # Componentes shadcn/ui
│   ├── propiedades/            # Tarjetas, galería, filtros
│   ├── mapa/                   # Mapa Leaflet interactivo
│   ├── busqueda/               # Buscador y filtros avanzados
│   └── layout/                 # Header, footer, nav
├── lib/
│   ├── api/                    # Clientes de API
│   ├── hooks/                  # Custom hooks
│   ├── store/                  # Estado global (Zustand)
│   └── utils/                  # Helpers y formatos
├── types/                      # Tipos TypeScript globales
├── public/                     # Assets estáticos
├── .env.example
└── README.md
```

## 📁 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm start            # Iniciar en producción
npm run lint         # Ejecutar ESLint
npm run type-check   # Verificar tipos TypeScript
npm run format       # Formatear con Prettier
```

## 🧩 Inicializar componentes shadcn/ui

```bash
# Inicializar shadcn (solo primera vez)
npx shadcn-ui@latest init

# Agregar componentes individuales
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add toast
```

## 🗺️ Configuración del Mapa (Leaflet)

Leaflet requiere importación dinámica en Next.js para evitar errores de SSR:

```tsx
// components/mapa/MapaInteractivo.tsx
import dynamic from 'next/dynamic'

const Mapa = dynamic(() => import('./MapaCliente'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
})
```

## 📱 Botón WhatsApp (Publicar Propiedad)

El botón "Sube tu propiedad" abre WhatsApp directamente con el número del chatbot:

```tsx
const WHATSAPP_URL = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola, quiero publicar mi propiedad`
```

## 🚀 Deploy en Contabo VPS con Docker

El frontend se despliega junto al backend en el mismo VPS de Contabo usando Docker Compose. Nginx actúa como reverse proxy y sirve tanto el frontend como la API desde un solo servidor.

### Variables de entorno en producción

En el servidor, el `.env` apunta a la API real:

```env
NEXT_PUBLIC_API_URL=https://api.tudominio.com/api
NEXT_PUBLIC_APP_URL=https://tudominio.com
NEXT_PUBLIC_WHATSAPP_NUMBER=591XXXXXXXXX
NEXT_PUBLIC_MAP_CENTER_LAT=-17.3895
NEXT_PUBLIC_MAP_CENTER_LNG=-66.1568
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=13
```

### Pasos de deploy

```bash
# 1. Conectarse al VPS
ssh root@IP_DE_CONTABO

# 2. Clonar el repositorio (si no está clonado)
git clone https://github.com/365Soft-Bolivia/inmobiliaria-web.git
cd inmobiliaria-web

# 3. Configurar variables de entorno
cp .env.example .env
nano .env   # Completar con valores de producción

# 4. El frontend se levanta junto con el backend
# desde el docker-compose.prod.yml del repositorio principal
# Ver README del backend para el comando completo

# 5. Ver logs del contenedor frontend
docker-compose logs -f frontend
```

### Actualizar en producción

```bash
# Traer últimos cambios
git pull origin main

# Rebuildar solo el contenedor frontend
docker-compose -f docker-compose.prod.yml up -d --build frontend

# Ver logs
docker-compose logs -f frontend
```

### Cómo queda Nginx configurado

```
tudominio.com        → frontend (Next.js :3000)
api.tudominio.com    → backend  (Go/Fiber :8080)
n8n.tudominio.com    → n8n      (:5678)
chat.tudominio.com   → chatwoot (:3001)
```

## 📚 Recursos

- [Next.js 14](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Leaflet.js](https://leafletjs.com/)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

## 👨‍💻 Autor

**365Soft**

## 📄 Licencia

MIT
