"use client"

import { useState, useEffect, useCallback } from "react"
import { DollarSign, Calendar, Clock, Loader2, Upload, X, ImageIcon, ExternalLink, CircleCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiService, RentPayment } from "@/lib/services/api"
import { getImageUrl } from "@/lib/utils"
import { toast } from "sonner"

const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

export default function MisContratosPagosPage() {
  const [payments, setPayments] = useState<RentPayment[]>([])
  const [loading, setLoading] = useState(true)

  // Modal de pago
  const [pagoAPagar, setPagoAPagar] = useState<RentPayment | null>(null)
  const [metodoPago, setMetodoPago] = useState("qr")
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [subiendo, setSubiendo] = useState(false)

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiService.getPaymentHistory()
      setPayments(data.pagos || [])
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pagado":
        return <Badge className="bg-green-500">Pagado</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-500">Pendiente</Badge>
      case "atrasado":
        return <Badge className="bg-red-500">Atrasado</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const periodoPago = (pago: RentPayment) => {
    if (pago.tipo === "deposito") return "Depósito de garantía"
    if (pago.tipo === "devolucion_deposito") return "Devolución de depósito"
    if (pago.tipo === "anticres") return "Pago de anticrés"
    if (pago.tipo === "devolucion_anticres") return "Devolución de anticrés"
    return `${meses[pago.mes_correspondiente - 1] || "?"} ${pago.anio}`
  }

  const esDevolucion = (pago: RentPayment) =>
    pago.tipo === "devolucion_anticres" || pago.tipo === "devolucion_deposito"

  const confirmarRecepcion = async (pago: RentPayment) => {
    try {
      await apiService.confirmarRecepcionDevolucion(pago.id)
      toast.success("Devolución confirmada. El propietario será notificado")
      fetchPayments()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Error confirmando la devolución")
    }
  }

  const handlePagar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pagoAPagar) return
    if (!comprobante) {
      toast.error("Sube una foto del comprobante de pago")
      return
    }

    setSubiendo(true)
    try {
      // 1. Subir la imagen del comprobante
      const upload = await apiService.uploadImage(comprobante)

      // 2. Registrar el comprobante en la cuota
      await apiService.submitComprobanteCuota(pagoAPagar.id, {
        metodo_pago: metodoPago,
        comprobante_url: upload.url,
      })

      toast.success("Comprobante enviado. El propietario lo confirmará pronto")
      setPagoAPagar(null)
      setComprobante(null)
      setMetodoPago("qr")
      fetchPayments()
    } catch (error) {
      console.error("Error enviando pago:", error)
      toast.error(error instanceof Error ? error.message : "Error al enviar el comprobante")
    } finally {
      setSubiendo(false)
    }
  }

  // Agrupar pagos por propiedad
  const pagosPorPropiedad = payments.reduce((acc, payment) => {
    const key = payment.contract?.property?.titulo || "Otro"
    if (!acc[key]) acc[key] = []
    acc[key].push(payment)
    return acc
  }, {} as Record<string, RentPayment[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pagos de Alquiler</h1>
        <p className="text-gray-600 mt-1">Tus cuotas mensuales y depósito. Sube el comprobante cuando pagues</p>
      </div>

      {/* Lista */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay pagos registrados</h3>
          <p className="text-gray-600">Cuando tengas un contrato de alquiler activo, tus cuotas se mostrarán aquí</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(pagosPorPropiedad).map(([propiedad, pagos]) => (
            <div key={propiedad} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{propiedad}</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {pagos.map((payment) => (
                  <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-semibold text-gray-900">{periodoPago(payment)}</h4>
                          {payment.tipo !== "cuota" && (
                            <Badge variant="outline">{payment.tipo === "deposito" ? "Depósito" : "Devolución"}</Badge>
                          )}
                          {getEstadoBadge(payment.estado)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Vence: {new Date(payment.fecha_pago).toLocaleDateString("es-ES")}
                          </div>
                          {payment.metodo_pago && (
                            <div className="flex items-center capitalize">
                              <Clock className="w-4 h-4 mr-1" />
                              {payment.metodo_pago}
                            </div>
                          )}
                          {payment.comprobante_url && (
                            <a
                              href={getImageUrl(payment.comprobante_url) || payment.comprobante_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:underline"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Ver mi comprobante
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-900">
                          Bs. {payment.monto.toLocaleString()}
                        </span>
                        {esDevolucion(payment) ? (
                          payment.estado !== "pagado" ? (
                            <Button
                              className="bg-indigo-600 hover:bg-indigo-700"
                              size="sm"
                              onClick={() => confirmarRecepcion(payment)}
                            >
                              <CircleCheck className="w-4 h-4 mr-1" />
                              Confirmar recepción
                            </Button>
                          ) : (
                            <Badge className="bg-green-500">Devuelto</Badge>
                          )
                        ) : payment.estado !== "pagado" && (
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                            onClick={() => setPagoAPagar(payment)}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            {payment.comprobante_url ? "Reenviar pago" : "Pagar"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de pago */}
      {pagoAPagar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Registrar pago</h3>
                <button
                  onClick={() => setPagoAPagar(null)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="font-semibold text-gray-900">{periodoPago(pagoAPagar)}</p>
                <p className="text-sm text-gray-600">
                  Monto: <strong>Bs. {pagoAPagar.monto.toLocaleString()}</strong>
                </p>
              </div>

              <form onSubmit={handlePagar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forma de pago *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "qr", label: "QR" },
                      { value: "efectivo", label: "Efectivo" },
                      { value: "transferencia", label: "Transferencia" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setMetodoPago(opt.value)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          metodoPago === opt.value
                            ? "bg-green-50 border-green-500 text-green-700"
                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comprobante de pago *
                  </label>
                  {comprobante ? (
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-700 truncate">{comprobante.name}</span>
                      <button
                        type="button"
                        onClick={() => setComprobante(null)}
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition-colors">
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click para subir la foto del comprobante</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) setComprobante(file)
                        }}
                      />
                    </label>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPagoAPagar(null)}
                    disabled={subiendo}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={subiendo}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {subiendo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Enviar comprobante"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
