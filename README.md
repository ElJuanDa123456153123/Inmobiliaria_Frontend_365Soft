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
- Backend corriendo en `http://localhost:8080`

## 🆕 Guía de Instalación desde Cero (Sin Plantillas)

Si quieres crear el proyecto desde cero sin usar plantillas, sigue estos pasos basados en la documentación oficial de cada tecnología.

### 1. Instalar Node.js y npm

**Documentación oficial:** https://nodejs.org/

**Windows:**
```bash
# Descargar instalador desde https://nodejs.org/ (versión LTS 20+)
# O usar Chocolatey
choco install nodejs-lts
```

**Linux (Ubuntu/Debian):**
```bash
# Usar NodeSource para obtener Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar versiones
node --version  # debe ser v20+
npm --version   # debe ser 10+
```

**macOS:**
```bash
# Usar Homebrew
brew install node
```

### 2. Crear proyecto Next.js (App Router)

**Documentación oficial:** https://nextjs.org/docs/getting-started/installation

```bash
# Crear carpeta del proyecto
mkdir inmobiliaria-frontend
cd inmobiliaria-frontend

# Inicializar package.json
npm init -y

# Instalar Next.js, React y TypeScript
npm install next@latest react@latest react-dom@latest
npm install -D typescript @types/react @types/node @types/react-dom

# Configurar TypeScript
# Crear tsconfig.json según documentación: https://nextjs.org/docs/app/building-your-application/configuring/typescript
```

**Estructura mínima de carpetas Next.js:**
```bash
mkdir -p app components lib types public
```

**Archivo `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Configurar scripts en `package.json`:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### 3. Configurar Tailwind CSS

**Documentación oficial:** https://tailwindcss.com/docs/guides/nextjs

```bash
# Instalar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer

# Inicializar Tailwind
npx tailwindcss init -p
```

**Configurar `tailwind.config.ts`:**
```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
```

**Crear `app/globals.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Crear `app/layout.tsx`:**
```tsx
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Inmobiliaria Bolivia",
  description: "Plataforma inmobiliaria boliviana",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
```

**Crear `app/page.tsx`:**
```tsx
export default function Home() {
  return (
    <main className="min-h-screen">
      <h1 className="text-4xl font-bold">Inmobiliaria Bolivia</h1>
    </main>
  )
}
```

### 4. Configurar shadcn/ui

**Documentación oficial:** https://ui.shadcn.com/docs/installation

```bash
# Instalar dependencias requeridas
npm install class-variance-authority clsx tailwind-merge

# Crear utilidad lib/utils.ts
mkdir -p lib
```

**Archivo `lib/utils.ts`:**
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Inicializar shadcn/ui:**
```bash
npx shadcn-ui@latest init
```

**Durante la inicialización, responde:**
- `Would you like to use TypeScript?` → **yes**
- `Which style would you like to use?` → **Default**
- `Which color would you like to use as base color?` → **Slate**
- `Where is your global CSS file?` → **app/globals.css**
- `Would you like to use CSS variables for colors?` → **yes**
- `Where is your tailwind.config.js located?` → **tailwind.config.ts**
- `Configure the import alias for components:` → **@/components**
- `Configure the import alias for utils:` → **@/lib/utils**
- `Are you using React Server Components?` → **yes**

**Agregar componentes necesarios:**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add toast
```

### 5. Instalar dependencias adicionales

**Zustand (Estado global):**
```bash
# Docs: https://docs.pmnd.rs/zustand/getting-started/installation
npm install zustand
```

**TanStack Query (Fetching):**
```bash
# Docs: https://tanstack.com/query/latest/docs/framework/react/quick-start
npm install @tanstack/react-query
```

**React Hook Form + Zod (Formularios):**
```bash
# Docs: https://react-hook-form.com/get-started
# Docs: https://zod.dev/
npm install react-hook-form @hookform/resolvers zod
```

**Leaflet (Mapa):**
```bash
# Docs: https://leafletjs.com/
# Docs: https://react-leaflet.js.org/
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

**Lucide React (Iconos):**
```bash
# Docs: https://lucide.dev/
npm install lucide-react
```

### 6. Probar la instalación

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir http://localhost:3000
# Deberías ver "Inmobiliaria Bolivia" con estilos de Tailwind
```

## 🔧 Instalación (Desde Repositorio)

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/inmobiliaria-frontend.git
cd inmobiliaria-frontend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Editar .env.local con tus valores
```

## ⚙️ Variables de Entorno

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:8080/api

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
git clone https://github.com/tu-usuario/inmobiliaria-web.git
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
