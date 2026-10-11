"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { RefreshCw, ExternalLink, MessageCircle, Search, TrendingUp, User, Phone } from "lucide-react"
import { toast } from "sonner"

const N8N_URL = "http://localhost:5678"
const CHATWOOT_URL = "http://localhost:3000"
const CHATWOOT_ACCOUNT = "3"

interface LeadWhatsapp {
  id: number
  nombre: string
  telefono: string
  score: number
  nivel: string
  presupuesto: string | null
  zona: string | null
  urgencia: string | null
  modalidad: string | null
  actualizado: string | null
  labels: string[]
  conversacion: number | null
}

interface LeadsStats {
  total: number
  alto: number
  medio: number
  bajo: number
}

export default function LeadsWhatsappPage() {
  const [leads, setLeads] = useState<LeadWhatsapp[]>([])
  const [stats, setStats] = useState<LeadsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [filtro, setFiltro] = useState<"todos" | "ALTO" | "MEDIO" | "BAJO">("todos")

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${N8N_URL}/webhook/dashboard/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.error) {
        toast.error("Sesion expirada. Vuelve a iniciar sesion.")
        return
      }
      setLeads(data.leads ?? [])
      setStats(data.stats ?? null)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Error al cargar leads de WhatsApp")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const nivelColor = (nivel: string) => {
    switch (nivel) {
      case "ALTO": return "bg-green-500"
      case "MEDIO": return "bg-yellow-500"
      default: return "bg-gray-400"
    }
  }

  const scoreColor = (score: number) => {
    if (score >= 70) return "text-green-600 dark:text-green-400"
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400"
    return "text-gray-500"
  }

  const leadsVisibles = leads
    .filter((l) => (filtro === "todos" ? true : l.nivel === filtro))
    .filter((l) => {
      if (!busqueda) return true
      const q = busqueda.toLowerCase()
      return (l.nombre ?? "").toLowerCase().includes(q) || (l.telefono ?? "").includes(q) || (l.zona ?? "").toLowerCase().includes(q)
    })

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <MessageCircle className="w-8 h-8 text-primary" />
                Leads WhatsApp
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Contactos captados por el bot con su puntaje de interes
              </p>
            </div>
            <Button onClick={fetchLeads} variant="outline" size="lg" disabled={loading}>
              <RefreshCw className={`w-5 h-5 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>

          {/* Métricas */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">ALTO</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.alto}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">MEDIO</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.medio}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">BAJO</p>
                  <p className="text-2xl font-bold text-gray-500">{stats.bajo}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, telefono o zona..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(["todos", "ALTO", "MEDIO", "BAJO"] as const).map((f) => (
                <Button key={f} variant={filtro === f ? "default" : "outline"} size="sm" onClick={() => setFiltro(f)}>
                  {f === "todos" ? "Todos" : f}
                </Button>
              ))}
            </div>
          </div>

          {/* Lista de leads */}
          {loading ? (
            <div className="text-center py-16 text-muted-foreground">Cargando leads...</div>
          ) : leadsVisibles.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No hay leads que coincidan. Cuando el bot detecte interes en una conversacion, aparecera aqui.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {leadsVisibles.map((lead) => (
                <Card key={`${lead.id}-${lead.conversacion ?? "x"}`} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {lead.nombre || "Sin nombre"}
                      </CardTitle>
                      <Badge className={`${nivelColor(lead.nivel)} text-white`}>{lead.nivel}</Badge>
                    </div>
                    {lead.telefono && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {lead.telefono}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Score</span>
                      <span className={`font-bold text-lg ${scoreColor(lead.score)}`}>{lead.score}/100</span>
                    </div>
                    {lead.presupuesto && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Presupuesto</span><span>{lead.presupuesto}</span></div>
                    )}
                    {lead.zona && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Zona</span><span>{lead.zona}</span></div>
                    )}
                    {lead.modalidad && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Modalidad</span><span className="capitalize">{lead.modalidad}</span></div>
                    )}
                    {lead.urgencia && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Urgencia</span><span className="capitalize">{lead.urgencia}</span></div>
                    )}
                    {lead.actualizado && (
                      <p className="text-xs text-muted-foreground pt-1">Actualizado: {lead.actualizado}</p>
                    )}
                    {lead.conversacion && (
                      <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                        <a
                          href={`${CHATWOOT_URL}/app/accounts/${CHATWOOT_ACCOUNT}/conversations/${lead.conversacion}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Abrir conversacion
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
