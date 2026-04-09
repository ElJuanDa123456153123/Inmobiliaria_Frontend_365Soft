"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, User, Phone, Eye, EyeOff, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState<"usuario" | "agente" | "inmobiliaria">("usuario")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }

    try {
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          telefono: formData.telefono,
          rol: userType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Error al registrar")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("userName", data.user?.nombre || formData.nombre)

      // Disparar evento para actualizar el header
      window.dispatchEvent(new Event("auth-change"))

      // Mostrar toast, luego redirigir a la ruta principal
      setSuccess(true)
      setTimeout(() => {
        router.push("/")
      }, 1000)

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
        <div className="toast-registro">
          <div className="toast-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.5 9l4 4L14.5 5" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="toast-title">¡Registro exitoso!</p>
            <p className="toast-desc">Tu cuenta fue creada. Redirigiendo al login...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-background to-primary/5">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground">
                Crear Cuenta
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Únete a 365SOFT y encuentra tu propiedad ideal
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 mb-6 shadow-sm border border-border">
              <h3 className="text-lg font-semibold mb-4">¿Tipo de cuenta?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType("usuario")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === "usuario"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <User className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <span className="font-medium">Usuario</span>
                  <p className="text-xs text-muted-foreground mt-1">Buscar propiedades</p>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType("agente")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === "agente"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <span className="font-medium">Agente</span>
                  <p className="text-xs text-muted-foreground mt-1">Publicar propiedades</p>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType("inmobiliaria")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === "inmobiliaria"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <span className="font-medium">Inmobiliaria</span>
                  <p className="text-xs text-muted-foreground mt-1">Gestión completa</p>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card rounded-lg p-6 shadow-sm border border-border space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-foreground mb-2">
                    Nombre Completo {userType === "inmobiliaria" ? "o Razón Social" : ""}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="nombre"
                      name="nombre"
                      type="text"
                      required
                      className="pl-10"
                      placeholder="Juan Pérez"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>
                </div>

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

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-foreground mb-2">
                    Teléfono
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      required
                      className="pl-10"
                      placeholder="+591 XXX XXXXX"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                </div>

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
                      autoComplete="new-password"
                      required
                      className="pl-10 pr-10"
                      placeholder="Mínimo 8 caracteres"
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

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className="pl-10"
                      placeholder="Repite tu contraseña"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-muted-foreground">
                    Acepto los{" "}
                    <Link href="/terminos" className="text-primary hover:text-primary/80">
                      términos y condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link href="/privacidad" className="text-primary hover:text-primary/80">
                      política de privacidad
                    </Link>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Crear Cuenta
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">¿Ya tienes una cuenta? </span>
                <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                  Inicia sesión
                </Link>
              </div>
            </form>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
