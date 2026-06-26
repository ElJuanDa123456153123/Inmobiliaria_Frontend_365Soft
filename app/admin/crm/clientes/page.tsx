"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Calendar,
  Building2,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { crmApiService, Client, FunnelStats, ClientStatus } from "@/lib/services/crm-api"
import { ClientCard } from "@/components/crm/client-card"
import { AddClientModal } from "@/components/crm/add-client-modal"
import { toast } from "sonner"

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [stats, setStats] = useState<FunnelStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })

  useEffect(() => {
    fetchClients()
    fetchStats()
  }, [statusFilter, pagination.page])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      }

      if (statusFilter !== "all") {
        params.status = statusFilter
      }

      if (searchQuery) {
        params.query = searchQuery
      }

      const response = await crmApiService.getClients(params)
      setClients(response.clients)
      setPagination((prev) => ({ ...prev, total: response.total }))
    } catch (error: any) {
      console.error("Error fetching clients:", error)
      toast.error(error.message || "Error al cargar clientes")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await crmApiService.getFunnelStats()
      setStats(data)
    } catch (error: any) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchClients()
  }

  const handleClientCreated = () => {
    setShowAddModal(false)
    fetchClients()
    fetchStats()
    toast.success("Cliente creado exitosamente")
  }

  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case "Nuevo":
        return "bg-blue-500"
      case "Contactado":
        return "bg-yellow-500"
      case "Interesado":
        return "bg-green-500"
      case "EnNegociacion":
        return "bg-orange-500"
      case "Cerrado":
        return "bg-green-600"
      case "Perdido":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return `hace ${diffMinutes} minuto${diffMinutes !== 1 ? "s" : ""}`
      }
      return `hace ${diffHours} hora${diffHours !== 1 ? "s" : ""}`
    }
    return `hace ${diffDays} día${diffDays !== 1 ? "s" : ""}`
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">CRM - Clientes</h1>
                <p className="mt-1 text-sm text-gray-500">Gestiona tus clientes y seguimientos</p>
              </div>
              <Button onClick={() => setShowAddModal(true)} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Cliente
              </Button>
            </div>
          </div>

          {/* Métricas del Embudo */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Nuevos</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.nuevos}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Contactados</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.contactados}</p>
                    </div>
                    <Phone className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Interesados</p>
                      <p className="text-2xl font-bold text-green-600">{stats.interesados}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Negociación</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.en_negociacion}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Cerrados</p>
                      <p className="text-2xl font-bold text-green-700">{stats.cerrados}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Perdidos</p>
                      <p className="text-2xl font-bold text-red-600">{stats.perdidos}</p>
                    </div>
                      <Users className="h-8 w-8 text-red-500" />
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
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filtro por estado */}
                <div className="w-full md:w-64">
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ClientStatus | "all")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="Nuevo">Nuevos</SelectItem>
                      <SelectItem value="Contactado">Contactados</SelectItem>
                      <SelectItem value="Interesado">Interesados</SelectItem>
                      <SelectItem value="EnNegociacion">En Negociación</SelectItem>
                      <SelectItem value="Cerrado">Cerrados</SelectItem>
                      <SelectItem value="Perdido">Perdidos</SelectItem>
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

          {/* Lista de Clientes */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando clientes...</p>
            </div>
          ) : clients.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || statusFilter !== "all" ? "No se encontraron clientes" : "No tienes clientes aún"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "Intenta con otros filtros o términos de búsqueda"
                    : "Comienza a agregar clientes para gestionar tus ventas"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Agregar Primer Cliente
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Contador de resultados */}
              <div className="mb-4 text-sm text-gray-600">
                Mostrando {clients.length} de {pagination.total} clientes
              </div>

              {/* Grid de clientes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {clients.map((client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    onClick={() => router.push(`/crm/clientes/${client.id}`)}
                  />
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Página {pagination.page} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal de agregar cliente */}
      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleClientCreated}
        />
      )}
    </div>
  )
}
