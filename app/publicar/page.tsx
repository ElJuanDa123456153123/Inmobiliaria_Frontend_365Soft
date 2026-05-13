"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, X, Home, DollarSign, Clock, Star, Zap, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

// Interface que coincide con el modelo del backend
interface Plan {
  id: number
  nombre: string
  precio: number
  descripcion: string
  duracion_meses: number
  limite_propiedades: number
  caracteristicas: string // Separadas por comas
  destacado: boolean
  activo: boolean
  orden: number
}

// Colores del gradiente basados en el orden/posición del plan
const planColors = [
  "from-gray-500 to-gray-600",
  "from-amber-500 to-amber-600",
  "from-cyan-500 to-cyan-600",
  "from-violet-500 to-violet-600",
  "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
]

function getColorForPlan(index: number): string {
  return planColors[index % planColors.length]
}

function getDuracionLabel(meses: number): string {
  if (meses <= 0) return "Hasta que se venda"
  if (meses === 1) return "30 días"
  return `${meses} meses`
}

function PublicarContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipo = searchParams.get("tipo")
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlanes()
  }, [])

  const fetchPlanes = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
      const response = await fetch(`${apiUrl}/planes`)

      if (!response.ok) {
        throw new Error("Error al obtener los planes")
      }

      const data = await response.json()
      setPlanes(data.planes || [])
    } catch (err: any) {
      console.error("Error fetching planes:", err)
      setError("No se pudieron cargar los planes. Intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = (planId: number) => {
    setSelectedPlan(planId)
    // Redirigir al formulario de registro con el plan seleccionado
    router.push(`/publicar/registro?plan=${planId}`)
  }

  const handleContinueWithoutPlan = () => {
    // Redirigir al formulario de registro sin plan seleccionado
    router.push("/publicar/registro")
  }

  // Parsear características del string separado por comas
  const parseCaracteristicas = (caracteristicas: string): string[] => {
    if (!caracteristicas || caracteristicas.trim() === "") return []
    return caracteristicas.split(",").map((c) => c.trim()).filter((c) => c.length > 0)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Publica tu Propiedad
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Alcanza a miles de interesados y vende o alquila tu propiedad más rápido
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* ¿Por qué publicar con nosotros? */}
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ¿Por qué publicar tu propiedad en 365SOFT?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Somos el portal inmobiliario líder en Bolivia con la mayor cantidad de visitas y usuarios activos
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Mayor Visibilidad</h3>
                <p className="text-gray-600">
                  Más de 100,000 visitas mensuales de personas interesadas en comprar o alquilar propiedades
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Publicación Rápida</h3>
                <p className="text-gray-600">
                  Tu propiedad publicada en menos de 5 minutos. Simple, rápido y sin complicaciones
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Mejor Precio</h3>
                <p className="text-gray-600">
                  Planes accesibles para todos los presupuestos. Elige el que mejor se adapte a tus necesidades
                </p>
              </div>
            </div>
          </section>

          {/* Tips para publicar */}
          <section className="mb-16">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  Tips para una publicación exitosa
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Fotos de calidad</h3>
                      <p className="text-gray-600 text-sm">
                        Sube al menos 5 fotos claras y bien iluminadas. Muestra los ambientes principales, cocina, baños y fachada
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Información completa</h3>
                      <p className="text-gray-600 text-sm">
                        Incluye todos los detalles: metros cuadrados, cantidad de ambientes, amenities, antigüedad y servicios
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Precio competitivo</h3>
                      <p className="text-gray-600 text-sm">
                        Investiga precios similares en tu zona. Un precio realista atrae más interesados y vende más rápido
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Descripción atractiva</h3>
                      <p className="text-gray-600 text-sm">
                        Destaca los puntos fuertes: ubicación, iluminación, vistas cercanas y recientes renovaciones
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Tabla comparativa de planes */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Elige el plan que mejor se adapte a tus necesidades
              </h2>
              <p className="text-lg text-gray-600">
                Todos los planes incluyen soporte y asistencia personalizada
              </p>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-gray-500">Cargando planes disponibles...</p>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
                  <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={fetchPlanes} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                    Reintentar
                  </Button>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && planes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 max-w-md text-center">
                  <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">No hay planes disponibles en este momento</p>
                  <p className="text-gray-400 text-sm">Puedes continuar y seleccionar un plan más tarde</p>
                </div>
              </div>
            )}

            {/* Plans grid */}
            {!loading && !error && planes.length > 0 && (
              <div className={`grid gap-6 mb-8 ${
                planes.length === 1 ? "md:grid-cols-1 max-w-md mx-auto" :
                planes.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" :
                "md:grid-cols-3"
              }`}>
                {planes.map((plan, index) => {
                  const caracteristicas = parseCaracteristicas(plan.caracteristicas)
                  const color = getColorForPlan(index)
                  const duracionLabel = getDuracionLabel(plan.duracion_meses)

                  return (
                    <Card
                      key={plan.id}
                      className={`relative flex flex-col h-full overflow-hidden transition-all hover:shadow-xl ${
                        plan.destacado ? "ring-2 ring-primary shadow-lg scale-105 z-10" : ""
                      }`}
                    >
                      {plan.destacado && (
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-primary/80 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg z-10">
                          Recomendado
                        </div>
                      )}

                      <CardHeader className={`bg-gradient-to-r ${color} text-white`}>
                        <CardTitle className="text-2xl">{plan.nombre}</CardTitle>
                        <div className="mt-4">
                          <div className="text-4xl font-bold">{plan.precio} Bs.</div>
                          <div className="text-white/90 mt-1 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {duracionLabel}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6 flex flex-col flex-1">
                        {plan.descripcion && (
                          <p className="text-sm text-gray-600 mb-4">{plan.descripcion}</p>
                        )}

                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-600">Propiedades:</span>
                          <span className="ml-2 text-sm font-semibold text-gray-900">
                            Hasta {plan.limite_propiedades}
                          </span>
                        </div>

                        {caracteristicas.length > 0 && (
                          <ul className="space-y-3 mb-6">
                            {caracteristicas.map((caracteristica, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700">
                                  {caracteristica}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="mt-auto pt-4">
                          <Button
                            onClick={() => handleSelectPlan(plan.id)}
                            className={`w-full ${
                              plan.destacado
                                ? "bg-primary hover:bg-primary/90 text-white"
                                : "bg-white text-gray-800 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                            }`}
                            variant={plan.destacado ? "default" : "outline"}
                            size="lg"
                          >
                            Continuar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Opción sin plan */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                ¿Aún no decides? Puedes continuar y seleccionar un plan más tarde
              </p>
              <Button
                variant="outline"
                size="lg"
                onClick={handleContinueWithoutPlan}
              >
                Continuar sin seleccionar plan
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function PublicarPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <PublicarContent />
    </Suspense>
  )
}
