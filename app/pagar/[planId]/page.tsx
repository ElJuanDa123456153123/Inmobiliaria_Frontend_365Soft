"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Clock, AlertCircle, CheckCircle2, QrCode, Loader2, XCircle } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { apiService, Plan, QrPago } from "@/lib/services/api"
import { toast } from "sonner"

export default function PagarPage() {
  const router = useRouter()
  const params = useParams()
  const planId = params.planId

  const [plan, setPlan] = useState<Plan | null>(null)
  const [qrPago, setQrPago] = useState<QrPago | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingPayment, setCreatingPayment] = useState(false)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [cancellingPayment, setCancellingPayment] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutos en segundos
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Crear pago al cargar la página
  useEffect(() => {
    console.log("=== Página /pagar/[planId] montada ===")
    console.log("planId:", planId)

    // Verificar token ANTES de hacer cualquier llamada
    const token = localStorage.getItem("token")
    console.log("Token en /pagar/[planId]:", token ? "SÍ" : "NO")
    console.log("Token completo:", token?.substring(0, 20) + "...")

    const crearPago = async () => {
      try {
        console.log("Iniciando crearPago...")
        setCreatingPayment(true)

        // Obtener plan
        console.log("Llamando getPlan...")
        const planData = await apiService.getPlan(Number(planId))
        console.log("Plan obtenido:", planData)
        setPlan(planData)

        // Crear pago (necesitamos property_id, pero en este caso aún no existe)
        // Vamos a crear una propiedad temporal
        console.log("Llamando createPayment...")
        const paymentData = await apiService.createPayment({
          property_id: 0, // ID temporal, se actualizará después
          plan_id: Number(planId),
        })
        console.log("Pago creado:", paymentData)

        setQrPago(paymentData)

        // Iniciar polling
        startPolling(paymentData.id)

        // Iniciar contador regresivo
        startTimer(paymentData.fecha_vencimiento)
      } catch (error: any) {
        console.error("Error en crearPago:", error)
        toast.error(error.message || "Error al crear el pago")
        router.push("/planes")
      } finally {
        setCreatingPayment(false)
        setLoading(false)
      }
    }

    if (planId) {
      crearPago()
    }

    // Cleanup
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [planId])

  // Función para verificar el estado del pago
  const checkPaymentStatus = async (paymentId: number) => {
    try {
      const status = await apiService.getPaymentStatus(paymentId)

      if (status.estado === "PAGADO") {
        // Pago completado
        setPaymentCompleted(true)
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
        }
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }

        toast.success("¡Pago completado!")

        // Redirigir a página de éxito después de 2 segundos
        setTimeout(() => {
          router.push("/publicar/exito")
        }, 2000)

        return true
      }

      return false
    } catch (error: any) {
      console.error("Error verificando estado:", error)
      return false
    }
  }

  // Iniciar polling cada 10 segundos
  const startPolling = (paymentId: number) => {
    pollingRef.current = setInterval(async () => {
      const completed = await checkPaymentStatus(paymentId)
      if (completed) {
        setPaymentCompleted(true)
      }
    }, 10000) // 10 segundos
  }

  // Iniciar contador regresivo
  const startTimer = (fechaVencimiento: string) => {
    const expiryDate = new Date(fechaVencimiento)

    timerRef.current = setInterval(() => {
      const now = new Date()
      const diff = Math.floor((expiryDate.getTime() - now.getTime()) / 1000)

      if (diff <= 0) {
        setTimeLeft(0)
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
        toast.error("El QR ha expirado")
        router.push("/planes")
        return
      }

      setTimeLeft(diff)
    }, 1000)
  }

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Cancelar pago
  const handleCancelPayment = async () => {
    if (!qrPago) return

    try {
      setCancellingPayment(true)
      await apiService.cancelPayment(qrPago.id)

      // Detener polling y timer
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      toast.success("Pago cancelado exitosamente")
      router.push("/planes")
    } catch (error: any) {
      console.error("Error cancelando pago:", error)
      toast.error(error.message || "Error al cancelar el pago")
    } finally {
      setCancellingPayment(false)
      setShowCancelDialog(false)
    }
  }

  if (loading || creatingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {loading ? "Cargando plan..." : "Generando QR de pago..."}
          </p>
        </div>
      </div>
    )
  }

  if (!plan || !qrPago) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">No se pudo cargar la información del pago</p>
          <Button onClick={() => router.push("/planes")} className="mt-4">
            Volver a planes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Información del plan */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">{plan.nombre}</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-gray-600">Precio</span>
                      <span className="text-2xl font-bold text-primary">
                        Bs.{plan.precio.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-gray-600">Propiedades</span>
                      <span className="font-semibold">
                        {plan.limite_propiedades === 1
                          ? "1 propiedad"
                          : `${plan.limite_propiedades} propiedades`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-gray-600">Vigencia</span>
                      <span className="font-semibold">
                        {plan.duracion_meses === 1
                          ? "1 mes"
                          : `${plan.duracion_meses} meses`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Método de pago</span>
                      <Badge variant="outline">{plan.metodo_pago}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instrucciones */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Instrucciones
                  </h3>
                  <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                    <li>Abre la app de tu banco (Bisa, BCP, etc.)</li>
                    <li>Selecciona "Scanear QR" o "Pagos QR"</li>
                    <li>Escanea el código QR</li>
                    <li>Confirma el pago</li>
                    <li>Espera la confirmación (automático)</li>
                  </ol>
                </CardContent>
              </Card>
            </div>

            {/* QR de pago */}
            <div>
              <Card>
                <CardContent className="p-6 text-center">
                  {paymentCompleted ? (
                    <div className="py-8">
                      <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-green-600 mb-2">
                        ¡Pago completado!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Redirigiendo a publicar...
                      </p>
                      <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                    </div>
                  ) : (
                    <>
                      {/* Contador regresivo */}
                      <div className="mb-4">
                        <Badge
                          variant={timeLeft < 300 ? "destructive" : "secondary"}
                          className="text-sm px-4 py-2"
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Expira en {formatTime(timeLeft)}
                        </Badge>
                      </div>

                      {/* QR Code */}
                      {qrPago.imagen_qr ? (
                        <div className="bg-white p-6 rounded-lg inline-block mb-4">
                          <img
                            src={`data:image/png;base64,${qrPago.imagen_qr}`}
                            alt="QR de pago"
                            className="w-[384px] h-[384px] object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-[384px] h-[384px] mx-auto bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                          <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        </div>
                      )}

                      {/* Información de pago */}
                      <div className="space-y-2 text-sm text-gray-700">
                        <p className="font-semibold">
                          Monto a pagar: <span className="text-primary">Bs.{plan.precio.toLocaleString()}</span>
                        </p>
                        <p className="text-gray-500">
                          Referencia: <span className="font-mono">{qrPago.alias}</span>
                        </p>
                      </div>

                      {/* Estado de verificación */}
                      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verificando pago cada 10 segundos...
                        </p>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex gap-3 mt-6">
                        {/* Botón para verificar manualmente */}
                        <Button
                          onClick={() => checkPaymentStatus(qrPago.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Verificar ahora
                        </Button>

                        {/* Botón cancelar */}
                        <Button
                          onClick={() => setShowCancelDialog(true)}
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          disabled={cancellingPayment}
                        >
                          {cancellingPayment ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Cancelando...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancelar pago
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Diálogo de confirmación de cancelación */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar el pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto cancelará el QR y ya no podrá realizar el pago. Si deseas continuar, deberás seleccionar el plan nuevamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelPayment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, cancelar pago
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
