"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Users, Loader2, FileText, Check, X, Calendar, Wallet,
  AlertCircle, Clock, CircleCheck, CircleX, ExternalLink, Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiService, TenantSummary, RentPayment } from "@/lib/services/api"
import { getImageUrl } from "@/lib/utils"
import { toast } from "sonner"

const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

export default function InquilinosPanelPage() {
  const [inquilinos, setInquilinos] = useState<TenantSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState<number | null>(null)

  const fetchInquilinos = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiService.getMisInquilinos()
      setInquilinos(data.inquilinos || [])
    } catch (error) {
      console.error("Error cargando inquilinos:", error)
      toast.error("Error al cargar tus inquilinos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInquilinos()
  }, [fetchInquilinos])

  const confirmarPago = async (pago: RentPayment) => {
    setProcesando(pago.id)
    try {
      // PATCH /api/rent-payments/:id con estado pagado
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      const token = localStorage.getItem("token")
      const res = await fetch(`${apiUrl}/api/rent-payments/${pago.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: "pagado" }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Error confirmando pago")
      }
      toast.success("Pago confirmado. El inquilino será notificado")
      fetchInquilinos()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Error confirmando el pago")
    } finally {
      setProcesando(null)
    }
  }

  const rechazarPago = async (pago: RentPayment) => {
    setProcesando(pago.id)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      const token = localStorage.getItem("token")
      const res = await fetch(`${apiUrl}/api/rent-payments/${pago.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: "pendiente" }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Error rechazando comprobante")
      }
      toast.success("Comprobante rechazado. El inquilino deberá volver a subirlo")
      fetchInquilinos()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Error rechazando el comprobante")
    } finally {
      setProcesando(null)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pagado":
        return <Badge className="bg-green-500"><CircleCheck className="w-3 h-3 mr-1" />Pagado</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>
      case "atrasado":
        return <Badge className="bg-red-500"><AlertCircle className="w-3 h-3 mr-1" />Atrasado</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const getEstadoContratoBadge = (estado: string) => {
    switch (estado) {
      case "activo":
        return <Badge className="bg-green-500">Activo</Badge>
      case "vencido":
        return <Badge className="bg-orange-500">Vencido</Badge>
      case "terminado":
        return <Badge className="bg-gray-500">Terminado</Badge>
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

  const finalizarContrato = async (contrato: TenantSummary) => {
    if (!confirm("¿Finalizar este contrato? Se registrará la devolución del anticrés/depósito para que el inquilino la confirme.")) return
    setProcesando(contrato.id)
    try {
      await apiService.terminarContrato(contrato.id)
      toast.success("Contrato finalizado. El inquilino deberá confirmar la recepción de la devolución")
      fetchInquilinos()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Error finalizando el contrato")
    } finally {
      setProcesando(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-8 w-8 text-blue-600" />
          Mis Inquilinos
        </h1>
        <p className="text-gray-600 mt-1">Contratos de alquiler de tus propiedades y sus pagos</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      ) : inquilinos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aún no tienes inquilinos</h3>
          <p className="text-gray-600">Cuando aceptes una solicitud de alquiler, el contrato y sus cuotas aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-6">
          {inquilinos.map((inquilino) => (
            <div key={inquilino.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Cabecera del contrato */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    {inquilino.property?.imagenes && inquilino.property.imagenes.length > 0 ? (
                      <img
                        src={getImageUrl(inquilino.property.imagenes[0].image_url) || ""}
                        alt={inquilino.property?.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {inquilino.inquilino?.nombre} {inquilino.inquilino?.apellido}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{inquilino.property?.titulo}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(inquilino.fecha_inicio).toLocaleDateString("es-ES")} → {new Date(inquilino.fecha_fin).toLocaleDateString("es-ES")}
                      </span>
                      {inquilino.tipo_contrato === "anticretico" ? (
                        <span className="flex items-center gap-1 font-medium text-gray-700">
                          <Wallet className="w-3 h-3" />
                          Anticrés: Bs. {(inquilino.pagos.find((p) => p.tipo === "anticres")?.monto || 0).toLocaleString()}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-medium text-gray-700">
                          <Wallet className="w-3 h-3" />
                          Bs. {inquilino.monto_mensual.toLocaleString()}/mes
                        </span>
                      )}
                      {inquilino.tipo_contrato === "anticretico" && (
                        <Badge className="bg-indigo-600">Anticrético</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getEstadoContratoBadge(inquilino.estado)}
                  {inquilino.tipo_contrato === "anticretico" && (
                    <Badge className="bg-indigo-600">Anticrético</Badge>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={apiService.getContratoPdfUrl(inquilino.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      PDF
                    </a>
                  </Button>
                  {inquilino.estado === "activo" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-600 hover:bg-orange-50"
                      disabled={procesando === inquilino.id}
                      onClick={() => finalizarContrato(inquilino)}
                    >
                      {procesando === inquilino.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <CircleX className="w-3.5 h-3.5 mr-1" />
                          Finalizar
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Resumen de cuotas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 py-4 border-b border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{inquilino.cuotas_pagadas}</p>
                  <p className="text-xs text-gray-500">Pagadas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{inquilino.cuotas_pendientes}</p>
                  <p className="text-xs text-gray-500">Pendientes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{inquilino.cuotas_atrasadas}</p>
                  <p className="text-xs text-gray-500">Atrasadas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">Bs. {inquilino.total_pagado.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total recibido</p>
                </div>
              </div>

              {/* Tabla de pagos */}
              <div className="divide-y divide-gray-100">
                {inquilino.pagos.length === 0 ? (
                  <p className="px-6 py-4 text-sm text-gray-500">Sin pagos registrados</p>
                ) : (
                  inquilino.pagos.map((pago) => (
                    <div key={pago.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900">{periodoPago(pago)}</span>
                          {pago.tipo !== "cuota" && (
                            <Badge variant="outline">{pago.tipo === "deposito" ? "Depósito" : "Devolución"}</Badge>
                          )}
                          {getEstadoBadge(pago.estado)}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{pago.metodo_pago ? `Método: ${pago.metodo_pago}` : "Sin método registrado"}</span>
                          {pago.fecha_pago && (
                            <span>Fecha: {new Date(pago.fecha_pago).toLocaleDateString("es-ES")}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">
                          Bs. {pago.monto.toLocaleString()}
                        </span>

                        {pago.comprobante_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={getImageUrl(pago.comprobante_url) || pago.comprobante_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-1" />
                              Comprobante
                            </a>
                          </Button>
                        )}

                        {/* Confirmar / rechazar cuando hay comprobante pendiente */}
                        {pago.estado !== "pagado" && pago.comprobante_url && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              disabled={procesando === pago.id}
                              onClick={() => confirmarPago(pago)}
                            >
                              {procesando === pago.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5 mr-1" />
                              )}
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              disabled={procesando === pago.id}
                              onClick={() => rechazarPago(pago)}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}

                        {/* Marcar como pagado manualmente (sin comprobante) */}
                        {pago.estado !== "pagado" && !pago.comprobante_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 border-green-300 hover:bg-green-50"
                            disabled={procesando === pago.id}
                            onClick={() => confirmarPago(pago)}
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" />
                            Marcar pagado
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
