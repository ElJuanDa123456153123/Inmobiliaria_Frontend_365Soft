"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  DollarSign, Loader2, Upload, X, ImageIcon, ExternalLink,
  CircleCheck, AlertCircle, Wallet, QrCode, Banknote, ArrowLeftRight, Search,
  Building, User, Mail, Phone, ChevronRight, Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiService, RentPayment } from "@/lib/services/api"
import { getImageUrl } from "@/lib/utils"
import { toast } from "sonner"

const MESES_COMPLETOS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
const MESES_ABBR = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

const METODOS = [
  { value: "qr", label: "QR", icono: QrCode },
  { value: "transferencia", label: "Transferencia", icono: ArrowLeftRight },
  { value: "efectivo", label: "Efectivo", icono: Banknote },
]

const estiloPago = (estado: string) =>
  estado === "atrasado"
    ? { bloque: "border-red-200 bg-red-50", texto: "text-red-700", label: "text-red-600" }
    : estado === "pagado"
      ? { bloque: "border-green-200 bg-green-50", texto: "text-green-700", label: "text-green-600" }
      : { bloque: "border-amber-200 bg-amber-50", texto: "text-amber-700", label: "text-amber-600" }

// Agrupación de pagos por contrato/propiedad
interface GrupoContrato {
  contractId: number
  propiedad: string
  imagen?: string
  vendedorNombre: string
  vendedorEmail?: string
  vendedorTelefono?: string
  pagos: RentPayment[]
}

export default function MisContratosPagosPage() {
  const [payments, setPayments] = useState<RentPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [seleccionado, setSeleccionado] = useState<number | null>(null)

  // Modal de pago
  const [pagoAPagar, setPagoAPagar] = useState<RentPayment | null>(null)
  const [metodoPago, setMetodoPago] = useState("qr")
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [subiendo, setSubiendo] = useState(false)

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiService.getPaymentHistory("", "inquilino")
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

  // Solo pagos propios (excluir devoluciones de la vista principal)
  const misPagos = useMemo(
    () => payments.filter((p) => p.tipo !== "devolucion_deposito" && p.tipo !== "devolucion_anticres"),
    [payments]
  )

  // Agrupar por contrato
  const grupos = useMemo<GrupoContrato[]>(() => {
    const mapa = new Map<number, GrupoContrato>()
    for (const p of misPagos) {
      const contractId = p.contract_id || p.contract?.id || 0
      if (!mapa.has(contractId)) {
        const vendedor = p.contract?.vendedor ?? p.vendedor
        mapa.set(contractId, {
          contractId,
          propiedad: p.contract?.property?.titulo || "Propiedad",
          imagen: p.contract?.property?.imagenes?.[0]?.image_url,
          vendedorNombre: [vendedor?.nombre, vendedor?.apellido].filter(Boolean).join(" ") || "Propietario",
          vendedorEmail: vendedor?.email,
          vendedorTelefono: vendedor?.telefono,
          pagos: [],
        })
      }
      mapa.get(contractId)!.pagos.push(p)
    }
    // Prioridad: atrasados → pendientes → al día
    const prioridad = (g: GrupoContrato) => {
      const atrasados = g.pagos.filter((p) => p.estado === "atrasado").length
      const pendientes = g.pagos.filter((p) => p.estado === "pendiente").length
      if (atrasados > 0) return 0
      if (pendientes > 0) return 1
      return 2
    }
    return [...mapa.values()].sort((a, b) => prioridad(a) - prioridad(b))
  }, [misPagos])

  // Lista filtrada por búsqueda
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return grupos
    return grupos.filter((g) =>
      g.propiedad.toLowerCase().includes(q) || g.vendedorNombre.toLowerCase().includes(q)
    )
  }, [grupos, busqueda])

  // Mantener selección válida; por defecto el primero por prioridad
  useEffect(() => {
    setSeleccionado((prev) =>
      prev && filtrados.some((g) => g.contractId === prev)
        ? prev
        : filtrados.length > 0
          ? filtrados[0].contractId
          : null
    )
  }, [filtrados])

  const actual = filtrados.find((g) => g.contractId === seleccionado) || null

  const resumen = useMemo(() => {
    if (!actual) return null
    const pend = actual.pagos.filter((p) => p.estado === "pendiente")
    const atr = actual.pagos.filter((p) => p.estado === "atrasado")
    return {
      porPagar: pend.length + atr.length,
      montoPorPagar: [...pend, ...atr].reduce((a, p) => a + p.monto, 0),
      montoAtrasado: atr.reduce((a, p) => a + p.monto, 0),
      pagadas: actual.pagos.filter((p) => p.estado === "pagado").length,
    }
  }, [actual])

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

  const periodoPago = (pago: RentPayment) => {
    if (pago.tipo === "deposito") return "Depósito de garantía"
    if (pago.tipo === "devolucion_deposito") return "Devolución de depósito"
    if (pago.tipo === "anticres") return "Pago de anticrés"
    if (pago.tipo === "devolucion_anticres") return "Devolución de anticrés"
    return `${MESES_COMPLETOS[pago.mes_correspondiente - 1] || "?"} ${pago.anio}`
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
      const upload = await apiService.uploadImage(comprobante)
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

  const vendedorDelPago = pagoAPagar?.contract?.vendedor ?? pagoAPagar?.vendedor
  const vendedorQR = vendedorDelPago?.qr_pago_url || ""
  const vendedorNombre = [vendedorDelPago?.nombre, vendedorDelPago?.apellido].filter(Boolean).join(" ") || "el propietario"

  // QRs del propietario por plataforma (lista nueva) o el QR único viejo
  const qrsVendedor = useMemo(() => {
    const lista = (vendedorDelPago?.qrs_cobro || []).filter((q) => q.url)
    if (lista.length > 0) return lista
    return vendedorQR ? [{ plataforma: "QR", url: vendedorQR }] : []
  }, [vendedorDelPago, vendedorQR])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Pagos</h1>
        <p className="text-gray-600 mt-1 text-sm">Elige una propiedad y paga con QR o sube tu comprobante</p>
      </div>

      {grupos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <DollarSign className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No hay pagos registrados</h3>
          <p className="text-gray-500 text-sm">Cuando tengas un contrato de alquiler activo, tus cuotas se mostrarán aquí</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-4 items-start">
          {/* Lista de propiedades con contrato */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden md:sticky md:top-4">
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar propiedad…"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-400"
                />
              </div>
            </div>
            <div className="max-h-[340px] md:max-h-[560px] overflow-y-auto divide-y divide-gray-100">
              {filtrados.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">Sin resultados para "{busqueda}"</p>
              ) : (
                filtrados.map((g) => {
                  const sel = g.contractId === seleccionado
                  const atrasados = g.pagos.filter((p) => p.estado === "atrasado").length
                  const pendientes = g.pagos.filter((p) => p.estado === "pendiente").length
                  return (
                    <button
                      key={g.contractId}
                      onClick={() => setSeleccionado(g.contractId)}
                      className={`w-full text-left px-3 py-3 flex items-center gap-3 transition-colors ${
                        sel ? "bg-green-50 border-l-2 border-green-600" : "hover:bg-gray-50 border-l-2 border-transparent"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                        {g.imagen ? (
                          <img src={getImageUrl(g.imagen) || g.imagen} alt={g.propiedad} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{g.propiedad}</p>
                        <p className="text-xs text-gray-500 truncate">{g.vendedorNombre}</p>
                      </div>
                      <div className="shrink-0">
                        {atrasados > 0 ? (
                          <Badge className="bg-red-500 text-[10px] px-1.5">{atrasados} atraso{atrasados > 1 ? "s" : ""}</Badge>
                        ) : pendientes > 0 ? (
                          <Badge className="bg-amber-500 text-[10px] px-1.5">{pendientes} pend.</Badge>
                        ) : (
                          <Badge className="bg-green-500 text-[10px] px-1.5">Al día</Badge>
                        )}
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${sel ? "text-green-600" : "text-gray-300"}`} />
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Detalle: pagos de la propiedad seleccionada */}
          {actual && resumen && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Cabecera */}
              <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                    {actual.imagen ? (
                      <img src={getImageUrl(actual.imagen) || actual.imagen} alt={actual.propiedad} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-900 truncate">{actual.propiedad}</h2>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {actual.vendedorNombre}
                      </span>
                      {actual.vendedorEmail && (
                        <a href={`mailto:${actual.vendedorEmail}`} className="flex items-center gap-1 hover:text-blue-600">
                          <Mail className="w-3 h-3" />
                          <span className="max-w-[160px] truncate">{actual.vendedorEmail}</span>
                        </a>
                      )}
                      {actual.vendedorTelefono && (
                        <a href={`tel:${actual.vendedorTelefono}`} className="flex items-center gap-1 hover:text-blue-600">
                          <Phone className="w-3 h-3" />
                          {actual.vendedorTelefono}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                <div className="text-center py-3">
                  <p className="text-xl font-bold text-amber-500">Bs. {resumen.montoPorPagar.toLocaleString()}</p>
                  <p className="text-[11px] text-gray-500">Por pagar ({resumen.porPagar})</p>
                </div>
                <div className="text-center py-3">
                  <p className={`text-xl font-bold ${resumen.montoAtrasado > 0 ? "text-red-600" : "text-gray-300"}`}>
                    Bs. {resumen.montoAtrasado.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-gray-500">En atraso</p>
                </div>
                <div className="text-center py-3">
                  <p className="text-xl font-bold text-green-600">{resumen.pagadas}</p>
                  <p className="text-[11px] text-gray-500">Pagadas</p>
                </div>
              </div>

              {/* Lista de pagos */}
              <div className="divide-y divide-gray-50">
                {[...actual.pagos]
                  .sort((a, b) => {
                    const orden = { atrasado: 0, pendiente: 1, pagado: 2 } as Record<string, number>
                    return (orden[a.estado] ?? 3) - (orden[b.estado] ?? 3) || b.anio - a.anio || b.mes_correspondiente - a.mes_correspondiente
                  })
                  .map((payment) => {
                    const est = estiloPago(payment.estado)
                    const esCuota = payment.tipo === "cuota"
                    const pendienteConComprobante = payment.estado !== "pagado" && payment.comprobante_url
                    return (
                      <div
                        key={payment.id}
                        className={`px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          payment.estado !== "pagado" ? "bg-amber-50/40" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-12 shrink-0 text-center rounded-md border py-1 ${est.bloque}`}>
                            <p className={`text-[10px] uppercase font-semibold leading-none ${est.label}`}>
                              {esCuota ? MESES_ABBR[payment.mes_correspondiente - 1] || "?" : "extra"}
                            </p>
                            <p className={`text-sm font-bold leading-tight ${est.texto}`}>
                              {esCuota ? payment.anio.toString().slice(2) : "•"}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-gray-900">{periodoPago(payment)}</span>
                              {getEstadoBadge(payment.estado)}
                              {pendienteConComprobante && (
                                <span className="text-[10px] text-gray-400 italic">esperando confirmación</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Vence: {new Date(payment.fecha_pago).toLocaleDateString("es-BO")}
                              {payment.metodo_pago && ` · Pagaste con ${payment.metodo_pago}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:justify-end flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm mr-1">
                            Bs. {payment.monto.toLocaleString()}
                          </span>

                          {payment.comprobante_url && (
                            <Button variant="outline" size="sm" asChild className="h-8">
                              <a
                                href={getImageUrl(payment.comprobante_url) || payment.comprobante_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Ver mi comprobante"
                              >
                                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                Comprobante
                              </a>
                            </Button>
                          )}

                          {payment.estado !== "pagado" && (
                            <Button
                              className="bg-green-600 hover:bg-green-700 h-8"
                              size="sm"
                              onClick={() => {
                                setPagoAPagar(payment)
                                setComprobante(null)
                                setMetodoPago("qr")
                              }}
                            >
                              <Wallet className="w-3.5 h-3.5 mr-1" />
                              {payment.comprobante_url ? "Reenviar" : "Pagar"}
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de pago */}
      {pagoAPagar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[92vh] overflow-y-auto">
            <div className="p-5">
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
                  <span className="block text-xs">Pagar a: {vendedorNombre}</span>
                </p>
              </div>

              <form onSubmit={handlePagar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forma de pago *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {METODOS.map((opt) => {
                      const Icono = opt.icono
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setMetodoPago(opt.value)}
                          className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                            metodoPago === opt.value
                              ? "bg-green-50 border-green-500 text-green-700 shadow-sm"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <Icono className="w-4 h-4" />
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* QRs del propietario */}
                {metodoPago === "qr" && (
                  qrsVendedor.length > 0 ? (
                    <div className="rounded-xl border-2 border-green-200 bg-green-50/50 p-4 text-center">
                      <p className="text-xs font-medium text-green-700 mb-3">
                        Escanea el QR de tu plataforma preferida y paga Bs. {pagoAPagar.monto.toLocaleString()}
                      </p>
                      <div className={`grid gap-3 ${qrsVendedor.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                        {qrsVendedor.map((qr, i) => (
                          <div key={i} className="bg-white rounded-lg p-2 shadow-sm">
                            <p className="text-[11px] font-semibold text-gray-700 mb-1">{qr.plataforma}</p>
                            <img
                              src={getImageUrl(qr.url) || qr.url}
                              alt={`QR de ${qr.plataforma}`}
                              className="w-full max-h-44 object-contain"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-2">
                        Verifica que el titular sea {vendedorNombre} antes de pagar
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      {vendedorNombre} aún no configuró sus QR. Coordina el pago directamente y sube tu comprobante.
                    </p>
                  )
                )}

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
