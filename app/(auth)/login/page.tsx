"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionExpired = searchParams.get('session') === 'expired'
  const redirectPath = searchParams.get('redirect')

  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Error al iniciar sesión")
        return
      }

      // DEBUG: Ver qué está recibiendo del backend
      console.log("Datos del backend:", data)
      console.log("Rol del usuario:", data.user?.rol)
      console.log("Token recibido:", data.token ? "SÍ" : "NO")

      // Guardar token y nombre de usuario
      localStorage.setItem("token", data.token)
      localStorage.setItem("userName", data.user?.nombre || data.nombre || data.usuario?.nombre || "Usuario")

      // Verificar que se guardó correctamente
      const tokenGuardado = localStorage.getItem("token")
      console.log("Token guardado en localStorage:", tokenGuardado ? "SÍ" : "NO")

      // Verificar si es administrador, asesor (agente) o inmobiliaria
      if (data.user?.rol === "admin" || data.user?.rol === "inmobiliaria") {
        localStorage.setItem("isAdmin", "true")
      } else if (data.user?.rol === "agente") {
        localStorage.setItem("isAdvisor", "true")
      }

      // Disparar evento para actualizar el header
      window.dispatchEvent(new Event("auth-change"))

      console.log("redirectPath:", redirectPath)

      // Si es admin, asesor (agente) o inmobiliaria, redirigir al panel de administración
      if (data.user?.rol === "admin" || data.user?.rol === "agente" || data.user?.rol === "inmobiliaria") {
        setSuccess(true)
        setTimeout(() => {
          console.log("Redirigiendo a:", redirectPath || "/admin")
          router.push(redirectPath || "/admin")
        }, 1500)
      } else {
        // Usuario normal, redirigir al home o a la página donde estaba
        setSuccess(true)
        setTimeout(() => {
          console.log("Redirigiendo a:", redirectPath || "/")
          router.push(redirectPath || "/")
        }, 3000)
      }

    } catch (error) {
      alert("Error al conectar con el servidor")
    }
  }

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .toast-login {
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
        .toast-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #d1fae5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .toast-title {
          margin: 0 0 3px;
          font-weight: 600;
          font-size: 15px;
          color: #111827;
        }
        .toast-desc {
          margin: 0;
          font-size: 13px;
          color: #6b7280;
        }
      `}</style>

      {success && (
        <div className="toast-login">
          <div className="toast-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.5 9l4 4L14.5 5" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="toast-title">¡Bienvenido de nuevo!</p>
            <p className="toast-desc">Has iniciado sesión correctamente. Redirigiendo...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-screen">
        <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="max-w-md w-full space-y-8">
          {/* Session Expired Message */}
          {sessionExpired && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Tu sesión ha expirado</p>
                <p className="text-xs text-amber-700 mt-1">Por seguridad, tu sesión cerró automáticamente. Inicia sesión nuevamente para continuar.</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Iniciar Sesión
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10"
                    placeholder="tu@correo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                  Recordarme
                </label>
              </div>

              {/* TODO: Crear página de recuperación de contraseña */}
              {/*
              <div className="text-sm">
                <Link href="/recuperar-password" className="font-medium text-primary hover:text-primary/80">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              */}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
            >
              Iniciar Sesión
            </Button>

            {/* Register link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">¿No tienes una cuenta? </span>
              <Link href="/registro" className="font-medium text-primary hover:text-primary/80">
                Regístrate gratis
              </Link>
            </div>
          </form>

          {/* Social login (opcional) */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">
                  O continúa con
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => window.location.href = "http://localhost:3001/api/auth/google"}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" type="button">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </main>
        <Footer />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
