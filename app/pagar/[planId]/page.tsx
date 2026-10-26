"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  QrCode,
  Loader2,
  ArrowLeft,
  CreditCard,
  Camera,
  Shield,
  Check,
  Info,
  RefreshCw,
  Download,
  XCircle,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PaymentWizard, { PaymentStep, StepConfig } from "@/components/payment/PaymentWizard"
import PaymentMethodSelector, { PaymentMethod } from "@/components/payment/PaymentMethodSelector"
import ProofUploader from "@/components/payment/ProofUploader"
import CodeSnippet from "@/components/payment/CodeSnippet"
import { apiService, Plan, QrPago } from "@/lib/services/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type PaymentType = 'qr' | 'proof'

export default function PagarPage() {
  const router = useRouter()
  const params = useParams()
  const planId = params.planId

  // Estados del wizard
  const [currentStep, setCurrentStep] = useState<PaymentStep>('method')
  const [paymentType, setPaymentType] = useState<PaymentType>('qr')
  const [plan, setPlan] = useState<Plan | null>(null)
  const [qrPago, setQrPago] = useState<QrPago | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingPayment, setCreatingPayment] = useState(false)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [expirado, setExpirado] = useState(false)
  const [cancelandoQr, setCancelandoQr] = useState(false)

  // Pasos del wizard para el flujo QR: 2 pasos, sin "Confirmar" manual
  const qrSteps: StepConfig[] = [
    {
      id: 'method',
      title: 'Método de Pago',
      description: 'Selecciona cómo pagar',
      icon: CreditCard,
    },
    {
      id: 'proof',
      title: 'Escanear y Pagar',
      description: 'Verificación automática',
      icon: QrCode,
    },
  ]

  // Para comprobante
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)

  // Timer
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Cargar plan al inicio (NO crear pago)
  useEffect(() => {
    if (!planId) return

    const loadPlan = async () => {
      try {
        setLoading(true)
        const planData = await apiService.getPlan(Number(planId))
        setPlan(planData)
      } catch (error: any) {
        toast.error(error.message || "Error al cargar el plan")
        router.push("/planes")
      } finally {
        setLoading(false)
      }
    }

    loadPlan()

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [planId, router])

  // Iniciar polling de pago (solo para QR, apenas se muestra el QR)
  useEffect(() => {
    if (paymentType === 'qr' && qrPago && currentStep === 'proof') {
      startPolling(qrPago.id)
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [paymentType, qrPago, currentStep])

  const startPolling = (paymentId: number) => {
    pollingRef.current = setInterval(async () => {
      try {
        const status = await apiService.getPaymentStatus(paymentId)

        if (status.estado === "PAGADO") {
          setPaymentCompleted(true)
          setCurrentStep('success')
          if (pollingRef.current) clearInterval(pollingRef.current)
          if (timerRef.current) clearInterval(timerRef.current)

          toast.success("¡Pago completado con éxito!")

          setTimeout(() => {
            router.push("/publicar/exito")
          }, 2000)
        }
      } catch (error) {
        console.error("Error verificando pago:", error)
      }
    }, 5000)
  }

  const startTimer = (fechaVencimiento: string) => {
    const expiryDate = new Date(fechaVencimiento)

    timerRef.current = setInterval(() => {
      const now = new Date()
      const diff = Math.floor((expiryDate.getTime() - now.getTime()) / 1000)

      if (diff <= 0) {
        setTimeLeft(0)
        setExpirado(true)
        if (timerRef.current) clearInterval(timerRef.current)
        if (pollingRef.current) clearInterval(pollingRef.current)
        return
      }

      setTimeLeft(diff)
    }, 1000)
  }

  // Cancelar el QR activo: lo inhabilita en el banco y vuelve al paso 1
  const handleCancelarQr = async () => {
    if (!qrPago) return
    setCancelandoQr(true)
    try {
      await apiService.cancelPayment(qrPago.id)
      toast.info("Pago cancelado. El QR fue inhabilitado")
    } catch {
      toast.error("No se pudo cancelar el QR, intenta de nuevo")
      setCancelandoQr(false)
      return
    } finally {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
      setQrPago(null)
      setTimeLeft(15 * 60)
      setExpirado(false)
    }
    setCancelandoQr(false)
    setCurrentStep('method')
  }

  // Generar un nuevo QR cuando el anterior expiró
  const handleRegenerarQr = async () => {
    if (qrPago) {
      // Inhabilitar el QR vencido (best-effort)
      apiService.cancelPayment(qrPago.id).catch(() => {})
    }
    try {
      setCreatingPayment(true)
      setExpirado(false)
      const paymentData = await apiService.createPayment({
        property_id: 0,
        plan_id: Number(planId),
      })
      setQrPago(paymentData)
      setTimeLeft(15 * 60)
      startTimer(paymentData.fecha_vencimiento)
    } catch (error: any) {
      toast.error(error.message || "Error al generar un nuevo QR")
      setExpirado(true)
    } finally {
      setCreatingPayment(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handlers de navegación
  const handleNext = async () => {
    if (currentStep === 'method') {
      if (paymentType === 'qr') {
        // Para QR: crear pago y mostrar loading
        try {
          setCreatingPayment(true)

          const paymentData = await apiService.createPayment({
            property_id: 0,
            plan_id: Number(planId),
          })

          setQrPago(paymentData)
          startTimer(paymentData.fecha_vencimiento)

          // Avanzar al paso de comprobante/QR
          setCurrentStep('proof')
        } catch (error: any) {
          toast.error(error.message || "Error al crear el pago")
          // No avanzar si hay error
        } finally {
          setCreatingPayment(false)
        }
      } else {
        // Para Comprobante: avanzar directo sin crear pago ni esperar
        setCurrentStep('proof')
      }
    } else if (currentStep === 'proof') {
      // Solo el flujo de comprobante avanza manualmente; el QR se verifica solo
      if (paymentType === 'proof') {
        setCurrentStep('confirm')
      }
    } else if (currentStep === 'confirm') {
      // Confirmar y enviar
      await handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep === 'proof') {
      setCurrentStep('method')
    } else if (currentStep === 'confirm') {
      setCurrentStep('proof')
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      if (paymentType === 'proof') {
        // Crear el pago si aún no existe (vincula el comprobante a un QR)
        let pago = qrPago
        if (!pago) {
          try {
            setCreatingPayment(true)
            pago = await apiService.createPayment({
              property_id: 0,
              plan_id: Number(planId),
            })
            setQrPago(pago)
          } catch (error: any) {
            toast.error(error.message || "Error al crear el pago")
            return
          } finally {
            setCreatingPayment(false)
          }
        }

        // Validar el comprobante
        if (!proofFile || !proofPreview) {
          toast.error('Debes subir una imagen del comprobante')
          return
        }

        const result = await apiService.uploadProof({
          qr_pago_id: pago.id,
          image: proofPreview, // Base64
        })

        toast.success(result.message || 'Comprobante enviado. Esperando aprobación del administrador.')

        // Redirigir al home (todavía no puede gestionar propiedades hasta que se apruebe)
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
      // Si es QR, el polling ya verificó y redirigió solo
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar comprobante')
    } finally {
      setSubmitting(false)
    }
  }

  // Validar si se puede avanzar
  const canProceed = () => {
    if (currentStep === 'method') {
      return paymentType !== null
    } else if (currentStep === 'proof') {
      if (paymentType === 'qr') {
        return qrPago !== null
      } else {
        return proofFile !== null && proofPreview !== null
      }
    }
    return true
  }

  if (loading || creatingPayment) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-blue-950 dark:to-gray-900">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
              <div className="absolute inset-0 w-16 h-16 animate-ping bg-primary/20 rounded-full mx-auto"></div>
            </div>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {loading ? "Cargando plan..." : paymentType === 'qr' ? "Generando QR de pago..." : "Procesando..."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-blue-950 dark:to-gray-900">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              No se pudo cargar la información
            </h2>
            <Button onClick={() => router.push("/planes")} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a planes
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Solo verificar qrPago para QR (para comprobante no es necesario al subir)
  if (currentStep !== 'method' && paymentType === 'qr' && !qrPago) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-blue-950 dark:to-gray-900">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              No se pudo crear el pago
            </h2>
            <Button onClick={() => {
              setCurrentStep('method')
              setQrPago(null)
            }} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a seleccionar método
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // === RENDERIZADO DE PASOS ===

  const renderMethodStep = () => (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/20 rounded-full p-3">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Paso 1: Selecciona Método de Pago
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Elige cómo deseas pagar tu plan. Puedes escanear el código QR o subir un comprobante de pago.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Option */}
        <button
          onClick={() => setPaymentType('qr')}
          className={cn(
            "relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group hover:shadow-xl",
            paymentType === 'qr'
              ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary/50"
          )}
        >
          {paymentType === 'qr' && (
            <div className="absolute top-4 right-4 bg-primary rounded-full p-1">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}

          <div className="flex items-start gap-4">
            <div className={cn(
              "p-4 rounded-xl transition-all duration-300",
              paymentType === 'qr' ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800"
            )}>
              <QrCode className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                Pagar con QR
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Escanea el código con tu app bancaria. El pago se verifica automáticamente.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-gray-500 dark:text-gray-500">Verificación automática</span>
              </div>
            </div>
          </div>
        </button>

        {/* Proof Option */}
        <button
          onClick={() => setPaymentType('proof')}
          className={cn(
            "relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group hover:shadow-xl",
            paymentType === 'proof'
              ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary/50"
          )}
        >
          {paymentType === 'proof' && (
            <div className="absolute top-4 right-4 bg-primary rounded-full p-1">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}

          <div className="flex items-start gap-4">
            <div className={cn(
              "p-4 rounded-xl transition-all duration-300",
              paymentType === 'proof' ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800"
            )}>
              <Camera className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                Subir Comprobante
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Toma una foto de tu comprobante y envíalo. Revisión en 24-48 horas.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-gray-500 dark:text-gray-500">Revisión manual 24-48h</span>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Plan Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total a pagar</p>
              <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">
                Bs.{plan.precio.toLocaleString()}
              </p>
            </div>
            <Badge className="bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-sm px-3 py-1">
              {plan.nombre}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderProofStep = () => (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/20 rounded-full p-3">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Paso 2: {paymentType === 'qr' ? 'Escanea el Código QR' : 'Sube tu Comprobante'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {paymentType === 'qr'
                  ? 'Escanea el código QR con tu app bancaria. El pago se verificará automáticamente.'
                  : 'Sube una foto clara de tu comprobante de pago. El administrador revisará tu pago.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {paymentType === 'qr' ? (
        /* QR Code View */
        <Card className="border-2 border-primary/30 shadow-xl">
          <CardContent className="p-8 text-center space-y-6">
            {/* Timer */}
            <div className={cn(
              "p-4 rounded-xl border-2 transition-all duration-300",
              expirado || timeLeft < 300
                ? "bg-red-100 dark:bg-red-950/30 border-red-500"
                : "bg-primary/10 dark:bg-primary/20 border-primary"
            )}>
              <div className="flex items-center justify-center gap-3">
                <Clock className={cn(
                  "w-6 h-6",
                  expirado || timeLeft < 300 ? "text-red-600 dark:text-red-400 animate-pulse" : "text-primary"
                )} />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {expirado ? "QR expirado" : "El QR se inhabilita en"}
                  </p>
                  <p className={cn(
                    "text-3xl font-bold font-mono",
                    expirado || timeLeft < 300 ? "text-red-600 dark:text-red-400" : "text-primary"
                  )}>
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-20 blur-xl"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-2xl border-4 border-gray-100">
                {qrPago?.imagen_qr && !expirado ? (
                  <img
                    src={`data:image/png;base64,${qrPago.imagen_qr}`}
                    alt="QR de pago"
                    className="w-[350px] h-[350px] object-contain"
                  />
                ) : (
                  <div className="w-[350px] h-[350px] flex flex-col items-center justify-center gap-3">
                    {expirado ? (
                      <>
                        <Clock className="w-14 h-14 text-red-400" />
                        <p className="text-sm text-gray-500">Este QR ya no es válido</p>
                        <Button onClick={handleRegenerarQr} disabled={creatingPayment}>
                          {creatingPayment ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                          Generar nuevo QR
                        </Button>
                      </>
                    ) : (
                      <Loader2 className="w-16 h-16 animate-spin text-primary" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Estado de verificación en vivo */}
            {!expirado && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-center gap-2 text-sm text-blue-900 dark:text-blue-300">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Esperando tu pago... Verificamos automáticamente cada 5 segundos</span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  Cuando el banco confirme, pasarás automáticamente a la siguiente pantalla
                </p>
              </div>
            )}

            {/* Amount */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4">
              <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Monto a pagar: <span className="text-green-600 dark:text-green-400">Bs.{plan.precio.toLocaleString()}</span>
              </p>
              <CodeSnippet code={qrPago?.alias || ''} label="Código de referencia" />
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                  Instrucciones:
                </p>
              </div>
              <ol className="text-xs text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
                <li>Abre la app de tu banco (Bisa, BCP, etc.)</li>
                <li>Selecciona "Scanear QR" o "Pagos QR"</li>
                <li>Escanea el código QR de arriba</li>
                <li>Verifica el monto y confirma el pago</li>
                <li>El sistema verificará automáticamente</li>
              </ol>
            </div>

            {/* Cancelar pago */}
            <Button
              variant="outline"
              onClick={handleCancelarQr}
              disabled={cancelandoQr}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              {cancelandoQr ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
              Cancelar pago e inhabilitar QR
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Proof Uploader */
        <ProofUploader
          onProofChange={(file, preview) => {
            setProofFile(file)
            setProofPreview(preview)
          }}
          submitting={submitting}
        />
      )}
    </div>
  )

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/20 rounded-full p-3">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Paso 3: Confirmar y Enviar Pago
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {paymentType === 'qr'
                  ? 'Verifica que el monto sea correcto. El sistema está verificando tu pago automáticamente.'
                  : 'Revisa que la imagen del comprobante sea clara. Al confirmar, el administrador revisará tu pago.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-2 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Resumen del Pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">Plan</span>
            <span className="font-semibold text-gray-900 dark:text-white">{plan.nombre}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">Método</span>
            <Badge className={paymentType === 'qr' ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400" : "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400"}>
              {paymentType === 'qr' ? 'QR Code' : 'Comprobante'}
            </Badge>
          </div>

          <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border-2 border-green-200 dark:border-green-800">
            <span className="text-gray-600 dark:text-gray-400">Monto Total</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              Bs.{plan.precio.toLocaleString()}
            </span>
          </div>

          {paymentType === 'proof' && proofFile && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm text-blue-900 dark:text-blue-300">
                <Check className="w-4 h-4" />
                <span>Comprobante listo: {proofFile.name}</span>
              </div>
            </div>
          )}

          {paymentType === 'qr' && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm text-blue-900 dark:text-blue-300">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verificando pago automáticamente cada 5 segundos...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderSuccessStep = () => (
    <div className="text-center space-y-6 py-12">
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
        <div className="relative bg-green-100 dark:bg-green-950/30 rounded-full w-32 h-32 flex items-center justify-center">
          <CheckCircle2 className="w-20 h-20 text-green-600 dark:text-green-400" />
        </div>
      </div>

      <h2 className="text-4xl font-bold text-green-600 dark:text-green-400">
        ¡Pago Completado!
      </h2>

      <p className="text-lg text-gray-600 dark:text-gray-400">
        {paymentType === 'qr'
          ? 'Tu pago ha sido verificado exitosamente.'
          : 'Tu comprobante ha sido enviado. El administrador lo revisará pronto.'
        }
      </p>

      <div className="flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Redirigiendo a publicar propiedad...
        </p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-blue-950 dark:to-gray-900">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Button
              onClick={() => router.push("/planes")}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Finalizar Pago
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Completa los pasos para procesar tu pago
              </p>
            </div>
          </div>

          {/* Wizard */}
          <PaymentWizard
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            canProceed={canProceed()}
            onProceed={handleNext}
            onBack={handleBack}
            isSubmitting={submitting}
            stepsConfig={paymentType === 'qr' ? qrSteps : undefined}
            hideNavigation={paymentType === 'qr' && currentStep === 'proof'}
          >
            {currentStep === 'method' && renderMethodStep()}
            {currentStep === 'proof' && renderProofStep()}
            {currentStep === 'confirm' && renderConfirmStep()}
            {currentStep === 'success' && renderSuccessStep()}
          </PaymentWizard>
        </div>
      </main>

      <Footer />
    </div>
  )
}
