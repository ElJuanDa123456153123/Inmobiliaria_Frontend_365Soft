"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, X, Home, DollarSign, Clock, Star, Zap, AlertCircle, Loader2, TrendingUp, Building2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Badge } from "@/components/ui/badge"
import { apiService, Plan, Subscription } from "@/lib/services/api"

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
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener planes
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
      const planesResponse = await fetch(`${apiUrl}/planes`)

      if (!planesResponse.ok) {
        throw new Error("Error al obtener los planes")
      }

      const planesData = await planesResponse.json()
      setPlanes(planesData.planes || [])

      // Obtener suscripción del usuario (si está autenticado)
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const sub = await apiService.getMySubscription()
          console.log("✅ Suscripción obtenida:", sub)
          console.log("✅ Propiedades disponibles:", (sub?.plan?.limite_propiedades || 0) - (sub?.propiedades_usadas || 0))
          setSubscription(sub)
        } catch (err) {
          // No tiene suscripción o error, continuar sin suscripción
          console.log("❌ No se pudo obtener suscripción:", err)
        }
      } else {
        console.log("❌ No hay token de autenticación")
      }
    } catch (err: any) {
      console.error("Error fetching data:", err)
      setError("No se pudieron cargar los datos. Intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = (planId: number) => {
    setSelectedPlan(planId)
    // Redirigir a la página de pago QR
    router.push(`/pagar/${planId}`)
  }

  const handlePublishProperty = () => {
    // Redirigir al formulario de registro
    router.push("/publicar/registro")
  }

  const handleContinueWithoutPlan = () => {
    // Redirigir al formulario de registro sin plan seleccionado
    router.push("/publicar/registro")
  }

  // Calcular propiedades disponibles
  const propiedadesDisponibles = subscription?.plan
    ? subscription.plan.limite_propiedades - subscription.propiedades_usadas
    : 0

  const tieneSuscripcionActiva = subscription && propiedadesDisponibles > 0

  console.log("📊 Estado de suscripción:", {
    tieneSuscripcionActiva,
    subscription,
    propiedadesDisponibles,
    plan: subscription?.plan,
    propiedadesUsadas: subscription?.propiedades_usadas
  })

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
          {/* Suscripción activa */}
          {tieneSuscripcionActiva && (
            <section className="mb-12">
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* Información de suscripción */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                          <Check className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            ¡Tienes un plan activo!
                          </h2>
                          <p className="text-gray-600">
                            Plan {subscription?.plan?.nombre} • Hasta el {new Date(subscription?.fecha_fin || "").toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {/* Métricas */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-5 h-5 text-primary" />
                            <span className="text-sm text-gray-600">Disponibles</span>
                          </div>
                          <p className="text-3xl font-bold text-primary">{propiedadesDisponibles}</p>
                          <p className="text-xs text-gray-500">propiedades</p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-gray-600">Usadas</span>
                          </div>
                          <p className="text-3xl font-bold text-green-600">{subscription?.propiedades_usadas || 0}</p>
                          <p className="text-xs text-gray-500">propiedades</p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Home className="w-5 h-5 text-gray-600" />
                            <span className="text-sm text-gray-600">Total</span>
                          </div>
                          <p className="text-3xl font-bold text-gray-900">{subscription?.plan?.limite_propiedades || 0}</p>
                          <p className="text-xs text-gray-500">en el plan</p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-5 h-5 text-amber-600" />
                            <span className="text-sm text-gray-600">Vigencia</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{subscription?.plan?.duracion_meses || 0}</p>
                          <p className="text-xs text-gray-500">meses</p>
                        </div>
                      </div>
                    </div>

                    {/* Botón de acción */}
                    <div className="md:w-64">
                      <Button
                        onClick={handlePublishProperty}
                        size="lg"
                        className="w-full h-20 text-lg font-semibold bg-primary hover:bg-primary/90"
                      >
                        <Home className="w-6 h-6 mr-2" />
                        Publicar Propiedad
                      </Button>
                      <p className="text-xs text-gray-600 text-center mt-2">
                        {propiedadesDisponibles === 1
                          ? "Te queda 1 propiedad disponible"
                          : `Te quedan ${propiedadesDisponibles} propiedades disponibles`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

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
          {!tieneSuscripcionActiva && (
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
                    <Button onClick={fetchData} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
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
                            onClick={() => handleSelectPlan(plan.id)}
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

              {/* Opción sin plan */}
              {!loading && !error && (
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
              )}
            </section>
          )}
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
