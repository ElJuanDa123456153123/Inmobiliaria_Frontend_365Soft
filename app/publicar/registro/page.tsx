"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { apiService } from "@/lib/services/api"
import { toast } from "sonner"

export default function RegistroVendedorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    nombreApellido: "",
    cedula: "",
    nombreContacto: "",
    telefono: "",
    horarioContacto: ""
  })

  // Obtener datos del usuario desde la API
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/ingresar")
        return
      }

      try {
        const userData = await apiService.getProfile()

        // Separar nombre y apellido
        let nombre = userData.user?.nombre || ""
        let apellido = userData.user?.apellido || ""
        let nombreCompleto = ""

        if (apellido && apellido.trim()) {
          // Ya tiene nombre y apellido separados (editó perfil)
          nombreCompleto = `${nombre} ${apellido}`.trim()
        } else {
          // Todo está en "nombre" (registro/Google, no editó perfil)
          nombreCompleto = nombre
        }

        setFormData({
          email: userData.user?.email || "",
          nombreApellido: nombreCompleto,
          cedula: userData.user?.ci || "", // Solo si ya lo tiene (editó perfil)
          nombreContacto: nombreCompleto,
          telefono: userData.user?.telefono || "",
          horarioContacto: ""
        })
      } catch (error) {
        console.error('Error cargando datos del usuario:', error)
        // Si falla, intentar con localStorage como fallback
        const userEmail = localStorage.getItem("userEmail")
        const userName = localStorage.getItem("userName")
        if (userEmail) {
          setFormData(prev => ({
            ...prev,
            email: userEmail,
            nombreApellido: userName || "",
            nombreContacto: userName || ""
          }))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!formData.nombreContacto.trim()) {
      toast.error('El nombre de contacto es requerido')
      return
    }

    if (!formData.telefono.trim()) {
      toast.error('El teléfono es requerido')
      return
    }

    setSaving(true)

    try {
      // Guardar datos públicos en el backend
      await apiService.updateDatosPublicos({
        nombre_contacto: formData.nombreContacto.trim(),
        telefono_contacto: formData.telefono.trim(),
        horario_contacto: formData.horarioContacto.trim()
      })

      // Obtener el plan seleccionado de los query params
      const searchParams = new URLSearchParams(window.location.search)
      const plan = searchParams.get('plan')

      if (plan) {
        localStorage.setItem('planSeleccionado', plan)
      }

      // Guardar datos adicionales en localStorage y redirigir al formulario
      localStorage.setItem("vendedorData", JSON.stringify({
        cedula: formData.cedula
      }))

      toast.success('Datos guardados correctamente')

      // Pequeña pausa para que el usuario vea el toast
      setTimeout(() => {
        router.push("/publicar/formulario")
      }, 500)
    } catch (error: any) {
      console.error('Error guardando datos públicos:', error)
      toast.error(error.message || 'Error al guardar los datos')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1 bg-gradient-to-b from-gray-50 to-white py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-600 py-20">Cargando tus datos...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Columna izquierda: Perfil del usuario */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Perfil del usuario
                  </h2>

                  <div className="space-y-5">
                    {/* Email - READ ONLY */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        readOnly
                        disabled
                        className="bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">No se puede modificar el email</p>
                    </div>

                    {/* Nombre y apellido */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre y apellido <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.nombreApellido}
                        onChange={(e) => setFormData({ ...formData, nombreApellido: e.target.value })}
                        placeholder=""
                        className="bg-gray-50 border-gray-300"
                      />
                    </div>

                    {/* Cédula */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cédula
                      </label>
                      <Input
                        type="text"
                        value={formData.cedula}
                        onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                        placeholder={formData.cedula ? "" : "Opcional - compléla si la tienes"}
                        className="bg-gray-50 border-gray-300"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.cedula
                          ? "Cédula cargada desde tu perfil"
                          : "Solo necesaria si ya la registraste en tu perfil"}
                      </p>
                    </div>

                    {/* Nota informativa */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-semibold">Esta información es para el uso exclusivo de 365SOFT</span> para la facturación y comunicados específicos
                      </p>
                    </div>
                  </div>
                </div>

                {/* Columna derecha: Datos públicos */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Datos públicos
                  </h2>

                  <div className="space-y-5">
                    {/* Nombre de contacto */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre de contacto <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.nombreContacto}
                        onChange={(e) => setFormData({ ...formData, nombreContacto: e.target.value })}
                        placeholder=""
                        className="bg-gray-50 border-gray-300"
                      />
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        required
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        placeholder=""
                        className="bg-gray-50 border-gray-300"
                      />
                    </div>

                    {/* Horario de contacto */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Horario de contacto
                      </label>
                      <Input
                        type="text"
                        value={formData.horarioContacto}
                        onChange={(e) => setFormData({ ...formData, horarioContacto: e.target.value })}
                        placeholder=""
                        className="bg-gray-50 border-gray-300"
                      />
                    </div>

                    {/* Botón Continuar */}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full md:w-auto px-12 bg-primary hover:bg-primary/90 text-white font-semibold"
                      >
                        Continuar →
                      </Button>
                    </div>

                    {/* Términos y condiciones */}
                    <div className="text-xs text-gray-500 leading-relaxed">
                      Haciendo click en continuar usted está aceptando los{' '}
                      <a href="/terminos" className="text-primary hover:underline font-semibold">
                        Términos y condiciones
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
