"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Users, Loader2, FileText, Check, X, Calendar, Wallet,
  AlertCircle, Clock, CircleCheck, CircleX, Download, Search,
  ChevronRight, ReceiptText, Mail, Phone, ImageOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { apiService, TenantSummary, RentPayment } from "@/lib/services/api"
import { getImageUrl } from "@/lib/utils"
import { toast } from "sonner"

const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
const MESES_COMPLETOS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

const nombreInquilino = (i: TenantSummary) =>
  [i.inquilino?.nombre, i.inquilino?.apellido].filter(Boolean).join(" ") || "Inquilino"

// Prioridad de ordenamiento: atrasados primero, luego pendientes
const prioridad = (i: TenantSummary) => {
  if (i.estado !== "activo") return 3
  if (i.cuotas_atrasadas > 0) return 0
  if (i.cuotas_pendientes > 0) return 1
  return 2
}

export default function InquilinosPanelPage() {
  const [inquilinos, setInquilinos] = useState<TenantSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [seleccionado, setSeleccionado] = useState<number | null>(null)

  const fetchInquilinos = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiService.getMisInquilinos()
      const lista = data.inquilinos || []
      setInquilinos(lista)
      // Mantener selección válida; si no hay, elegir el primero por prioridad
      setSeleccionado((prev) =>
        prev && lista.some((i) => i.id === prev)
          ? prev
          : lista.length > 0
            ? [...lista].sort((a, b) => prioridad(a) - prioridad(b))[0].id
            : null
      )
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

  // Lista filtrada + ordenada
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return inquilinos
      .filter((i) => {
        if (!q) return true
        const nombre = nombreInquilino(i).toLowerCase()
        const propiedad = ((i.property?.titulo || "") + " " + (i.habitacion?.nombre || "")).toLowerCase()
        const email = (i.inquilino?.email || "").toLowerCase()
        return nombre.includes(q) || propiedad.includes(q) || email.includes(q)
      })
      .sort((a, b) => prioridad(a) - prioridad(b))
  }, [inquilinos, busqueda])

  const actual = filtrados.find((i) => i.id === seleccionado) || null

  // Resumen global
  const resumen = useMemo(() => {
    const activos = inquilinos.filter((i) => i.estado === "activo")
    return {
      total: inquilinos.length,
      atrasados: activos.filter((i) => i.cuotas_atrasadas > 0).length,
      pendientes: activos.filter((i) => i.cuotas_atrasadas === 0 && i.cuotas_pendientes > 0).length,
      alDia: activos.filter((i) => i.cuotas_atrasadas === 0 && i.cuotas_pendientes === 0).length,
    }
  }, [inquilinos])

  const confirmarPago = async (pago: RentPayment) => {
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
    return `${MESES_COMPLETOS[pago.mes_correspondiente - 1] || "?"} ${pago.anio}`
  }

  // Modal de confirmación para finalizar contrato
  const [pendienteFinalizar, setPendienteFinalizar] = useState<TenantSummary | null>(null)

  const confirmarFinalizar = async () => {
    if (!pendienteFinalizar) return
    const contrato = pendienteFinalizar
    setPendienteFinalizar(null)
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

  const iniciales = (i: TenantSummary) =>
    nombreInquilino(i).split(" ").map((p) => p.charAt(0)).slice(0, 2).join("").toUpperCase()

  return (
    <div className="space-y-5">
      {/* Header + resumen global */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inquilinos</h1>
          <p className="text-gray-600 mt-1 text-sm">Contratos activos y gestión de pagos</p>
        </div>
        {inquilinos.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <div className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600">
              {resumen.total} {resumen.total === 1 ? "contrato" : "contratos"}
            </div>
            {resumen.atrasados > 0 && (
              <div className="px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs font-medium text-red-600">
                {resumen.atrasados} con atrasos
              </div>
            )}
            {resumen.pendientes > 0 && (
              <div className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-medium text-amber-600">
                {resumen.pendientes} con pendientes
              </div>
            )}
            <div className="px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-xs font-medium text-green-600">
              {resumen.alDia} al día
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      ) : inquilinos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <Users className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Aún no tienes inquilinos</h3>
          <p className="text-gray-500 text-sm">Cuando aceptes una solicitud de alquiler, el contrato y sus cuotas aparecerán aquí</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[260px,1fr] xl:grid-cols-[300px,1fr] gap-4 items-start">
          {/* Lista de inquilinos (master) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden md:sticky md:top-4">
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, propiedad…"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400"
                />
              </div>
            </div>
            <div className="max-h-[320px] md:max-h-[560px] overflow-y-auto divide-y divide-gray-100">
              {filtrados.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">Sin resultados para "{busqueda}"</p>
              ) : (
                filtrados.map((i) => {
                  const sel = i.id === seleccionado
                  const alerta = i.estado === "activo" && i.cuotas_atrasadas > 0
                  return (
                    <button
                      key={i.id}
                      onClick={() => setSeleccionado(i.id)}
                      className={`w-full text-left px-3 py-3 flex items-center gap-3 transition-colors ${
                        sel ? "bg-blue-50 border-l-2 border-blue-600" : "hover:bg-gray-50 border-l-2 border-transparent"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                        alerta ? "bg-red-100 text-red-600" : sel ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {iniciales(i)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{nombreInquilino(i)}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {i.property?.titulo}
                          {i.habitacion && ` · 🛏️ ${i.habitacion.nombre}`}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {alerta ? (
                          <Badge className="bg-red-500 text-[10px] px-1.5">{i.cuotas_atrasadas} atraso{i.cuotas_atrasadas > 1 ? "s" : ""}</Badge>
                        ) : i.estado === "activo" && i.cuotas_pendientes > 0 ? (
                          <Badge className="bg-amber-500 text-[10px] px-1.5">{i.cuotas_pendientes} pend.</Badge>
                        ) : i.estado === "activo" ? (
                          <Badge className="bg-green-500 text-[10px] px-1.5">Al día</Badge>
                        ) : null}
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${sel ? "text-blue-600" : "text-gray-300"}`} />
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Detalle del inquilino seleccionado */}
          {actual && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Cabecera del contrato */}
              <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                    {actual.property?.imagenes && actual.property.imagenes.length > 0 ? (
                      <img
                        src={getImageUrl(actual.property.imagenes[0].image_url) || ""}
                        alt={actual.property?.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-gray-900 truncate">{nombreInquilino(actual)}</h2>
                      {getEstadoContratoBadge(actual.estado)}
                      {actual.tipo_contrato === "anticretico" && <Badge className="bg-indigo-600">Anticrético</Badge>}
                      {actual.habitacion && <Badge className="bg-purple-600">🛏️ {actual.habitacion.nombre}</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-0.5">{actual.property?.titulo}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(actual.fecha_inicio).toLocaleDateString("es-BO")} → {new Date(actual.fecha_fin).toLocaleDateString("es-BO")}
                      </span>
                      {actual.inquilino?.email && (
                        <a href={`mailto:${actual.inquilino.email}`} className="flex items-center gap-1 hover:text-blue-600">
                          <Mail className="w-3 h-3" />
                          <span className="max-w-[180px] truncate">{actual.inquilino.email}</span>
                        </a>
                      )}
                      {actual.inquilino?.telefono && (
                        <a href={`tel:${actual.inquilino.telefono}`} className="flex items-center gap-1 hover:text-blue-600">
                          <Phone className="w-3 h-3" />
                          {actual.inquilino.telefono}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={procesando === -1}
                    onClick={async () => {
                      setProcesando(-1)
                      try {
                        await apiService.abrirContratoPdf(actual.id, false)
                      } catch {
                        toast.error("No se pudo abrir el contrato")
                      } finally {
                        setProcesando(null)
                      }
                    }}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" />
                    Ver contrato
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={procesando === -1}
                    title="Descargar PDF"
                    onClick={async () => {
                      setProcesando(-1)
                      try {
                        await apiService.abrirContratoPdf(actual.id, true)
                      } catch {
                        toast.error("No se pudo descargar el contrato")
                      } finally {
                        setProcesando(null)
                      }
                    }}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  {actual.estado === "activo" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-600 hover:bg-orange-50"
                      disabled={procesando === actual.id}
                      onClick={() => setPendienteFinalizar(actual)}
                    >
                      {procesando === actual.id ? (
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

              {/* Stats del contrato */}
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
                <div className="text-center py-3">
                  <p className="text-xl font-bold text-green-600">{actual.cuotas_pagadas}</p>
                  <p className="text-[11px] text-gray-500">Pagadas</p>
                </div>
                <div className="text-center py-3">
                  <p className="text-xl font-bold text-amber-500">{actual.cuotas_pendientes}</p>
                  <p className="text-[11px] text-gray-500">Pendientes</p>
                </div>
                <div className="text-center py-3">
                  <p className="text-xl font-bold text-red-600">{actual.cuotas_atrasadas}</p>
                  <p className="text-[11px] text-gray-500">Atrasadas</p>
                </div>
                <div className="text-center py-3">
                  <p className="text-xl font-bold text-gray-900">
                    {actual.tipo_contrato === "anticretico"
                      ? `Bs. ${(actual.pagos.find((p) => p.tipo === "anticres")?.monto || 0).toLocaleString()}`
                      : `Bs. ${actual.monto_mensual.toLocaleString()}`}
                    <span className="text-xs font-normal text-gray-400">{actual.tipo_contrato === "anticretico" ? " anticrés" : "/mes"}</span>
                  </p>
                  <p className="text-[11px] text-gray-500">Bs. {actual.total_pagado.toLocaleString()} recibido</p>
                </div>
              </div>

              {/* Pagos */}
              <div>
                <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1.5">
                    <ReceiptText className="w-3.5 h-3.5" />
                    Historial de pagos
                  </h3>
                  <span className="text-[11px] text-gray-400">{actual.pagos.length} registros</span>
                </div>
                {actual.pagos.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-gray-500 text-center">Sin pagos registrados</p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {[...actual.pagos]
                      .sort((a, b) => (b.anio - a.anio) || (b.mes_correspondiente - a.mes_correspondiente))
                      .map((pago) => {
                        const pendienteConComprobante = pago.estado !== "pagado" && pago.comprobante_url
                        return (
                          <div
                            key={pago.id}
                            className={`px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                              pendienteConComprobante ? "bg-amber-50/60" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Bloque de periodo compacto */}
                              <div className={`w-11 shrink-0 text-center rounded-md border py-1 ${
                                pago.estado === "atrasado" ? "border-red-200 bg-red-50" :
                                pago.estado === "pagado" ? "border-green-200 bg-green-50" :
                                "border-amber-200 bg-amber-50"
                              }`}>
                                <p className={`text-[10px] uppercase font-semibold leading-none ${
                                  pago.estado === "atrasado" ? "text-red-600" :
                                  pago.estado === "pagado" ? "text-green-600" : "text-amber-600"
                                }`}>
                                  {pago.tipo === "cuota" ? meses[pago.mes_correspondiente - 1] || "?" : "extra"}
                                </p>
                                <p className={`text-sm font-bold leading-tight ${
                                  pago.estado === "atrasado" ? "text-red-700" :
                                  pago.estado === "pagado" ? "text-green-700" : "text-amber-700"
                                }`}>
                                  {pago.tipo === "cuota" ? pago.anio.toString().slice(2) : "•"}
                                </p>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium text-gray-900">{periodoPago(pago)}</span>
                                  {getEstadoBadge(pago.estado)}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {pago.metodo_pago || "Sin método registrado"}
                                  {pago.fecha_pago && ` · ${new Date(pago.fecha_pago).toLocaleDateString("es-BO")}`}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:justify-end flex-wrap">
                              <span className="font-semibold text-gray-900 text-sm mr-1">
                                Bs. {pago.monto.toLocaleString()}
                              </span>

                              {pago.comprobante_url && (
                                <Button variant="outline" size="sm" asChild className="h-8">
                                  <a
                                    href={getImageUrl(pago.comprobante_url) || pago.comprobante_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Ver comprobante"
                                  >
                                    <Search className="w-3.5 h-3.5 mr-1" />
                                    Ver
                                  </a>
                                </Button>
                              )}

                              {pendienteConComprobante && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 h-8"
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
                                    className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                                    disabled={procesando === pago.id}
                                    onClick={() => rechazarPago(pago)}
                                    title="Rechazar comprobante"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )}

                              {!pago.comprobante_url && pago.estado !== "pagado" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-700 border-green-300 hover:bg-green-50 h-8"
                                  disabled={procesando === pago.id}
                                  onClick={() => confirmarPago(pago)}
                                >
                                  <FileText className="w-3.5 h-3.5 mr-1" />
                                  Marcar pagado
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Confirmación: finalizar contrato */}
      <AlertDialog open={!!pendienteFinalizar} onOpenChange={(open) => !open && setPendienteFinalizar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Finalizar el contrato de {pendienteFinalizar ? nombreInquilino(pendienteFinalizar) : ""}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se registrará la devolución del depósito/anticrés y el inquilino deberá confirmar su recepción.
              La propiedad volverá a estar disponible para nuevos alquileres. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction className="bg-orange-600 hover:bg-orange-700" onClick={confirmarFinalizar}>
              Sí, finalizar contrato
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
