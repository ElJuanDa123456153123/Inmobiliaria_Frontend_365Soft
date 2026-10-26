"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  Calendar,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CalendarX2,
  Mail,
  Phone,
  MessageSquareText,
  Inbox,
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
import { toast } from "sonner"
import Link from "next/link"
import { DisponibilidadVisitasCard } from "@/components/panel/disponibilidad-visitas"
import { parseFechaVisita } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface Visit {
  id: number
  fecha_visita: string
  estado: string
  notas?: string
  created_at: string
  inquilino: {
    id: number
    nombre: string
    email: string
    telefono?: string
  }
  vendedor?: {
    id: number
    nombre: string
    email: string
  }
  property: {
    id: number
    titulo: string
    zona: string
  }
}

type TabType = "mias" | "recibidas"

// Fecha válida = la visita tiene horario real asignado (propuesto o confirmado)
const tieneFechaValida = (v: Visit) =>
  v.fecha_visita && !v.fecha_visita.startsWith("0001")

const esProxima = (v: Visit) => v.estado === "pendiente" || v.estado === "confirmada"

const tsOrden = (v: Visit) =>
  tieneFechaValida(v)
    ? parseFechaVisita(v.fecha_visita).getTime()
    : new Date(v.created_at).getTime()

const DIAS_ABBR = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const MESES_ABBR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]

// Colores por estado para el bloque de fecha y acentos
const estiloEstado: Record<string, string> = {
  pendiente: "bg-amber-50 border-amber-300 text-amber-700",
  confirmada: "bg-blue-50 border-blue-300 text-blue-700",
  completada: "bg-green-50 border-green-300 text-green-700",
  cancelada: "bg-gray-50 border-gray-300 text-gray-500",
}

const badgeEstado: Record<string, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-amber-500" },
  confirmada: { label: "Confirmada", className: "bg-blue-600" },
  completada: { label: "Realizada", className: "bg-green-600" },
  cancelada: { label: "Cancelada", className: "bg-gray-400" },
}

export default function PanelVisitasPage() {
  const searchParams = useSearchParams()
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEstado, setFilterEstado] = useState<string>("")
  const [activeTab, setActiveTab] = useState<TabType>("recibidas")
  const [accionEnCurso, setAccionEnCurso] = useState<number | null>(null)

  // Modal de reprogramar / asignar fecha (vendedor) — usa la propia agenda
  const [modalFechaAbierto, setModalFechaAbierto] = useState(false)
  const [visitaAReprogramar, setVisitaAReprogramar] = useState<Visit | null>(null)
  const [agendaModal, setAgendaModal] = useState<{
    duracion_min: number
    horarios: Record<string, { desde: string; hasta: string }[]>
    ocupadas: string[]
  } | null>(null)
  const [fechaModal, setFechaModal] = useState("")
  const [slotModal, setSlotModal] = useState("")
  const [guardandoFecha, setGuardandoFecha] = useState(false)

  // Configuración de disponibilidad (horarios en que el vendedor recibe visitas)
  const [mostrarDisponibilidad, setMostrarDisponibilidad] = useState(false)

  // Confirmación antes de ejecutar acciones críticas
  const [pendienteConfirmar, setPendienteConfirmar] = useState<{
    tipo: "confirmar" | "rechazar" | "cancelar" | "realizada"
    visit: Visit
  } | null>(null)

  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam === "recibidas" || tabParam === "mias") {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  useEffect(() => {
    fetchVisits()
  }, [activeTab])

  const fetchVisits = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const endpoint = activeTab === "mias" ? "my" : "received"
      const url = `${API_URL}/api/panel/visits/${endpoint}`

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setVisits(data.visitas || [])
      }
    } catch (error) {
      console.error("Error fetching visits:", error)
    } finally {
      setLoading(false)
    }
  }

  // Cambiar estado simple (cancelar, completar)
  const updateVisitStatus = async (visitId: number, newStatus: string) => {
    try {
      setAccionEnCurso(visitId)
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/panel/visits/${visitId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ estado: newStatus })
      })

      if (response.ok) {
        const mensajes: Record<string, string> = {
          cancelada: "Visita cancelada",
          completada: "Visita marcada como realizada",
          confirmada: "Visita confirmada",
        }
        toast.success(mensajes[newStatus] || "Visita actualizada")
        fetchVisits()
      } else {
        const errData = await response.json().catch(() => ({ error: "" }))
        toast.error(errData.error || "Error al actualizar visita")
      }
    } catch (error) {
      console.error("Error updating visit:", error)
      toast.error("Error al actualizar visita")
    } finally {
      setAccionEnCurso(null)
    }
  }

  // Confirmar la visita con la fecha propuesta por el cliente (1 clic).
  // Si la visita no tiene fecha (solicitudes antiguas), abre el modal para asignarla.
  const handleConfirmar = (visit: Visit) => {
    if (!tieneFechaValida(visit)) {
      abrirModalFecha(visit, "confirmar")
      return
    }
    confirmarConFecha(visit.id, "")
  }

  const confirmarConFecha = async (visitId: number, fecha: string) => {
    try {
      setAccionEnCurso(visitId)
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/panel/visits/${visitId}/confirm`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(fecha ? { fecha_visita: fecha } : {})
      })

      if (response.ok) {
        toast.success("Visita confirmada. Se notificó al interesado")
        fetchVisits()
      } else {
        const errData = await response.json().catch(() => ({ error: "" }))
        toast.error(errData.error || "Error al confirmar visita")
      }
    } catch (error) {
      console.error("Error confirmando visita:", error)
      toast.error("Error al confirmar visita")
    } finally {
      setAccionEnCurso(null)
    }
  }

  // Abrir modal para reprogramar (o asignar fecha a solicitudes sin fecha).
  // Carga la agenda del vendedor de esa propiedad: solo se puede elegir
  // entre los días y horarios configurados.
  const abrirModalFecha = async (visit: Visit, modo: "reprogramar" | "confirmar") => {
    setVisitaAReprogramar({ ...visit, estado: modo })
    setFechaModal("")
    setSlotModal("")
    setAgendaModal(null)
    setModalFechaAbierto(true)

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/panel/visits/availability/${visit.property.id}`, {
        headers: { "Authorization": `Bearer ${token}` },
        cache: "no-store",
      })
      if (res.ok) {
        const data = await res.json()
        setAgendaModal({
          duracion_min: data.duracion_min || 60,
          horarios: data.horarios || {},
          ocupadas: data.ocupadas || [],
        })
        // Prefill: la fecha actual de la visita (para reprogramar)
        if (tieneFechaValida(visit)) {
          const f = parseFechaVisita(visit.fecha_visita)
          const iso = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`
          setFechaModal(iso)
          setSlotModal(f.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", hour12: false }))
        }
      }
    } catch {
      // Sin agenda: se muestra aviso en el modal
    }
  }

  // Días próximos que el vendedor atiende (para el modal)
  const fechasModal = (): Date[] => {
    if (!agendaModal) return []
    const dias = Object.keys(agendaModal.horarios)
      .filter((d) => (agendaModal.horarios[d]?.length ?? 0) > 0)
      .map(Number)
    const fechas: Date[] = []
    const hoy = new Date()
    for (let i = 1; fechas.length < 14 && i <= 60; i++) {
      const d = new Date(hoy)
      d.setDate(hoy.getDate() + i)
      if (dias.includes(d.getDay())) fechas.push(d)
    }
    return fechas
  }

  // Slots libres del día elegido (franjas configuradas, sin ocupados ni pasados)
  const slotsModal = (): string[] => {
    if (!agendaModal || !fechaModal) return []
    const duracion = agendaModal.duracion_min || 60
    const [y, m, d] = fechaModal.split("-").map(Number)
    const diaSemana = new Date(y, m - 1, d).getDay()
    const franjas = agendaModal.horarios[String(diaSemana)] || []
    const ahora = new Date()
    const esHoy = fechaModal === `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`
    const slots: string[] = []
    for (const rango of franjas) {
      const [hDesde, mDesde] = rango.desde.split(":").map(Number)
      const [hHasta, mHasta] = rango.hasta.split(":").map(Number)
      let minutos = hDesde * 60 + mDesde
      const fin = hHasta * 60 + mHasta
      while (minutos + duracion <= fin) {
        const hh = String(Math.floor(minutos / 60)).padStart(2, "0")
        const mm = String(minutos % 60).padStart(2, "0")
        const slot = `${hh}:${mm}`
        const ocupado = agendaModal.ocupadas.some((o) => o === `${fechaModal} ${slot}`)
        const pasado = esHoy && minutos <= ahora.getHours() * 60 + ahora.getMinutes()
        if (!ocupado && !pasado) slots.push(slot)
        minutos += duracion
      }
    }
    return slots
  }

  const cerrarModalFecha = () => {
    setModalFechaAbierto(false)
    setVisitaAReprogramar(null)
  }

  // Ejecutar la acción que el usuario confirmó en el modal
  const ejecutarPendiente = () => {
    if (!pendienteConfirmar) return
    const { tipo, visit } = pendienteConfirmar
    if (tipo === "confirmar") handleConfirmar(visit)
    else if (tipo === "realizada") updateVisitStatus(visit.id, "completada")
    else updateVisitStatus(visit.id, "cancelada")
    setPendienteConfirmar(null)
  }

  // Textos del modal de confirmación según la acción
  const configConfirmacion = () => {
    if (!pendienteConfirmar) return null
    const { tipo, visit } = pendienteConfirmar
    const nombre = (activeTab === "mias" ? visit.vendedor?.nombre : visit.inquilino?.nombre) || "el interesado"
    const fechaTxt = tieneFechaValida(visit)
      ? parseFechaVisita(visit.fecha_visita).toLocaleString("es-BO", {
          weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
        })
      : "sin fecha asignada"

    switch (tipo) {
      case "confirmar":
        return {
          titulo: "¿Confirmar esta visita?",
          descripcion: `${nombre} · ${fechaTxt}. El cliente recibirá la confirmación por correo y quedará agendado en tu agenda.`,
          boton: "Sí, confirmar",
          clase: "bg-green-600 hover:bg-green-700",
        }
      case "rechazar":
        return {
          titulo: "¿Rechazar esta solicitud?",
          descripcion: `La solicitud de ${nombre} (${fechaTxt}) será cancelada. El cliente será notificado y podrá agendar otro horario.`,
          boton: "Sí, rechazar",
          clase: "bg-red-600 hover:bg-red-700",
        }
      case "cancelar":
        return {
          titulo: "¿Cancelar esta visita?",
          descripcion: `La visita con ${nombre} (${fechaTxt}) quedará cancelada y se avisará al interesado. Esta acción no se puede deshacer.`,
          boton: "Sí, cancelar visita",
          clase: "bg-red-600 hover:bg-red-700",
        }
      case "realizada":
        return {
          titulo: "¿Marcar como realizada?",
          descripcion: `La visita de ${nombre} (${fechaTxt}) pasará al historial como completada.`,
          boton: "Sí, fue realizada",
          clase: "bg-green-600 hover:bg-green-700",
        }
    }
  }

  // Guardar la nueva fecha: reprogramar (queda pendiente) o confirmar directo
  const handleGuardarFecha = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!visitaAReprogramar) return
    if (!fechaModal || !slotModal) {
      toast.error("Elige el día y el horario de tu agenda")
      return
    }
    const fechaCompleta = `${fechaModal} ${slotModal}`
    const esConfirmar = visitaAReprogramar.estado === "confirmar"

    setGuardandoFecha(true)
    try {
      const token = localStorage.getItem("token")
      const endpoint = esConfirmar ? "confirm" : "reprogram"
      const response = await fetch(`${API_URL}/api/panel/visits/${visitaAReprogramar.id}/${endpoint}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fecha_visita: fechaCompleta })
      })

      if (response.ok) {
        toast.success(esConfirmar ? "Visita confirmada" : "Visita reprogramada. Queda pendiente de confirmación")
        cerrarModalFecha()
        fetchVisits()
      } else {
        const errData = await response.json().catch(() => ({ error: "" }))
        toast.error(errData.error || "Error al guardar la fecha")
      }
    } catch (error) {
      console.error("Error guardando fecha:", error)
      toast.error("Error al guardar la fecha")
    } finally {
      setGuardandoFecha(false)
    }
  }

  // Conteos por estado (para los chips-filtro)
  const conteos = {
    todas: visits.length,
    pendiente: visits.filter((v) => v.estado === "pendiente").length,
    confirmada: visits.filter((v) => v.estado === "confirmada").length,
    completada: visits.filter((v) => v.estado === "completada").length,
    cancelada: visits.filter((v) => v.estado === "cancelada").length,
  }

  const filteredVisits = visits.filter((visit) => {
    if (!filterEstado) return true
    return visit.estado === filterEstado
  })

  // Secciones: Próximas (pendientes/confirmadas, más cercanas primero)
  // y Historial (realizadas/canceladas, más recientes primero).
  // Con filtro activo se lista directo sin dividir.
  const enSecciones = !filterEstado
  const proximas = filteredVisits.filter(esProxima).sort((a, b) => tsOrden(a) - tsOrden(b))
  const historial = filteredVisits.filter((v) => !esProxima(v)).sort((a, b) => tsOrden(b) - tsOrden(a))

  const listaVacia = filteredVisits.length === 0

  // Bloque de fecha tipo calendario (color según estado)
  const BloqueFecha = ({ visit }: { visit: Visit }) => {
    const estilo = estiloEstado[visit.estado] || estiloEstado.cancelada
    if (!tieneFechaValida(visit)) {
      return (
        <div className={`w-[68px] shrink-0 rounded-lg border flex flex-col items-center justify-center py-3 gap-1 ${estilo}`}>
          <Calendar className="h-5 w-5" />
          <span className="text-[9px] font-semibold uppercase tracking-wide">Sin fecha</span>
        </div>
      )
    }
    const f = parseFechaVisita(visit.fecha_visita)
    return (
      <div className={`w-[68px] shrink-0 rounded-lg border flex flex-col items-center justify-center py-2 ${estilo}`}>
        <span className="text-[10px] font-semibold uppercase tracking-wide">{DIAS_ABBR[f.getDay()]}</span>
        <span className="text-2xl font-bold leading-none my-0.5">{f.getDate()}</span>
        <span className="text-[10px] uppercase">{MESES_ABBR[f.getMonth()]}</span>
        <span className="text-[11px] font-semibold mt-1 pt-1 border-t w-full text-center">
          {f.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    )
  }

  // Fila compacta de visita
  const FilaVisita = ({ visit }: { visit: Visit }) => {
    const badge = badgeEstado[visit.estado]
    const persona = activeTab === "mias" ? visit.vendedor : visit.inquilino
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
        <div className="flex gap-4">
          <BloqueFecha visit={visit} />

          {/* Información */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {persona?.nombre || "—"}
              </h3>
              {badge && <Badge className={`${badge.className} text-[10px] px-2 py-0`}>{badge.label}</Badge>}
              {activeTab === "recibidas" && visit.estado === "pendiente" && tieneFechaValida(visit) && (
                <span className="text-[10px] text-gray-400 italic">propuesta por el cliente</span>
              )}
            </div>

            <div className="flex items-center text-xs text-gray-600 mt-1 min-w-0">
              <Building className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <Link
                href={`/propiedades/${visit.property.id}`}
                className="text-blue-600 hover:underline truncate"
              >
                {visit.property.titulo}
              </Link>
              <span className="mx-1.5 text-gray-300">•</span>
              <span className="truncate">{visit.property.zona}</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
              {persona?.email && (
                <span className="flex items-center min-w-0">
                  <Mail className="w-3.5 h-3.5 mr-1 shrink-0" />
                  <span className="truncate">{persona.email}</span>
                </span>
              )}
              {activeTab === "recibidas" && visit.inquilino?.telefono && (
                <span className="flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1" />
                  {visit.inquilino.telefono}
                </span>
              )}
            </div>

            {activeTab === "recibidas" && visit.notas && (
              <div className="flex items-start text-xs text-gray-500 mt-1.5 bg-gray-50 rounded px-2 py-1">
                <MessageSquareText className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0" />
                <span className="whitespace-pre-line line-clamp-2">{visit.notas}</span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex md:flex-col items-end justify-between gap-2 shrink-0">
            {/* Acción principal */}
            <div className="flex md:justify-end gap-1.5 flex-wrap">
              {activeTab === "recibidas" ? (
                <>
                  {visit.estado === "pendiente" && (
                    <Button
                      size="sm"
                      disabled={accionEnCurso === visit.id}
                      onClick={() => setPendienteConfirmar({ tipo: "confirmar", visit })}
                      className="bg-green-600 hover:bg-green-700 h-8"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      {tieneFechaValida(visit) ? "Confirmar" : "Asignar fecha"}
                    </Button>
                  )}
                  {visit.estado === "confirmada" && (
                    <Button
                      size="sm"
                      disabled={accionEnCurso === visit.id}
                      onClick={() => setPendienteConfirmar({ tipo: "realizada", visit })}
                      className="bg-green-600 hover:bg-green-700 h-8"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      Realizada
                    </Button>
                  )}
                </>
              ) : (
                visit.estado === "confirmada" && (
                  <Button
                    size="sm"
                    disabled={accionEnCurso === visit.id}
                    onClick={() => setPendienteConfirmar({ tipo: "realizada", visit })}
                    className="bg-green-600 hover:bg-green-700 h-8"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Ya la realicé
                  </Button>
                )
              )}
            </div>

            {/* Acciones secundarias: iconos compactos */}
            {(esProxima(visit)) && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={accionEnCurso === visit.id}
                  onClick={() => abrirModalFecha(visit, "reprogramar")}
                  title="Reprogramar"
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
                {activeTab === "recibidas" && visit.estado === "pendiente" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={accionEnCurso === visit.id}
                    onClick={() => setPendienteConfirmar({ tipo: "rechazar", visit })}
                    title="Rechazar solicitud"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={accionEnCurso === visit.id}
                    onClick={() => setPendienteConfirmar({ tipo: "cancelar", visit })}
                    title="Cancelar visita"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <CalendarX2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Encabezado de sección
  const Seccion = ({ titulo, cantidad, children }: { titulo: string; cantidad: number; children: React.ReactNode }) => {
    if (cantidad === 0) return null
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{titulo}</h2>
          <span className="text-xs text-gray-400">({cantidad})</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="space-y-2">{children}</div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visitas</h1>
          <p className="text-gray-600 mt-1 text-sm">Confirma, reprograma o da seguimiento a las visitas</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setMostrarDisponibilidad(!mostrarDisponibilidad)}
          className="flex items-center gap-2"
        >
          <CalendarClock className="h-4 w-4" />
          Mi disponibilidad
          {mostrarDisponibilidad ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Configuración de disponibilidad */}
      {mostrarDisponibilidad && <DisponibilidadVisitasCard />}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("recibidas")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "recibidas"
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 hover:text-gray-700 border-transparent"
          }`}
        >
          <Inbox className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          Solicitudes recibidas
        </button>
        <button
          onClick={() => setActiveTab("mias")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "mias"
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 hover:text-gray-700 border-transparent"
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          Mis visitas agendadas
        </button>
      </div>

      {/* Chips-filtro con conteos */}
      <div className="flex flex-wrap gap-2">
        {([
          ["", "Todas", conteos.todas],
          ["pendiente", "Pendientes", conteos.pendiente],
          ["confirmada", "Confirmadas", conteos.confirmada],
          ["completada", "Realizadas", conteos.completada],
          ["cancelada", "Canceladas", conteos.cancelada],
        ] as [string, string, number][]).map(([valor, label, count]) => (
          <button
            key={valor || "todas"}
            onClick={() => setFilterEstado(valor)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filterEstado === valor
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}
          >
            {label}
            <span className={`ml-1.5 px-1.5 rounded-full text-[10px] font-semibold ${
              filterEstado === valor ? "bg-white/20" : "bg-gray-100"
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : listaVacia ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <Calendar className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {filterEstado ? `Sin visitas ${badgeEstado[filterEstado]?.label.toLowerCase() || ""}` : "No hay visitas"}
          </h3>
          <p className="text-gray-500 text-sm">
            {activeTab === "mias"
              ? "Aquí aparecen las visitas que agendaste como interesado. Aún no has agendado ninguna."
              : "Cuando alguien solicite visitar tus propiedades aparecerá aquí"}
          </p>
        </div>
      ) : enSecciones ? (
        <div className="space-y-6">
          <Seccion titulo="Próximas" cantidad={proximas.length}>
            {proximas.map((visit) => <FilaVisita key={visit.id} visit={visit} />)}
          </Seccion>
          <Seccion titulo="Historial" cantidad={historial.length}>
            {historial.map((visit) => <FilaVisita key={visit.id} visit={visit} />)}
          </Seccion>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredVisits.map((visit) => <FilaVisita key={visit.id} visit={visit} />)}
        </div>
      )}

      {/* Confirmación de acciones críticas */}
      <AlertDialog open={!!pendienteConfirmar} onOpenChange={(open) => !open && setPendienteConfirmar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{configConfirmacion()?.titulo}</AlertDialogTitle>
            <AlertDialogDescription>{configConfirmacion()?.descripcion}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              className={configConfirmacion()?.clase}
              onClick={ejecutarPendiente}
            >
              {configConfirmacion()?.boton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal: reprogramar / asignar fecha (vendedor) */}
      {modalFechaAbierto && visitaAReprogramar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[92vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {visitaAReprogramar.estado === "confirmar" ? "Asignar fecha" : "Reprogramar visita"}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                Propiedad: <strong>{visitaAReprogramar.property.titulo}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Interesado: <strong>{visitaAReprogramar.inquilino?.nombre}</strong>
              </p>

              {visitaAReprogramar.estado === "reprogramar" && tieneFechaValida(visitaAReprogramar) && (
                <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-4">
                  Fecha actual: {parseFechaVisita(visitaAReprogramar.fecha_visita).toLocaleString("es-BO", {
                    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              )}

              {/* Agenda del vendedor: elegir día y slot de los propios horarios */}
              {!agendaModal ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-6 justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  Cargando tu agenda...
                </div>
              ) : fechasModal().length === 0 ? (
                <div className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-3 mb-2">
                  No tienes días de atención configurados. Configura tu disponibilidad con el botón
                  <strong> "Mi disponibilidad"</strong> para poder asignar fechas.
                </div>
              ) : (
                <form onSubmit={handleGuardarFecha} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      1. Elige el día
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {fechasModal().map((fecha) => {
                        const iso = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`
                        const isSelected = fechaModal === iso
                        return (
                          <button
                            key={iso}
                            type="button"
                            onClick={() => {
                              setFechaModal(iso)
                              setSlotModal("")
                            }}
                            className={`
                              flex flex-col items-center px-3 py-2 rounded-lg border-2 min-w-[64px] transition-all shrink-0
                              ${isSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow"
                                : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                              }
                            `}
                          >
                            <span className="text-[10px] uppercase">{DIAS_ABBR[fecha.getDay()]}</span>
                            <span className="text-lg font-bold leading-none">{fecha.getDate()}</span>
                            <span className="text-[10px]">{MESES_ABBR[fecha.getMonth()]}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2. Elige el horario <span className="text-xs text-gray-400">({agendaModal.duracion_min} min)</span>
                    </label>
                    {!fechaModal ? (
                      <p className="text-xs text-gray-500">Selecciona primero un día</p>
                    ) : slotsModal().length === 0 ? (
                      <p className="text-xs text-gray-500">No hay horarios libres este día. Prueba con otro.</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {slotsModal().map((slot) => {
                          const isSelected = slotModal === slot
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSlotModal(slot)}
                              className={`
                                px-2 py-2 rounded-lg border-2 text-sm font-medium transition-all
                                ${isSelected
                                  ? "bg-blue-600 text-white border-blue-600 shadow"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                                }
                              `}
                            >
                              {slot}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {fechaModal && slotModal && (
                    <p className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                      Nueva visita: <strong>{new Date(`${fechaModal}T12:00:00`).toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long" })} a las {slotModal}</strong>
                    </p>
                  )}

                  {visitaAReprogramar.estado === "reprogramar" && (
                    <p className="text-xs text-gray-500">
                      La visita vuelve a estado <strong>pendiente</strong> y el interesado recibirá una notificación con el nuevo horario.
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cerrarModalFecha}
                      disabled={guardandoFecha}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={guardandoFecha || !fechaModal || !slotModal}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {guardandoFecha
                        ? "Guardando..."
                        : visitaAReprogramar.estado === "confirmar"
                          ? "Confirmar Visita"
                          : "Reprogramar"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
