"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Home, Plus, Calendar, Building2, Loader2 } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiService, Subscription } from "@/lib/services/api"
import { toast } from "sonner"

export default function PublicarExitoPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const sub = await apiService.getMySubscription()
        setSubscription(sub)
      } catch (error: any) {
        console.error("Error obteniendo suscripción:", error)
        toast.error("Error al cargar la información de la suscripción")
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  // Calcular propiedades disponibles
  const propiedadesDisponibles = subscription?.plan
    ? subscription.plan.limite_propiedades - subscription.propiedades_usadas
    : 0

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-BO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Columna izquierda: Mensaje de éxito */}
            <Card>
              <CardContent className="p-12 text-center h-full flex flex-col justify-center">
                {/* Icono de éxito */}
                <div className="mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                </div>

                {/* Título */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ¡Pago completado!
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Tu suscripción está activa. Ahora puedes publicar tu propiedad.
                </p>

                {/* Botones de acción */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => router.push("/publicar")}
                    className="w-full"
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Publicar mi propiedad
                  </Button>
                  <Button
                    onClick={() => router.push("/")}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Ir al inicio
                  </Button>
                </div>

                {/* Información adicional */}
                <p className="text-sm text-gray-500 mt-6">
                  💡 Tip: Completa el perfil de tu propiedad con buenas fotos y una descripción detallada
                  para obtener más visitas.
                </p>
              </CardContent>
            </Card>

            {/* Columna derecha: Detalles de la suscripción */}
            <div>
              {loading ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-600">Cargando detalles de tu suscripción...</p>
                  </CardContent>
                </Card>
              ) : subscription ? (
                <>
                  {/* Detalles del plan */}
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                          {subscription.plan?.nombre || "Plan"}
                        </h2>
                        <Badge variant="default" className="bg-green-600">
                          ACTIVO
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        {/* Precio pagado */}
                        <div className="flex justify-between items-center pb-3 border-b">
                          <span className="text-gray-600">Monto pagado</span>
                          <span className="text-2xl font-bold text-primary">
                            Bs.{subscription.plan?.precio?.toLocaleString() || "0"}
                          </span>
                        </div>

                        {/* Propiedades disponibles */}
                        <div className="flex justify-between items-center pb-3 border-b">
                          <span className="text-gray-600">Propiedades disponibles</span>
                          <div className="text-right">
                            <span className="text-lg font-semibold">
                              {propiedadesDisponibles} de {subscription.plan?.limite_propiedades || 0}
                            </span>
                            <p className="text-xs text-gray-500">
                              {subscription.propiedades_usadas} usadas
                            </p>
                          </div>
                        </div>

                        {/* Vigencia */}
                        <div className="flex justify-between items-center pb-3 border-b">
                          <span className="text-gray-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Vigencia
                          </span>
                          <div className="text-right">
                            <p className="font-semibold">
                              {subscription.plan?.duracion_meses || 0} {subscription.plan?.duracion_meses === 1 ? "mes" : "meses"}
                            </p>
                            <p className="text-xs text-gray-500">
                              hasta el {formatearFecha(subscription.fecha_fin)}
                            </p>
                          </div>
                        </div>

                        {/* Método de pago */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Método de pago</span>
                          <Badge variant="outline">
                            {subscription.plan?.metodo_pago || "QR"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Características del plan */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Características incluidas
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {subscription.plan?.caracteristicas
                          ?.split(",")
                          .map((c) => c.trim())
                          .map((caracteristica, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <span>{caracteristica}</span>
                            </li>
                          )) || (
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <span>Publicación de propiedades</span>
                            </li>
                          )}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-gray-600">No se pudo cargar la información de la suscripción</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
