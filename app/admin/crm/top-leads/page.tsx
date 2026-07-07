"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Award,
  TrendingUp,
  Search,
  Filter,
  BarChart3,
  Check,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { crmApiService, LeadScore, ScoreLevel, ScoreStats } from "@/lib/services/crm-api"
import { LeadScoreCard } from "@/components/crm/lead-score-card"
import { ClientCard } from "@/components/crm/client-card"
import { toast } from "sonner"

export default function TopLeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<LeadScore[]>([])
  const [stats, setStats] = useState<ScoreStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState<ScoreLevel | "all">("all")
  const [recalculando, setRecalculando] = useState(false)

  useEffect(() => {
    fetchLeads()
    fetchStats()
  }, [levelFilter])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      let response

      if (levelFilter === "all") {
        response = await crmApiService.getTopLeads(50)
      } else {
        response = await crmApiService.getLeadsByLevel(levelFilter)
      }

      // Si hay búsqueda, filtrar localmente
      if (searchQuery) {
        const filtered = response.leads.filter((lead) =>
          lead.client?.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setLeads(filtered)
      } else {
        setLeads(response.leads)
      }
    } catch (error: any) {
      console.error("Error fetching leads:", error)
      toast.error(error.message || "Error al cargar leads")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await crmApiService.getScoreStats()
      setStats(data)
    } catch (error: any) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleSearch = () => {
    fetchLeads()
  }

  const handleRecalculateAll = async () => {
    try {
      setRecalculando(true)
      await crmApiService.recalculateAllScores()
      toast.success("Scores recalculados exitosamente")
      fetchLeads()
      fetchStats()
    } catch (error: any) {
      console.error("Error recalculating:", error)
      toast.error(error.message || "Error al recalcular scores")
    } finally {
      setRecalculando(false)
    }
  }

  const getLevelColor = (level: ScoreLevel) => {
    switch (level) {
      case "ALTO":
        return "text-green-600 bg-green-500/10 border-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30"
      case "MEDIO":
        return "text-yellow-600 bg-yellow-500/10 border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30"
      case "BAJO":
        return "text-red-600 bg-red-500/10 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30"
      default:
        return "text-gray-600 bg-gray-500/10 border-gray-500/20 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30"
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Top Leads</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Leads priorizados por scoring automático
                </p>
              </div>
              <Button
                onClick={handleRecalculateAll}
                disabled={recalculando}
                variant="outline"
              >
                <RefreshCw
                  className={`w-5 h-5 mr-2 ${recalculando ? "animate-spin" : ""}`}
                />
                Recalcular Todos
              </Button>
            </div>
          </div>

          {/* Métricas de Scoring */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Leads</p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats.total}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Promedio Score</p>
                      <p className="text-2xl font-bold text-primary">
                        {stats.avg_score.toFixed(1)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Leads Altos</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.high_count}
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-green-500 dark:text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Conversión</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.total > 0
                          ? ((stats.high_count / stats.total) * 100).toFixed(
                              1
                            )
                          : 0}
                        %
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtros y Búsqueda */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Búsqueda */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filtro por nivel */}
                <div className="w-full md:w-64">
                  <Select
                    value={levelFilter}
                    onValueChange={(value) =>
                      setLevelFilter(value as ScoreLevel | "all")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los niveles</SelectItem>
                      <SelectItem value="ALTO">Altos</SelectItem>
                      <SelectItem value="MEDIO">Medios</SelectItem>
                      <SelectItem value="BAJO">Bajos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Botón buscar */}
                <Button onClick={handleSearch} className="md:w-auto w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Leads */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchQuery || levelFilter !== "all"
                    ? "No se encontraron leads"
                    : "No hay leads con scoring aún"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || levelFilter !== "all"
                    ? "Intenta con otros filtros o términos de búsqueda"
                    : "Los leads comenzarán a aparecer cuando interactúen con el sistema"}
                </p>
                {!searchQuery && levelFilter === "all" && (
                  <Button onClick={handleRecalculateAll} variant="outline">
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Calcular Scores Ahora
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Contador de resultados */}
              <div className="mb-4 text-sm text-muted-foreground">
                Mostrando {leads.length} leads
              </div>

              {/* Lista de leads con score */}
              <div className="space-y-4">
                {leads.map((leadScore) => (
                  <Card
                    key={leadScore.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() =>
                      router.push(`/admin/crm/clientes/${leadScore.client_id}`)
                    }
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-6">
                        {/* Información del cliente */}
                        <div className="flex-1">
                          {leadScore.client && (
                            <>
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-lg font-semibold text-foreground">
                                  {leadScore.client.nombre}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    {leadScore.client.telefono}
                                  </span>
                                  {leadScore.client.email && (
                                    <span className="text-sm text-muted-foreground">
                                      {leadScore.client.email}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {leadScore.client.property && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <Check className="w-4 h-4 text-green-600" />
                                  <span>
                                    Interesado en:{" "}
                                    {leadScore.client.property.titulo}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Origen: {leadScore.client.origen}</span>
                                <span>Estado: {leadScore.client.estado}</span>
                                {leadScore.client.notas && (
                                  <span className="line-clamp-1 max-w-md">
                                    Notas: {leadScore.client.notas}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Score */}
                        <div className="w-48">
                          <LeadScoreCard
                            score={leadScore}
                            clientName={leadScore.client?.nombre}
                            showFactors={false}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
