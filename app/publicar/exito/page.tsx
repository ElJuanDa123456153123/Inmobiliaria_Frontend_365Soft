"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  Home,
  Plus,
  Calendar,
  Building2,
  Loader2,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  ChevronRight,
  Gift,
  Award,
  Shield,
  Zap,
  Users,
  Eye
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { apiService, Subscription } from "@/lib/services/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function PublicarExitoPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const sub = await apiService.getMySubscription()
        setSubscription(sub)
        // Trigger confetti after a short delay
        setTimeout(() => setShowConfetti(true), 300)
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

  const porcentajeUsado = subscription?.plan
    ? (subscription.propiedades_usadas / subscription.plan.limite_propiedades) * 100
    : 0

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-BO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const quickActions = [
    {
      icon: Plus,
      label: "Publicar propiedad",
      description: "Añade una nueva propiedad",
      action: () => router.push("/publicar"),
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Eye,
      label: "Ver mis propiedades",
      description: "Gestiona tus publicaciones",
      action: () => router.push("/asesor/mis-propiedades"),
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Home,
      label: "Explorar propiedades",
      description: "Descubre el mercado",
      action: () => router.push("/propiedades"),
      color: "from-emerald-500 to-emerald-600"
    }
  ]

  const benefits = [
    { icon: TrendingUp, text: "Mayor visibilidad en la plataforma" },
    { icon: Shield, text: "Publicaciones verificadas" },
    { icon: Zap, text: "Soporte prioritario" },
    { icon: Users, text: "Acceso a interesados calificados" }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {/* Hero Section con Celebración */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                  <CheckCircle2 className="w-14 h-14 text-white animate-in zoom-in duration-500" />
                  {showConfetti && (
                    <>
                      <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />
                      <Sparkles className="absolute -bottom-2 -left-2 w-5 h-5 text-yellow-300 animate-bounce animation-delay-100" />
                      <Sparkles className="absolute top-0 left-0 w-4 h-4 text-yellow-200 animate-bounce animation-delay-200" />
                    </>
                  )}
                </div>
              </div>
            </div>

            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              ¡Felicidades, pago completado! 🎉
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Tu suscripción está <span className="text-green-600 font-semibold">activa</span> y estás listo para comenzar a publicar tus propiedades
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Columna izquierda: Resumen */}
            <div className="lg:col-span-2 space-y-8">
              {/* Estadísticas principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
                <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Building2 className="w-8 h-8 opacity-80" />
                      <Award className="w-6 h-6 opacity-60" />
                    </div>
                    <p className="text-blue-100 text-sm mb-1">Plan Activo</p>
                    <p className="text-2xl font-bold">{subscription?.plan?.nombre || "Cargando..."}</p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                  <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Building2 className="w-8 h-8 opacity-80" />
                      <Sparkles className="w-6 h-6 opacity-60" />
                    </div>
                    <p className="text-emerald-100 text-sm mb-1">Propiedades disponibles</p>
                    <p className="text-2xl font-bold">{propiedadesDisponibles}</p>
                    <p className="text-emerald-100 text-xs">de {subscription?.plan?.limite_propiedades || 0} totales</p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Clock className="w-8 h-8 opacity-80" />
                      <Calendar className="w-6 h-6 opacity-60" />
                    </div>
                    <p className="text-purple-100 text-sm mb-1">Vigencia hasta</p>
                    <p className="text-lg font-bold leading-tight">
                      {subscription?.fecha_fin ? formatearFecha(subscription.fecha_fin) : "---"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Acciones rápidas */}
              <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-left-4 duration-700 delay-400">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    Acciones rápidas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => {
                      const Icon = action.icon
                      return (
                        <button
                          key={index}
                          onClick={action.action}
                          className="group relative p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-white border-2 border-transparent hover:border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        >
                          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <p className="font-semibold text-gray-900 mb-1">{action.label}</p>
                          <p className="text-sm text-gray-600">{action.description}</p>
                          <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Beneficios */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 animate-in fade-in slide-in-from-left-4 duration-700 delay-500">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Gift className="w-6 h-6 text-orange-500" />
                    Lo que incluye tu plan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {benefits.map((benefit, index) => {
                      const Icon = benefit.icon
                      return (
                        <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-orange-200/50 hover:shadow-md transition-all duration-300">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{benefit.text}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Columna derecha: Detalles completos */}
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-400">
              {/* Tarjeta principal de suscripción */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-gray-600">Cargando detalles...</p>
                    </div>
                  ) : subscription ? (
                    <div className="space-y-6">
                      {/* Header del plan */}
                      <div className="text-center pb-6 border-b border-gray-200">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold text-sm mb-4">
                          <Star className="w-4 h-4 fill-current" />
                          PLAN ACTIVO
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          {subscription.plan?.nombre || "Plan"}
                        </h2>
                        <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          Bs.{subscription.plan?.precio?.toLocaleString() || "0"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Pagado con {subscription.plan?.metodo_pago || "QR"}
                        </p>
                      </div>

                      {/* Barra de progreso */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Uso del plan</span>
                          <span className="text-sm text-gray-600">
                            {subscription.propiedades_usadas} de {subscription.plan?.limite_propiedades || 0}
                          </span>
                        </div>
                        <Progress value={porcentajeUsado} className="h-3" />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          {propiedadesDisponibles > 0
                            ? `¡Tienes ${propiedadesDisponibles} ${propiedadesDisponibles === 1 ? "propiedad disponible" : "propiedades disponibles"}!`
                            : "Has alcanzado el límite de tu plan"}
                        </p>
                      </div>

                      {/* Lista de características */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Características</h3>
                        <ul className="space-y-3">
                          {subscription.plan?.caracteristicas
                            ?.split(",")
                            .map((c) => c.trim())
                            .map((caracteristica, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-sm text-gray-700">{caracteristica}</span>
                              </li>
                            )) || (
                            <li className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              </div>
                              <span className="text-sm text-gray-700">Publicación de propiedades</span>
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Información de vigencia */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Fecha de inicio</span>
                          <span className="font-medium text-gray-900">
                            {subscription.fecha_inicio ? formatearFecha(subscription.fecha_inicio) : "---"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-gray-600">Fecha de fin</span>
                          <span className="font-medium text-gray-900">
                            {subscription.fecha_fin ? formatearFecha(subscription.fecha_fin) : "---"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-600 py-12">
                      No se pudo cargar la información
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Tip profesional</p>
                      <p className="text-sm text-blue-100 leading-relaxed">
                        Las propiedades con más de 8 fotos y descripciones detalladas reciben hasta 3x más consultas. ¡Invierte tiempo en tu publicación!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA Final */}
              <Button
                onClick={() => router.push("/publicar")}
                size="lg"
                className="w-full shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg group"
              >
                Comenzar a publicar
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-100 {
          animation-delay: 100ms;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </div>
  )
}
