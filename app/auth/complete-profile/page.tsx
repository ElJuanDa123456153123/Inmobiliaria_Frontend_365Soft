"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Phone, User, Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

function CompleteProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    telefono: "",
    rol: "usuario",
  })

  useEffect(() => {
    setMounted(true)

    // Verificar que hay token
    const token = searchParams.get("token")
    if (!token) {
      router.push("/login")
      return
    }

    // Guardar token temporalmente
    localStorage.setItem("token", token)
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const token = searchParams.get("token")
    if (!token) {
      alert("Error: No hay token de autenticación")
      router.push("/login")
      return
    }

    try {
      const response = await fetch("http://localhost:3001/api/auth/google/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Error completando perfil")
        return
      }

      // Actualizar nombre en localStorage
      const nombre = searchParams.get("nombre")
      if (nombre) {
        localStorage.setItem("userName", nombre)
      }

      setSuccess(true)

      // Redirigir al home después de 2 segundos
      setTimeout(() => {
        router.push("/")
      }, 2000)

    } catch (error) {
      alert("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      {success && (
        <div className="fixed top-24 right-24 z-[9999] flex items-start gap-3 bg-white border border-green-200 border-l-4 border-l-green-500 rounded-xl p-4 shadow-lg min-w-[300px] animate-in slide-in-from-top-2 duration-300">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.5 9l4 4L14.5 5" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm">¡Perfil completado!</p>
            <p className="text-xs text-muted-foreground">Redirigiendo...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 flex items-center justify-center py-12 px-4 bg-gradient-to-br from-primary/5 via-background to-primary/5">
          <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                Completa tu Perfil
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Solo necesitamos un poco más de información
              </p>
            </div>

            {/* Info del usuario */}
            <div className="bg-card rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground text-center">
                Autenticado con Google: <span className="font-medium text-foreground">{searchParams.get("email")}</span>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-card rounded-lg p-6 shadow-sm border border-border">
              <div className="space-y-4">
                {/* Rol */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    ¿Tipo de cuenta?
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, rol: "usuario" })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.rol === "usuario"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-primary" />
                        <div>
                          <span className="font-medium block">Usuario</span>
                          <span className="text-xs text-muted-foreground">Buscar propiedades</span>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, rol: "agente" })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.rol === "agente"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-primary" />
                        <div>
                          <span className="font-medium block">Agente</span>
                          <span className="text-xs text-muted-foreground">Publicar propiedades</span>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, rol: "inmobiliaria" })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.rol === "inmobiliaria"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-primary" />
                        <div>
                          <span className="font-medium block">Inmobiliaria</span>
                          <span className="text-xs text-muted-foreground">Gestión completa</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Teléfono */}
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
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Completar Perfil"
                )}
              </Button>
            </form>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <CompleteProfileContent />
    </Suspense>
  )
}
