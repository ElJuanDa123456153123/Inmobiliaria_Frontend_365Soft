"use client"

import { useState, useEffect, useCallback } from "react"
import { BellRing, Check, X, Calendar, Phone, Loader2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiService, RentalRequest } from "@/lib/services/api"
import { getImageUrl } from "@/lib/utils"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function SolicitudesPanelPage() {
  const [solicitudes, setSolicitudes] = useState<RentalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<"pendiente" | "todas">("pendiente")

  // Modal de aceptar
  const [solicitudAAceptar, setSolicitudAAceptar] = useState<RentalRequest | null>(null)
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [montoMensual, setMontoMensual] = useState("")
  const [aceptando, setAceptando] = useState(false)
  const [rechazando, setRechazando] = useState<number | null>(null)

  const fetchSolicitudes = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiService.getSolicitudesRecibidas(filtro === "pendiente" ? "pendiente" : undefined)
      setSolicitudes(data.solicitudes || [])
    } catch (error) {
      console.error("Error cargando solicitudes:", error)
      toast.error("Error al cargar las solicitudes")
    } finally {
      setLoading(false)
    }
  }, [filtro])

  useEffect(() => {
    fetchSolicitudes()
  }, [fetchSolicitudes])

  const abrirAceptar = (solicitud: RentalRequest) => {
    // Si la solicitud es por una habitación, usar su precio (o el general como fallback)
    const precio = solicitud.habitacion?.precio != null && solicitud.habitacion.precio > 0
      ? solicitud.habitacion.precio
      : (solicitud.property?.precio || 0)
    setSolicitudAAceptar(solicitud)
    setMontoMensual(precio > 0 ? String(precio) : "")
    // Fechas por defecto: de hoy a 1 año (o según duración publicada en anticrético)
    const hoy = new Date()
    const fin = new Date(hoy)
    const duracion = solicitud.property?.duracion_contrato?.toLowerCase() || ""
    if (solicitud.property?.tipo_operacion === "anticretico" && duracion) {
      const anios = duracion.match(/\d+/)
      fin.setFullYear(fin.getFullYear() + (anios ? parseInt(anios[0]) : 1))
    } else {
      fin.setFullYear(fin.getFullYear() + 1)
    }
    setFechaInicio(hoy.toISOString().slice(0, 10))
    setFechaFin(fin.toISOString().slice(0, 10))
  }

  const handleAceptar = async () => {
    if (!solicitudAAceptar) return
    if (!fechaInicio || !fechaFin) {
      toast.error("Selecciona las fechas del contrato")
      return
    }
    const esAnticretico = solicitudAAceptar.property?.tipo_operacion === "anticretico"
    const monto = parseFloat(montoMensual)
    if (!monto || monto <= 0) {
      toast.error(esAnticretico ? "Ingresa el monto del anticrés" : "Ingresa un monto mensual válido")
      return
    }
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      toast.error("La fecha de fin debe ser posterior a la de inicio")
      return
    }

    setAceptando(true)
    try {
      const res = await apiService.aceptarSolicitud(solicitudAAceptar.id, {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        ...(esAnticretico ? { monto_anticres: monto } : { monto_mensual: monto }),
      })
      if (esAnticretico) {
        toast.success(`Contrato anticrético creado. Anticrés: Bs. ${res.monto_anticres?.toLocaleString()}`)
      } else {
        const deposito = res.monto_deposito > 0 ? ` Se registró un depósito de Bs. ${res.monto_deposito.toLocaleString()}.` : ""
        toast.success(`Contrato creado con ${res.cuotas_generadas} cuotas.${deposito}`)
      }
      setSolicitudAAceptar(null)
      fetchSolicitudes()
    } catch (error) {
      console.error("Error aceptando solicitud:", error)
      toast.error(error instanceof Error ? error.message : "Error al aceptar la solicitud")
    } finally {
      setAceptando(false)
    }
  }

  const handleRechazar = async (id: number) => {
    setRechazando(id)
    try {
      await apiService.rechazarSolicitud(id)
      toast.success("Solicitud rechazada")
      fetchSolicitudes()
    } catch (error) {
      console.error("Error rechazando solicitud:", error)
      toast.error("Error al rechazar la solicitud")
    } finally {
      setRechazando(null)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Badge className="bg-yellow-500">Pendiente</Badge>
      case "aceptada":
        return <Badge className="bg-green-500">Aceptada</Badge>
      case "rechazada":
        return <Badge className="bg-red-500">Rechazada</Badge>
      case "cancelada":
        return <Badge className="bg-gray-500">Cancelada</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BellRing className="h-8 w-8 text-blue-600" />
            Solicitudes de Alquiler
          </h1>
          <p className="text-gray-600 mt-1">Personas interesadas en alquilar tus propiedades</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filtro === "pendiente" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltro("pendiente")}
          >
            Pendientes
          </Button>
          <Button
            variant={filtro === "todas" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltro("todas")}
          >
            Todas
          </Button>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <BellRing className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filtro === "pendiente" ? "No hay solicitudes pendientes" : "No hay solicitudes"}
          </h3>
          <p className="text-gray-600">Cuando alguien quiera alquilar una de tus propiedades, aparecerá aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((solicitud) => (
            <div key={solicitud.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 flex flex-col lg:flex-row gap-6">
                {/* Imagen de la propiedad */}
                <div className="w-full lg:w-48 h-32 lg:h-auto rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {solicitud.property?.imagenes && solicitud.property.imagenes.length > 0 ? (
                    <img
                      src={getImageUrl(solicitud.property.imagenes[0].image_url) || ""}
                      alt={solicitud.property.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="text-sm text-gray-500">
                        {solicitud.property?.tipo_operacion === 'alquiler' ? 'Alquiler' : ''} · {solicitud.property?.zona}
                      </p>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {solicitud.property?.titulo}
                      </h3>
                      {solicitud.habitacion && (
                        <p className="text-xs font-medium text-indigo-600 mt-0.5">
                          🛏️ Habitación: {solicitud.habitacion.nombre}
                          {solicitud.habitacion.precio != null && solicitud.habitacion.precio > 0 && (
                            <span className="text-gray-400"> · Bs. {solicitud.habitacion.precio.toLocaleString()}/mes</span>
                          )}
                        </p>
                      )}
                    </div>
                    {getEstadoBadge(solicitud.estado)}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
                    <div>
                      <p className="text-gray-500">Interesado</p>
                      <p className="font-medium text-gray-900">
                        {solicitud.inquilino?.nombre} {solicitud.inquilino?.apellido}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> Teléfono
                      </p>
                      <p className="font-medium text-gray-900">
                        {solicitud.telefono_contacto || solicitud.inquilino?.telefono || "-"}
                      </p>
                    </div>
                    {solicitud.mensaje && (
                      <div className="sm:col-span-2">
                        <p className="text-gray-500">Mensaje</p>
                        <p className="text-gray-800 bg-gray-50 rounded-lg p-3 mt-1">{solicitud.mensaje}</p>
                      </div>
                    )}
                    <div className="sm:col-span-2 text-xs text-gray-400">
                      Enviada el {new Date(solicitud.created_at).toLocaleDateString("es-ES", {
                        year: "numeric", month: "long", day: "numeric"
                      })}
                      {solicitud.property?.deposito && (
                        <span> · Depósito publicado: <span className="capitalize">{solicitud.property.deposito}</span></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                {solicitud.estado === "pendiente" && (
                  <div className="flex lg:flex-col gap-2 justify-end">
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => abrirAceptar(solicitud)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aceptar
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      disabled={rechazando === solicitud.id}
                      onClick={() => handleRechazar(solicitud.id)}
                    >
                      {rechazando === solicitud.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Rechazar
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de aceptar solicitud */}
      {solicitudAAceptar && (() => {
        const esAnticretico = solicitudAAceptar.property?.tipo_operacion === "anticretico"
        return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {esAnticretico ? "Crear contrato anticrético" : "Crear contrato de alquiler"}
                </h3>
                <button
                  onClick={() => setSolicitudAAceptar(null)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Inquilino: <strong>
                  {solicitudAAceptar.inquilino?.nombre} {solicitudAAceptar.inquilino?.apellido}
                </strong>
                <br />
                Propiedad: <strong>{solicitudAAceptar.property?.titulo}</strong>
              {solicitudAAceptar.habitacion && (
                <span className="block">
                  Habitación: <strong>{solicitudAAceptar.habitacion.nombre}</strong>
                  {solicitudAAceptar.habitacion.precio != null && solicitudAAceptar.habitacion.precio > 0 && (
                    <span className="text-gray-400"> (precio publicado: Bs. {solicitudAAceptar.habitacion.precio.toLocaleString()}/mes)</span>
                  )}
                </span>
              )}
                {esAnticretico ? (
                  solicitudAAceptar.property?.duracion_contrato && (
                    <span className="block text-xs mt-1">
                      Duración publicada: <span className="capitalize font-medium">{solicitudAAceptar.property.duracion_contrato}</span>
                    </span>
                  )
                ) : (
                  solicitudAAceptar.property?.deposito && (
                    <span className="block text-xs mt-1">
                      La publicación indica depósito de <span className="capitalize font-medium">{solicitudAAceptar.property.deposito}</span> — se cobrará automáticamente con la primera cuota
                    </span>
                  )
                )}
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-3.5 h-3.5 inline mr-1" />
                      Inicio *
                    </label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-3.5 h-3.5 inline mr-1" />
                      Fin *
                    </label>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {esAnticretico ? "Monto del anticrés (Bs) *" : "Renta mensual (Bs) *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={montoMensual}
                    onChange={(e) => setMontoMensual(e.target.value)}
                    placeholder={esAnticretico ? "10000" : "2500"}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {esAnticretico && (
                    <p className="text-xs text-gray-500 mt-1">
                      El anticrés es el monto que entrega el inquilino por adelantado. No hay cuotas mensuales; se devuelve al finalizar el contrato.
                    </p>
                  )}
                </div>

                <div className={cn("bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800")}>
                  {esAnticretico ? (
                    <>Al aceptar se creará el contrato anticrético con un pago único de anticrés (sin cuotas mensuales).
                    La propiedad quedará marcada como <strong>Alquilada</strong> y el resto de solicitudes pendientes se cancelarán.</>
                  ) : (
                    <>Al aceptar se creará el contrato y se generarán las cuotas mensuales automáticamente.
                    La propiedad quedará marcada como <strong>Alquilada</strong> y el resto de solicitudes pendientes se cancelarán.</>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSolicitudAAceptar(null)}
                    disabled={aceptando}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAceptar}
                    disabled={aceptando}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {aceptando ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Aceptar y crear contrato"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )
      })()}
    </div>
  )
}
