"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, ExternalLink, CalendarClock, Check, X, RotateCcw } from "lucide-react"
import { toast } from "sonner"

const N8N_URL = "http://localhost:5678"
const CHATWOOT_URL = "http://localhost:3000"
const CHATWOOT_ACCOUNT = "3"

interface VisitaWhatsapp {
  id: number
  contact_name: string
  contact_phone: string | null
  property_code: string | null
  scheduled_when: string
  status: string
  conversation_id: string | null
  created_at: string
  notes: string | null
}

interface VisitasStats {
  total: number
  pendientes: number
  confirmadas: number
  canceladas: number
}

export default function AgendaWhatsappPage() {
  const [visitas, setVisitas] = useState<VisitaWhatsapp[]>([])
  const [stats, setStats] = useState<VisitasStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [ocupado, setOcupado] = useState(false)
  const [filtro, setFiltro] = useState<"todas" | "pendiente" | "confirmada" | "cancelada">("todas")

  const fetchVisitas = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${N8N_URL}/webhook/dashboard/visitas`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.error) {
        toast.error("Sesion expirada. Vuelve a iniciar sesion.")
        return
      }
      setVisitas(data.visitas ?? [])
      setStats(data.stats ?? null)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Error al cargar las visitas")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVisitas()
  }, [fetchVisitas])

  const accion = async (visita: VisitaWhatsapp, a: "confirmar" | "cancelar" | "posponer") => {
    let horario: string | null = null
    if (a === "posponer") {
      horario = prompt("Nuevo horario para la visita (ej: martes por la tarde a las 4pm):")
      if (!horario || !horario.trim()) return
      horario = horario.trim()
    }
    if (!confirm(`Confirmas ${a} la visita V-${visita.id}? El cliente recibira el aviso por WhatsApp.`)) return
    try {
      setOcupado(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${N8N_URL}/webhook/dashboard/visitas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: visita.id, accion: a, horario }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok || data.error) throw new Error(data.error || data.mensaje || `HTTP ${res.status}`)
      toast.success(`Visita ${a === "posponer" ? "reprogramada" : `${a}da`}. Cliente avisado por WhatsApp.`)
      fetchVisitas()
    } catch (error: any) {
      toast.error(error.message || "No se pudo ejecutar la accion")
    } finally {
      setOcupado(false)
    }
  }

  const statusChip = (status: string) => {
    switch (status) {
      case "confirmada": return "bg-green-500 text-white"
      case "cancelada": return "bg-red-500 text-white"
      default: return "bg-yellow-400 text-gray-900"
    }
  }

  const visibles = visitas.filter((v) => (filtro === "todas" ? true : v.status === filtro))

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <CalendarClock className="w-8 h-8 text-primary" />
                Agenda WhatsApp
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Visitas agendadas por el bot. Las acciones avisan al cliente por WhatsApp.
              </p>
            </div>
            <Button onClick={fetchVisitas} variant="outline" size="lg" disabled={loading}>
              <RefreshCw className={`w-5 h-5 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>

          {/* Métricas */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendientes}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Confirmadas</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.confirmadas}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Canceladas</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.canceladas}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtros */}
          <div className="flex gap-2 mb-6">
            {(["todas", "pendiente", "confirmada", "cancelada"] as const).map((f) => (
              <Button key={f} variant={filtro === f ? "default" : "outline"} size="sm" onClick={() => setFiltro(f)}>
                {f === "todas" ? "Todas" : f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>

          {/* Tabla */}
          {loading ? (
            <div className="text-center py-16 text-muted-foreground">Cargando visitas...</div>
          ) : visibles.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No hay visitas aqui. Cuando un cliente agende una visita con el bot, aparecera en esta lista.
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="p-4">Cliente</th>
                        <th className="p-4">Propiedad</th>
                        <th className="p-4">Horario</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibles.map((v) => (
                        <tr key={v.id} className="border-b last:border-0 hover:bg-muted/40">
                          <td className="p-4">
                            <p className="font-medium">{v.contact_name}</p>
                            {v.contact_phone && <p className="text-xs text-muted-foreground">{v.contact_phone}</p>}
                          </td>
                          <td className="p-4">{v.property_code ?? "-"}</td>
                          <td className="p-4">{v.scheduled_when}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${statusChip(v.status)}`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {v.status !== "confirmada" && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={ocupado}
                                  onClick={() => accion(v, "confirmar")} title="Confirmar y avisar al cliente">
                                  <Check className="w-4 h-4 mr-1" /> Confirmar
                                </Button>
                              )}
                              {v.status !== "cancelada" && (
                                <Button size="sm" variant="destructive" disabled={ocupado}
                                  onClick={() => accion(v, "cancelar")} title="Cancelar y avisar al cliente">
                                  <X className="w-4 h-4 mr-1" /> Cancelar
                                </Button>
                              )}
                              <Button size="sm" variant="outline" disabled={ocupado}
                                onClick={() => accion(v, "posponer")} title="Cambiar el horario y avisar al cliente">
                                <RotateCcw className="w-4 h-4 mr-1" /> Posponer
                              </Button>
                              {v.conversation_id && (
                                <Button size="sm" variant="ghost" asChild title="Abrir conversacion en Chatwoot">
                                  <a href={`${CHATWOOT_URL}/app/accounts/${CHATWOOT_ACCOUNT}/conversations/${v.conversation_id}`} target="_blank" rel="noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
