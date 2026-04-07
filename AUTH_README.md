# 📚 Documentación - Sistema de Autenticación (Frontend)

## Índice
- [Overview](#overview)
- [Características](#características)
- [Instalación](#instalación)
- [Componentes](#componentes)
- [Uso](#uso)
- [Google OAuth](#google-oauth)
- [Ejemplos](#ejemplos)

---

## Overview

Sistema de autenticación frontend construido con **Next.js 15** que incluye:

- ✅ Registro de usuarios con formulario completo
- ✅ Login con email/contraseña
- ✅ Login con Google OAuth 2.0
- ✅ Header con usuario logueado
- ✅ Dropdown con opciones (Perfil, Favoritos, Cerrar Sesión)
- ✅ Toasts de confirmación
- ✅ Redirecciones automáticas
- ✅ Persistencia de sesión con localStorage

---

## Características

### UX/UI
- 🎨 Diseño moderno con shadcn/ui
- 📱 Totalmente responsive
- 🎭 Animaciones suaves
- 🔔 Toasts de confirmación
- 🎯 Validación de formularios
- ♿ Accesible (ARIA labels)

### Funcionalidad
- 👤 3 tipos de cuentas: Usuario, Agente, Inmobiliaria
- 🔐 Contraseñas con show/hide
- 📋 Campos dinámicos según rol
- 🔄 Estado global de autenticación
- 💾 Persistencia en localStorage
- 🌐 Soporte multi-idioma (futuro)

---

## Instalación

### Prerrequisitos
- Node.js 20+
- npm o yarn

### Dependencias
```bash
npm install next@latest react@latest react-dom@latest
npm install lucide-react class-variance-authority clsx tailwind-merge
```

### Variables de Entorno

Crea un archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Ejecutar con Docker
```bash
docker compose up --build frontend
```

### Ejecutar Localmente
```bash
npm run dev
```

Visita: http://localhost:3000

---

## Componentes

### 1. Header Inteligente

**Ubicación**: `components/layout/header.tsx`

El header detecta automáticamente si hay un usuario logueado:

**Sin Loguear**:
```tsx
<Button variant="ghost" asChild>
  <Link href="/login">Ingresar</Link>
</Button>
```

**Logueado**:
```tsx
<button onClick={() => setUserMenuOpen(!userMenuOpen)}>
  <Avatar />
  <span>{userName}</span>
  <ChevronDown />
</button>

<Dropdown>
  <Link href="/perfil">Perfil</Link>
  <Link href="/favoritos">Favoritos</Link>
  <Button onClick={handleLogout}>Cerrar Sesión</Button>
</Dropdown>
```

**Props**:
No requiere props, funciona con localStorage

**Uso**:
```tsx
import { Header } from "@/components/layout/header"

export default function Layout() {
  return (
    <>
      <Header />
      {/* Resto de la app */}
    </>
  )
}
```

---

### 2. Página de Login

**Ubicación**: `app/(auth)/login/page.tsx`

**Características**:
- Email y contraseña
- Show/hide contraseña
- Recordarme
- ¿Olvidaste tu contraseña?
- Login con Google
- Link a registro

**Estado**:
```tsx
const [formData, setFormData] = useState({
  email: "",
  password: "",
})
const [success, setSuccess] = useState(false)
```

**Al hacer submit**:
1. Valida campos
2. Hace POST a `/api/auth/login`
3. Guarda token y nombre en localStorage
4. Muestra toast de éxito
5. Redirige a `/` después de 2 segundos

---

### 3. Página de Registro

**Ubicación**: `app/(auth)/registro/page.tsx`

**Características**:
- Selección de tipo de cuenta (Usuario, Agente, Inmobiliaria)
- Campos dinámicos según rol
- Validación de contraseña
- Términos y condiciones
- Toast de confirmación

**Campos según Rol**:

| Rol | Campos Adicionales |
|-----|-------------------|
| Usuario | Ninguno |
| Agente | Ninguno |
| Inmobiliaria | Nombre Inmobiliaria, NIT |

**Al hacer submit**:
1. Valida campos obligatorios
2. Valida que contraseñas coincidan
3. Hace POST a `/api/auth/register`
4. Guarda token y nombre en localStorage
5. Muestra toast de éxito
6. Redirige a `/` después de 2 segundos

---

### 4. Google OAuth - Callbacks

**Página de Éxito**: `app/auth/success/page.tsx`

Se muestra cuando el usuario completa el login con Google:

```tsx
// Query params recibidos:
?token=JWT_TOKEN&nombre=NOMBRE_USUARIO
```

**Flujo**:
1. Extrae token y nombre de URL
2. Guarda en localStorage
3. Muestra animación de éxito
4. Redirige a `/` después de 2 segundos

**Página de Completar Perfil**: `app/auth/complete-profile/page.tsx`

Se muestra cuando falta el teléfono:

```tsx
// Query params recibidos:
?token=JWT_TOKEN&nombre=NOMBRE&email=EMAIL
```

**Flujo**:
1. Muestra formulario con teléfono y rol
2. Al enviar, hace POST a `/api/auth/google/complete-profile`
3. Muestra toast de éxito
4. Redirige a `/` después de 2 segundos

---

## Uso

### Verificar si Usuario está Logueado

```tsx
"use client"

import { useEffect, useState } from "react"

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const name = localStorage.getItem("userName")

    setIsAuthenticated(!!token)
    setUserName(name)
  }, [])

  return { isAuthenticated, userName }
}

// Uso en componente
function MyComponent() {
  const { isAuthenticated, userName } = useAuth()

  if (!isAuthenticated) {
    return <p>Por favor inicia sesión</p>
  }

  return <p>Hola, {userName}!</p>
}
```

### Hacer Logout

```tsx
const handleLogout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("userName")
  router.push("/login")
}
```

### Llamadas Autenticadas a la API

```tsx
const response = await fetch("http://localhost:3001/api/auth/me", {
  headers: {
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
})
```

---

## Google OAuth

### Configuración

**Botón de Google en Login**:
```tsx
<Button
  variant="outline"
  type="button"
  onClick={() => window.location.href = "http://localhost:3001/api/auth/google"}
>
  <GoogleIcon />
  Continuar con Google
</Button>
```

### Flujo Completo

```
1. Usuario hace click en "Continuar con Google"
   ↓
2. Redirección a http://localhost:3001/api/auth/google
   ↓
3. Backend redirige a Google
   ↓
4. Usuario autentica con Google
   ↓
5. Google redirige a http://localhost:3001/api/auth/google/callback
   ↓
6. Backend procesa info de Google
   ↓
7. Backend genera JWT y redirige al frontend:

   Si tiene teléfono → /auth/success?token=JWT&nombre=NOMBRE
   Si NO tiene teléfono → /auth/complete-profile?token=JWT&nombre=NOMBRE&email=EMAIL
   ↓
8. Frontend guarda token en localStorage
   ↓
9. Frontend redirige a / (home)
```

### Suspense Boundary

Las páginas con `useSearchParams()` requieren Suspense:

```tsx
export default function AuthSuccessPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthSuccessContent />
    </Suspense>
  )
}
```

---

## Ejemplos

### Ejemplo 1: Proteger una Ruta

```tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function ProtectedPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return <p>Redirigiendo...</p>
  }

  return (
    <div>
      <h1>Página Protegida</h1>
      <p>Solo usuarios logueados pueden ver esto</p>
    </div>
  )
}
```

### Ejemplo 2: Obtener Info del Usuario

```tsx
"use client"

import { useEffect, useState } from "react"

interface User {
  id: number
  nombre: string
  email: string
  rol: string
}

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch("http://localhost:3001/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) return <p>Cargando...</p>
  if (!user) return <p>No autenticado</p>

  return (
    <div>
      <h1>{user.nombre}</h1>
      <p>{user.email}</p>
      <p>Rol: {user.rol}</p>
    </div>
  )
}
```

### Ejemplo 3: Header con Usuario Logueado

```tsx
"use client"

import { useAuth } from "@/hooks/useAuth"

export function AuthButton() {
  const { isAuthenticated, userName } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userName")
    router.push("/login")
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <span>Bienvenido, {userName}</span>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
    )
  }

  return (
    <Link href="/login">
      <button>Ingresar</button>
    </Link>
  )
}
```

---

## Estilos

### Toasts Personalizados

Los toasts usan CSS-in-JS con animaciones:

```tsx
<style>{`
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .toast-registro {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: #ffffff;
    border: 1px solid #d1fae5;
    border-left: 4px solid #10b981;
    border-radius: 12px;
    padding: 16px 18px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    min-width: 300px;
    animation: slideIn 0.35s ease;
  }
`}</style>
```

### Tailwind CSS

Configurado para colores y temas:

```tsx
className="bg-card text-foreground border-border"
```

---

## Errores Comunes

### 1. useSearchParams() Suspense Error

**Error**: `useSearchParams() should be wrapped in a suspense boundary`

**Solución**:
```tsx
import { Suspense } from "react"

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent />
    </Suspense>
  )
}

function PageContent() {
  const searchParams = useSearchParams()
  // ...
}
```

### 2. localStorage no Definido

**Error**: `localStorage is not defined`

**Solución**: Usar `useEffect` para acceder a localStorage:
```tsx
useEffect(() => {
  const token = localStorage.getItem("token")
  // ...
}, [])
```

### 3. Hydration Mismatch

**Error**: Text content does not match server-rendered HTML

**Solución**: Usar estado `mounted`:
```tsx
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) return null
```

---

## Testing

### Manual Testing Checklist

**Registro**:
- [ ] Campos requeridos validados
- [ ] Contraseñas coinciden
- [ ] Toast de éxito aparece
- [ ] Redirección a home funciona
- [ ] Usuario aparece en header

**Login**:
- [ ] Email y password validados
- [ ] Credenciales incorrectas muestran error
- [ ] Login exitoso muestra toast
- [ ] Redirección a home funciona
- [ ] Token se guarda en localStorage

**Google OAuth**:
- [ ] Botón de Google funciona
- [ ] Redirección a Google funciona
- [ ] Callback funciona
- [ ] Perfil completo → auth/success
- [ ] Perfil incompleto → complete-profile
- [ ] Token se guarda correctamente

**Header**:
- [ ] Sin loguear → Botón "Ingresar"
- [ ] Logueado → Nombre de usuario
- [ ] Dropdown funciona
- [ ] Cerrar sesión funciona
- [ ] Redirección a login funciona

---

## Deploy

### Variables de Entorno de Producción

```env
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com/api
```

### Configuración de Google OAuth en Producción

1. Agregar dominios en Google Cloud Console:
   - Authorized JavaScript origins:
     ```
     https://tu-dominio.com
     ```
   - Authorized redirect URIs:
     ```
     https://api.tu-dominio.com/api/auth/google/callback
     ```

2. Actualizar docker-compose.yml:
   ```yaml
   environment:
     - FRONTEND_URL=https://tu-dominio.com
     - GOOGLE_CALLBACK_URL=https://api.tu-dominio.com/api/auth/google/callback
   ```

---

## Troubleshooting

### El header no muestra el usuario

**Problema**: El header no actualiza después del login

**Solución**: El header usa `useEffect` para detectar cambios en localStorage. Asegúrate de que:
1. Token se guarde en localStorage
2. Nombre se guarde en localStorage
3. El componente Header esté montado

### Google OAuth no redirige correctamente

**Problema**: Después de Google, no redirige al frontend

**Solución**: Verifica:
1. FRONTEND_URL en docker-compose.yml
2. Authorized redirect URIs en Google Console
3. Puerto correcto (3000 para frontend, 3001 para backend)

### Toasts no aparecen

**Problema**: Los toasts no se muestran

**Solución**:
1. Verifica z-index (debe ser alto)
2. Asegúrate de que `success` state esté true
3. Verifica que no haya CSS que lo oculte

---

## Roadmap

### Próximas Features

- [ ] Recuperación de contraseña
- [ ] Verificación de email
- [ ] 2FA (Autenticación de dos factores)
- [ ] Refresh tokens
- [ ] Recordar dispositivo
- [ ] Login con Facebook
- [ ] Multi-idioma
- [ ] Tema oscuro
- [ ] Biometría (WebAuthn)

---

**Última actualización**: 7 de abril de 2026
**Versión**: 1.0.0
