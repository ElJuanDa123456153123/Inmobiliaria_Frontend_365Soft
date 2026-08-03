"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Calendar, Building, User, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface Visit {
  id: number
  fecha_visita: string
  estado: string
  notas?: string
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

export default function PanelVisitasPage() {
  const searchParams = useSearchParams()
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEstado, setFilterEstado] = useState<string>("")
  const [activeTab, setActiveTab] = useState<TabType>("mias")

  // Estados para el modal de confirmación
  const [modalConfirmarAbierto, setModalConfirmarAbierto] = useState(false)
  const [visitaAConfirmar, setVisitaAConfirmar] = useState<Visit | null>(null)
  const [fechaVisita, setFechaVisita] = useState("")
  const [horaVisita, setHoraVisita] = useState("")
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam === "recibidas" || tabParam === "mias") {
      setActiveTab(tabParam)
    }
    fetchVisits()
  }, [filterEstado, activeTab])

  const fetchVisits = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const endpoint = activeTab === "mias" ? "my" : "received"
      let url = `${API_URL}/api/panel/visits/${endpoint}`

      if (filterEstado) {
        url += `?estado=${filterEstado}`
      }

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

  const updateVisitStatus = async (visitId: number, newStatus: string) => {
    try {
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
        toast.success(newStatus === "cancelada" ? "Visita cancelada" : "Visita actualizada")
        fetchVisits()
      } else {
        toast.error("Error al actualizar visita")
      }
    } catch (error) {
      console.error("Error updating visit:", error)
      toast.error("Error al actualizar visita")
    }
  }

  const handleAbrirConfirmar = (visit: Visit) => {
    setVisitaAConfirmar(visit)
    setModalConfirmarAbierto(true)

    const manana = new Date()
    manana.setDate(manana.getDate() + 1)
    manana.setHours(10, 0, 0, 0)

    setFechaVisita(manana.toISOString().split('T')[0])
    setHoraVisita("10:00")
  }

  const handleConfirmarVisita = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!visitaAConfirmar) return
    if (!fechaVisita || !horaVisita) {
      toast.error("Por favor selecciona fecha y hora")
      return
    }

    setConfirmando(true)

    try {
      const token = localStorage.getItem("token")
      const fechaCompleta = `${fechaVisita} ${horaVisita}`

      const response = await fetch(`${API_URL}/api/panel/visits/${visitaAConfirmar.id}/confirm`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fecha_visita: fechaCompleta })
      })

      if (response.ok) {
        toast.success("Visita confirmada correctamente")
        setModalConfirmarAbierto(false)
        setVisitaAConfirmar(null)
        fetchVisits()
      } else {
        const errData = await response.json().catch(() => ({ error: "Error al confirmar" }))
        toast.error(errData.error || "Error al confirmar visita")
      }
    } catch (error) {
      console.error("Error confirmando visita:", error)
      toast.error("Error al confirmar visita")
    } finally {
      setConfirmando(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Badge className="bg-yellow-500">Pendiente</Badge>
      case "completada":
        return <Badge className="bg-green-500">Confirmada</Badge>
      case "cancelada":
        return <Badge className="bg-red-500">Cancelada</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const filteredVisits = visits.filter((visit) => {
    if (!filterEstado) return true
    return visit.estado === filterEstado
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visitas</h1>
          <p className="text-gray-600 mt-1">Gestiona las visitas agendadas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab("mias"); setFilterEstado("") }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "mias"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Mis Visitas
        </button>
        <button
          onClick={() => { setActiveTab("recibidas"); setFilterEstado("") }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "recibidas"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Visitas Recibidas
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex gap-2">
          <Button
            variant={filterEstado === "" ? "default" : "outline"}
            onClick={() => setFilterEstado("")}
            size="sm"
          >
            Todas
          </Button>
          <Button
            variant={filterEstado === "pendiente" ? "default" : "outline"}
            onClick={() => setFilterEstado("pendiente")}
            size="sm"
          >
            Pendientes
          </Button>
          <Button
            variant={filterEstado === "completada" ? "default" : "outline"}
            onClick={() => setFilterEstado("completada")}
            size="sm"
          >
            Confirmadas
          </Button>
          <Button
            variant={filterEstado === "cancelada" ? "default" : "outline"}
            onClick={() => setFilterEstado("cancelada")}
            size="sm"
          >
            Canceladas
          </Button>
        </div>
      </div>

      {/* Visits List */}
      {filteredVisits.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay visitas</h3>
          <p className="text-gray-600">
            {activeTab === "mias"
              ? "Aún no has agendado visitas a propiedades"
              : "No tienes solicitudes de visitas aún"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVisits.map((visit) => (
            <div
              key={visit.id}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-start justify-between">
                {/* Visit Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {activeTab === "mias" ? visit.vendedor?.nombre : visit.inquilino?.nombre}
                    </h3>
                    {getEstadoBadge(visit.estado)}
                  </div>

                  {/* Contact */}
                  <div className="space-y-1 mb-4 text-sm text-gray-600">
                    {activeTab === "mias" ? (
                      <>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          {visit.vendedor?.email}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          {visit.inquilino?.email}
                        </div>
                        {visit.notas && (
                          <div className="flex items-start">
                            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                            <span className="whitespace-pre-line">{visit.notas}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Property */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Building className="w-4 h-4 mr-2" />
                    <Link
                      href={`/propiedades/${visit.property.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {visit.property.titulo}
                    </Link>
                    <span className="mx-2">•</span>
                    <span>{visit.property.zona}</span>
                  </div>

                  {/* Date & Time */}
                  {visit.estado !== "pendiente" && visit.fecha_visita && !visit.fecha_visita.startsWith("0001") ? (
                    <div className="flex items-center text-sm text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="font-medium">
                        {new Date(visit.fecha_visita).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Fecha por confirmar</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {visit.estado === "pendiente" && (
                  <div className="flex flex-col gap-2 ml-4">
                    {activeTab === "mias" ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateVisitStatus(visit.id, "completada")}
                          className="whitespace-nowrap bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateVisitStatus(visit.id, "cancelada")}
                          className="whitespace-nowrap"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAbrirConfirmar(visit)}
                          className="whitespace-nowrap bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateVisitStatus(visit.id, "cancelada")}
                          className="whitespace-nowrap"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rechazar
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmación de Visita (vendedor) */}
      {modalConfirmarAbierto && visitaAConfirmar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Confirmar Visita
              </h3>

              <p className="text-sm text-gray-600 mb-2">
                Propiedad: <strong>{visitaAConfirmar.property.titulo}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Interesado: <strong>{visitaAConfirmar.inquilino?.nombre}</strong>
              </p>

              <form onSubmit={handleConfirmarVisita} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selecciona fecha *
                  </label>
                  <input
                    type="date"
                    value={fechaVisita}
                    onChange={(e) => setFechaVisita(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selecciona hora *
                  </label>
                  <select
                    value={horaVisita}
                    onChange={(e) => setHoraVisita(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona una hora</option>
                    <option value="08:00">08:00 AM</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="18:00">06:00 PM</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalConfirmarAbierto(false)}
                    disabled={confirmando}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={confirmando}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {confirmando ? "Confirmando..." : "Confirmar Visita"}
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
