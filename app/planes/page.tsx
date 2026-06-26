"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Crown, Home, Star, Clock } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiService, Plan } from "@/lib/services/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function PlanesPage() {
  const router = useRouter()
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const data = await apiService.getActivePlans()
        setPlanes(data.planes || [])
      } catch (error: any) {
        toast.error("Error al cargar los planes")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlanes()

    // Debug: Verificar token al cargar la página
    const token = localStorage.getItem("token")
    console.log("Token al cargar /planes:", token ? "SÍ" : "NO")
    console.log("Token completo:", token)
  }, [])

  const handleSeleccionarPlan = async (planId: number) => {
    console.log("=== handleSeleccionarPlan llamado ===")
    console.log("Plan ID:", planId)

    // Verificar token antes de redirigir
    const token = localStorage.getItem("token")
    console.log("Token en handleSeleccionarPlan:", token ? "SÍ" : "NO")

    // Redirigir directamente a la página de pago
    // Si no está autenticado, el backend retornará 401 y lo redirigirá al login
    console.log("Redirigiendo a /pagar/${planId}")
    router.push(`/pagar/${planId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando planes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">
              <Crown className="w-4 h-4 mr-1" />
              Planes de Publicación
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Elige el plan perfecto para ti
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Publica tu propiedad y llega a miles de interesados. Todos los planes incluyen pago seguro con QR.
            </p>
          </div>

          {/* Planes */}
          {planes.length === 0 ? (
            <div className="text-center py-16">
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay planes disponibles</h3>
              <p className="text-muted-foreground">
                Por el momento no hay planes activos. Intenta más tarde.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {planes.map((plan) => {
                const esDestacado = plan.destacado
                const caracteristicas = plan.caracteristicas
                  ? plan.caracteristicas.split(",").map(c => c.trim())
                  : []

                return (
                  <Card
                    key={plan.id}
                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white flex flex-col ${esDestacado
                      ? "border-primary border-2 shadow-xl scale-105 z-10"
                      : "border-gray-200 hover:border-primary/50 shadow-md"
                      }`}
                  >
                    {/* Acento superior sutil con el color del plan */}
                    <div className={`h-2 w-full bg-gradient-to-r ${plan.color || "from-gray-400 to-gray-500"}`} />

                    {esDestacado && (
                      <div className="absolute top-4 right-4 bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full flex items-center shadow-sm">
                        <Star className="w-3 h-3 inline mr-1" fill="currentColor" />
                        Recomendado
                      </div>
                    )}

                    <CardHeader className="text-center pt-8 pb-2">
                      <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                        {plan.nombre}
                      </CardTitle>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-extrabold text-gray-900 tracking-tight">
                          Bs.{plan.precio.toLocaleString()}
                        </span>
                      </div>
                      {plan.descripcion && (
                        <p className="text-sm text-gray-500 mt-4 max-w-[90%] mx-auto leading-relaxed">
                          {plan.descripcion}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-6 flex-1 flex flex-col pt-6">
                      {/* Características */}
                      <div className="space-y-4 flex-1 px-2">
                        <div className="flex items-start gap-3 text-sm">
                          <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full text-primary">
                            <Home className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-gray-800 pt-1">
                            {plan.limite_propiedades === 1
                              ? "1 propiedad en catálogo"
                              : `${plan.limite_propiedades} propiedades en catálogo`}
                          </span>
                        </div>

                        <div className="flex items-start gap-3 text-sm">
                          <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full text-primary">
                            <Clock className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-gray-800 pt-1">
                            {plan.duracion_meses === 1
                              ? "1 mes de vigencia"
                              : `${plan.duracion_meses} meses de vigencia`}
                          </span>
                        </div>

                        <div className="my-5 h-px bg-gray-100 w-full" />

                        <div className="space-y-3">
                          {caracteristicas.map((caracteristica, index) => (
                            <div key={index} className="flex items-start gap-3 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600 leading-snug">{caracteristica}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Método de pago y Botón */}
                      <div className="pt-6">
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-4">
                          <span>Paga fácil y rápido con</span>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-bold border border-gray-200 uppercase text-[9px]">
                            {plan.metodo_pago}
                          </Badge>
                        </div>

                        <Button
                          type="button"
                          onClick={() => handleSeleccionarPlan(plan.id)}
                          className={`w-full py-6 font-bold text-sm uppercase tracking-wide rounded-xl transition-all shadow-md ${esDestacado
                            ? `bg-gradient-to-r ${plan.color || "from-primary to-teal-500"} hover:opacity-90 text-white hover:shadow-lg`
                            : "bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                          Seleccionar Plan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Footer */}
        </div>
      </main>

      <Footer />
    </div>
  )
}
