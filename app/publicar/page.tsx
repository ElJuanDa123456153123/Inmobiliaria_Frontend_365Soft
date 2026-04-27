"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, X, Home, DollarSign, Clock, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

interface Plan {
  id: string
  nombre: string
  precio: string
  duracion: string
  exposicion: string
  caracteristicas: {
    texto: string
    incluido: boolean
  }[]
  color: string
}

const planes: Plan[] = [
  {
    id: "basico",
    nombre: "Plan Básico",
    precio: "U$S 40",
    duracion: "30 días",
    exposicion: "Buena exposición",
    color: "from-gray-500 to-gray-600",
    caracteristicas: [
      { texto: "30 días de publicación", incluido: true },
      { texto: "Hasta 10 fotos", incluido: true },
      { texto: "Buena visibilidad", incluido: true },
      { texto: "Destacado en búsquedas", incluido: false },
      { texto: "Prioridad en resultados", incluido: false },
      { texto: "Publicación en redes sociales", incluido: false },
    ]
  },
  {
    id: "oro",
    nombre: "Plan Oro",
    precio: "U$S 60",
    duracion: "60 días",
    exposicion: "Muy buena exposición",
    color: "from-amber-500 to-amber-600",
    caracteristicas: [
      { texto: "60 días de publicación", incluido: true },
      { texto: "Hasta 20 fotos", incluido: true },
      { texto: "Muy buena visibilidad", incluido: true },
      { texto: "Destacado en búsquedas", incluido: true },
      { texto: "Prioridad en resultados", incluido: false },
      { texto: "Publicación en redes sociales", incluido: false },
    ]
  },
  {
    id: "diamante",
    nombre: "Plan Diamante",
    precio: "U$S 100",
    duracion: "Hasta que se venda",
    exposicion: "Máxima exposición",
    color: "from-cyan-500 to-cyan-600",
    caracteristicas: [
      { texto: "Hasta que se venda", incluido: true },
      { texto: "Fotos ilimitadas", incluido: true },
      { texto: "Máxima visibilidad", incluido: true },
      { texto: "Destacado en búsquedas", incluido: true },
      { texto: "Prioridad en resultados", incluido: true },
      { texto: "Publicación en redes sociales", incluido: true },
    ]
  }
]

function PublicarContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipo = searchParams.get("tipo")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    // Redirigir al formulario de registro con el plan seleccionado
    router.push(`/publicar/registro?plan=${planId}`)
  }

  const handleContinueWithoutPlan = () => {
    // Redirigir al formulario de registro sin plan seleccionado
    router.push("/publicar/registro")
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
                <h3 className="text-xl font-semibold mb-2">MejorPrecio</h3>
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

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {planes.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden transition-all hover:shadow-xl ${
                    plan.id === "diamante" ? "ring-2 ring-primary shadow-lg scale-105" : ""
                  }`}
                >
                  {plan.id === "diamante" && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-primary/80 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
                      Recomendado
                    </div>
                  )}

                  <CardHeader className={`bg-gradient-to-r ${plan.color} text-white`}>
                    <CardTitle className="text-2xl">{plan.nombre}</CardTitle>
                    <div className="mt-4">
                      <div className="text-4xl font-bold">{plan.precio}</div>
                      <div className="text-white/90 mt-1">{plan.duracion}</div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-600">Exposición:</span>
                      <span className="ml-2 text-sm font-semibold text-gray-900">{plan.exposicion}</span>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.caracteristicas.map((caracteristica, index) => (
                        <li key={index} className="flex items-start gap-2">
                          {caracteristica.incluido ? (
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${caracteristica.incluido ? "text-gray-700" : "text-gray-400"}`}>
                            {caracteristica.texto}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`w-full ${
                        plan.id === "diamante"
                          ? "bg-primary hover:bg-primary/90"
                          : "bg-gray-800 hover:bg-gray-900"
                      }`}
                      size="lg"
                    >
                      Continuar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

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
