"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Building, CheckCircle, Clock, TrendingUp, Trash2, Edit, Eye, Star, Shield, ShieldCheck, MoreHorizontal, UserCog, X, CheckSquare, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { adminApi, AdminProperty, Advisor } from "@/lib/services/admin-api"
import { toast } from "sonner"
import { PropertyBatchActions } from "@/components/admin/properties/PropertyBatchActions"

export default function AdminPropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<AdminProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    estado: 'all',
    tipo_operacion: 'all',
    tipo_propiedad: 'all',
    advisor_id: '',
  })
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    pendientes: 0,
    vendidos: 0,
  })
  const itemsPerPage = 10

  // Estados para el modal de asignar asesor
  const [advisorModalOpen, setAdvisorModalOpen] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null)
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<number | null>(null)
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [loadingAdvisors, setLoadingAdvisors] = useState(false)

  // Estados para selección en lote
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([])

  useEffect(() => {
    fetchProperties()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [currentPage, filters])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      // Transformar filtros: convertir "all" a undefined
      const cleanFilters = {
        page: currentPage,
        limit: itemsPerPage,
        estado: filters.estado === 'all' ? undefined : filters.estado,
        tipo_operacion: filters.tipo_operacion === 'all' ? undefined : filters.tipo_operacion,
        tipo_propiedad: filters.tipo_propiedad === 'all' ? undefined : filters.tipo_propiedad,
        advisor_id: filters.advisor_id || undefined,
        search: searchTerm || undefined,
      }
      const data = await adminApi.listProperties(cleanFilters)
      setProperties(data.properties)
    } catch (error: any) {
      toast.error(error.message || "Error al cargar propiedades")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await adminApi.getPropertiesStats('30d')
      setStats({
        total: data.total,
        activos: data.activos,
        pendientes: data.pendientes,
        vendidos: data.vendidos,
      })
    } catch (error: any) {
      console.error("Error cargando estadísticas:", error)
    }
  }

  const handleToggleStatus = async (id: number) => {
    const property = properties.find(p => p.id === id)
    if (!property) return

    const nuevoEstado = property.estado_propiedad === 'activo' ? 'inactivo' : 'activo'

    try {
      await adminApi.updatePropertyStatus(id, nuevoEstado)
      toast.success(`Propiedad ${nuevoEstado === 'activo' ? 'activada' : 'desactivada'} correctamente`)
      fetchProperties()
      fetchStats()
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar estado")
    }
  }

  const handleToggleFeatured = async (id: number) => {
    const property = properties.find(p => p.id === id)
    if (!property) return

    try {
      await adminApi.toggleFeatured(id, !property.destacado)
      toast.success(property.destacado ? "Propiedad ya no está destacada" : "Propiedad destacada")
      fetchProperties()
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar destacado")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta propiedad?")) return

    try {
      await adminApi.deleteProperty(id)
      toast.success("Propiedad eliminada correctamente")
      fetchProperties()
      fetchStats()
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar propiedad")
    }
  }

  const handleEdit = (id: number) => {
    router.push(`/admin/propiedades/editar/${id}`)
  }

  const handleView = (id: number) => {
    window.open(`/propiedades/${id}`, '_blank')
  }

  const handleOpenAdvisorModal = async (propertyId: number) => {
    setSelectedPropertyId(propertyId)
    const property = properties.find(p => p.id === propertyId)
    setSelectedAdvisorId(property?.advisor?.id || null)

    try {
      setLoadingAdvisors(true)
      const data = await adminApi.listAdvisors({ activo: true })
      setAdvisors(data.advisors)
      setAdvisorModalOpen(true)
    } catch (error: any) {
      toast.error(error.message || "Error al cargar asesores")
    } finally {
      setLoadingAdvisors(false)
    }
  }

  const handleAssignAdvisor = async () => {
    if (!selectedPropertyId) return

    try {
      await adminApi.assignAdvisor(selectedPropertyId, selectedAdvisorId)
      toast.success(selectedAdvisorId ? "Asesor asignado correctamente" : "Asesor removido correctamente")
      setAdvisorModalOpen(false)
      fetchProperties()
    } catch (error: any) {
      toast.error(error.message || "Error al asignar asesor")
    }
  }

  const handleTogglePropertySelection = (propertyId: number) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    )
  }

  const handleToggleAllSelection = () => {
    if (selectedPropertyIds.length === currentItems.length) {
      setSelectedPropertyIds([])
    } else {
      setSelectedPropertyIds(currentItems.map((p) => p.id))
    }
  }

  const handleClearSelection = () => {
    setSelectedPropertyIds([])
  }

  const filteredProperties = properties.filter(property =>
    property.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.zona.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.vendedor_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredProperties.slice(indexOfFirstItem, indexOfLastItem)

  const getStatusBadgeColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
      case 'inactivo': return 'bg-gray-100 text-gray-800 border border-gray-200'
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'vendido': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'rechazado': return 'bg-red-100 text-red-800 border border-red-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'activo': return <CheckCircle className="h-3.5 w-3.5" />
      case 'pendiente': return <Clock className="h-3.5 w-3.5" />
      case 'vendido': return <TrendingUp className="h-3.5 w-3.5" />
      default: return <Shield className="h-3.5 w-3.5" />
    }
  }

  if (loading && properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-primary/5 via-background to-primary/5 text-muted-foreground">
        Cargando propiedades...
      </div>
    )
  }

  return (
    <div className="p-8 pb-20 min-h-full bg-gradient-to-br from-primary/5 via-background to-primary/5">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-serif tracking-tight">Gestionar Propiedades</h1>
          <p className="text-muted-foreground mt-2">Administra todas las propiedades de la plataforma</p>
        </div>
        <Button
          onClick={() => router.push('/admin/propiedades/crear')}
          className="bg-primary hover:bg-primary/90"
        >
          <Building className="h-4 w-4 mr-2" />
          Nueva Propiedad
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Propiedades", count: stats.total, colorClass: "text-foreground", bgIcon: "bg-primary/10", iconColor: "text-primary", icon: Building },
          { label: "Activas", count: stats.activos, colorClass: "text-emerald-600", bgIcon: "bg-emerald-100", iconColor: "text-emerald-600", icon: CheckCircle },
          { label: "Pendientes", count: stats.pendientes, colorClass: "text-yellow-600", bgIcon: "bg-yellow-100", iconColor: "text-yellow-600", icon: Clock },
          { label: "Vendidas", count: stats.vendidos, colorClass: "text-blue-600", bgIcon: "bg-blue-100", iconColor: "text-blue-600", icon: TrendingUp },
        ].map((stat, idx) => (
          <div key={idx} className="bg-background rounded-xl shadow-sm border border-border p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.colorClass}`}>{stat.count}</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bgIcon}`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Filter & Table */}
      <div className="bg-background rounded-xl shadow-sm border border-border overflow-hidden mb-6">
        {/* Toolbar */}
        <div className="p-5 border-b border-border bg-muted/20">
          <div className="flex gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Buscar por título, zona o vendedor..."
                className="pl-9 bg-background focus-visible:ring-primary/20 border-border h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtros */}
            <Select value={filters.estado} onValueChange={(value) => setFilters({ ...filters, estado: value })}>
              <SelectTrigger className="w-[180px] bg-background border-border h-10">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="vendido">Vendido</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.tipo_operacion} onValueChange={(value) => setFilters({ ...filters, tipo_operacion: value })}>
              <SelectTrigger className="w-[180px] bg-background border-border h-10">
                <SelectValue placeholder="Tipo operación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las operaciones</SelectItem>
                <SelectItem value="venta">Venta</SelectItem>
                <SelectItem value="alquiler">Alquiler</SelectItem>
                <SelectItem value="anticretico">Anticrético</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.tipo_propiedad} onValueChange={(value) => setFilters({ ...filters, tipo_propiedad: value })}>
              <SelectTrigger className="w-[180px] bg-background border-border h-10">
                <SelectValue placeholder="Tipo propiedad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="casa">Casas</SelectItem>
                <SelectItem value="departamento">Departamentos</SelectItem>
                <SelectItem value="terreno">Terrenos</SelectItem>
                <SelectItem value="oficina">Oficinas</SelectItem>
                <SelectItem value="local">Locales</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Properties Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                <th className="px-6 py-4 w-12">
                  <button
                    onClick={handleToggleAllSelection}
                    className="flex items-center justify-center w-full"
                    title={selectedPropertyIds.length === currentItems.length ? "Deseleccionar todos" : "Seleccionar todos"}
                  >
                    {selectedPropertyIds.length === currentItems.length ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Tipo / Zona</th>
                <th className="px-6 py-4">Vendedor</th>
                <th className="px-6 py-4">Asesor</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Vistas</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Building className="h-10 w-10 mb-3 opacity-50" />
                      <p className="text-base font-medium">No se encontraron propiedades</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((property) => (
                  <tr
                    key={property.id}
                    className={`hover:bg-primary/5 transition-colors ${
                      selectedPropertyIds.includes(property.id) ? "bg-primary/10" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePropertySelection(property.id)}
                        className="flex items-center justify-center"
                      >
                        {selectedPropertyIds.includes(property.id) ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-muted-foreground">
                      #{property.id}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-foreground line-clamp-1">{property.titulo}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {property.tipo_operacion} · {property.tipo_propiedad}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-foreground">
                        {property.moneda === 'USD' ? 'U$S' : 'Bs'} {property.precio.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground">{property.zona}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">{property.vendedor_nombre}</div>
                      <div className="text-xs text-muted-foreground">{property.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {property.advisor ? (
                        <div className="text-sm text-foreground">{property.advisor.nombre}</div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusBadgeColor(property.estado_propiedad)}`}>
                        {getStatusIcon(property.estado_propiedad)}
                        {property.estado_propiedad}
                      </span>
                      {property.destacado && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-800">
                            <Star className="h-3 w-3 fill-current" />
                            Destacado
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {property.vistas_contador}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(property.id)}
                          title="Ver en público"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(property.id)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenAdvisorModal(property.id)}
                          title="Asignar asesor"
                          className={property.advisor ? "text-purple-600 hover:text-purple-700" : "text-muted-foreground"}
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(property.id)}
                          title={property.estado_propiedad === 'activo' ? "Desactivar" : "Activar"}
                          className={property.estado_propiedad === 'activo' ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleFeatured(property.id)}
                          title={property.destacado ? "Quitar destacado" : "Destacar"}
                          className={property.destacado ? "text-amber-600 hover:text-amber-700" : "text-muted-foreground"}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(property.id)}
                          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProperties.length > 0 && (
          <div className="bg-muted/10 px-6 py-4 flex items-center justify-between border-t border-border">
            <div className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{filteredProperties.length > 0 ? indexOfFirstItem + 1 : 0}</span> a{" "}
              <span className="font-medium text-foreground">{Math.min(indexOfLastItem, filteredProperties.length)}</span> de{" "}
              <span className="font-medium text-foreground">{filteredProperties.length}</span> propiedades
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={indexOfLastItem >= filteredProperties.length}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Acciones en lote */}
      <PropertyBatchActions
        selectedIds={selectedPropertyIds}
        onClearSelection={handleClearSelection}
        onRefresh={fetchProperties}
      />

      {/* Modal para asignar asesor */}
      <Dialog open={advisorModalOpen} onOpenChange={setAdvisorModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Asignar Asesor
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="advisor">Seleccionar Asesor</Label>
              <Select
                value={selectedAdvisorId?.toString() || "none"}
                onValueChange={(value) => setSelectedAdvisorId(value === "none" ? null : Number(value))}
              >
                <SelectTrigger id="advisor">
                  <SelectValue placeholder={loadingAdvisors ? "Cargando asesores..." : "Seleccionar asesor"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asesor</SelectItem>
                  {advisors.map((advisor) => (
                    <SelectItem key={advisor.id} value={advisor.id.toString()}>
                      {advisor.nombre}
                      {advisor.especialidad && (
                        <span className="text-muted-foreground text-xs ml-2">
                          ({advisor.especialidad})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Asigna un asesor a esta propiedad. El asesor podrá gestionar la propiedad.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setAdvisorModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAssignAdvisor}>
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
