"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Crown, Home, Star } from "lucide-react"
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
                    className={`relative overflow-hidden transition-all hover:shadow-xl ${
                      esDestacado
                        ? "border-primary border-2 shadow-lg scale-105"
                        : "hover:border-primary"
                    }`}
                  >
                    {esDestacado && (
                      <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                        <Star className="w-4 h-4 inline mr-1" />
                        Recomendado
                      </div>
                    )}

                    <CardHeader className={`bg-gradient-to-r ${plan.color || "from-gray-500 to-gray-600"} text-white text-center pb-4`}>
                      <CardTitle className="text-2xl font-bold mb-2">
                        {plan.nombre}
                      </CardTitle>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-bold">
                          Bs.{plan.precio.toLocaleString()}
                        </span>
                      </div>
                      {plan.descripcion && (
                        <p className="text-sm text-white/90 mt-2">
                          {plan.descripcion}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Características */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Home className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="font-medium">
                            {plan.limite_propiedades === 1
                              ? "1 propiedad"
                              : `${plan.limite_propiedades} propiedades`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="font-medium">
                            {plan.duracion_meses === 1
                              ? "1 mes de vigencia"
                              : `${plan.duracion_meses} meses de vigencia`}
                          </span>
                        </div>

                        {caracteristicas.map((caracteristica, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                            <span>{caracteristica}</span>
                          </div>
                        ))}
                      </div>

                      {/* Método de pago */}
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Método de pago:</span>
                          <Badge variant="outline">{plan.metodo_pago}</Badge>
                        </div>
                      </div>

                      {/* Botón */}
                      <Button
                        type="button"
                        onClick={() => handleSeleccionarPlan(plan.id)}
                        className={`w-full ${
                          esDestacado
                            ? "bg-primary hover:bg-primary/90"
                            : "bg-gray-900 hover:bg-gray-800"
                        }`}
                        size="lg"
                      >
                        Seleccionar Plan
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-16 text-center text-sm text-gray-600">
            <p className="mb-2">
              💰 <strong>Pago seguro con QR</strong> - Escanea con tu app bancaria
            </p>
            <p className="mb-2">
              ⏰ <strong>15 minutos</strong> para completar el pago
            </p>
            <p>
              ✅ <strong>Activación automática</strong> - Tu propiedad se activa al confirmar el pago
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
