"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Building, Building2, CheckCircle, Clock, TrendingUp, Trash2, Edit, Eye, Star, Shield, ShieldCheck, MoreHorizontal, UserCog, X, CheckSquare, Square, User, Plus, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { adminApi, AdminProperty, Advisor } from "@/lib/services/admin-api"
import { toast } from "sonner"
import { PropertyBatchActions } from "@/components/admin/properties/PropertyBatchActions"
import { getImageUrl } from "@/lib/utils"

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
  const [selectedProperty, setSelectedProperty] = useState<AdminProperty | null>(null)
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<number | null>(null)
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [assignedAdvisors, setAssignedAdvisors] = useState<Advisor[]>([]) // Asesores asignados a la propiedad
  const [loadingAdvisors, setLoadingAdvisors] = useState(false)
  const [loadingAssignedAdvisors, setLoadingAssignedAdvisors] = useState(false)

  // Estados para selección en lote
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([])
  const [agenciaPersonalizado, setAgenciaPersonalizado] = useState<string>("")

  // Funciones helper para manejo de agencia
  const getAgenciaSelectValue = (property: AdminProperty) => {
    if (!property.mostrar_agencia) return "365soft"
    if (property.agencia_nombre_personalizado) return "personalizado"
    return "vendedor"
  }

  const getAgenciaDisplayValue = (property: AdminProperty) => {
    if (!property.mostrar_agencia) return "365Soft"
    if (property.agencia_nombre_personalizado) return property.agencia_nombre_personalizado
    return property.vendedor_nombre
  }

  const handleAgenciaChange = (id: number, value: string) => {
    if (value === "365soft") {
      toggleMostrarAgencia(id, false)
      setAgenciaPersonalizado("")
    } else if (value === "vendedor") {
      toggleMostrarAgencia(id, true, null)
      setAgenciaPersonalizado("")
    } else if (value === "personalizado") {
      toggleMostrarAgencia(id, true, "")
      setAgenciaPersonalizado(selectedProperty?.agencia_nombre_personalizado || "")
    }
  }

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
      console.log("📝 Propiedades cargadas:", data.properties.map((p: any) => ({
        id: p.id,
        titulo: p.titulo,
        asesores_asignados: p.asesores_asignados,
        num_asesores: p.asesores_asignados?.length || 0,
        advisor: p.advisor?.nombre || 'none'
      })))
      setProperties(data.properties || [])
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

  const toggleMostrarVendedor = async (id: number, mostrar: boolean) => {
    try {
      console.log("🔄 [TOGGLE VENDEDOR] Enviando actualización:", { id, mostrar_vendedor: mostrar })
      await adminApi.updateProperty(id, { mostrar_vendedor: mostrar })
      console.log("✅ [TOGGLE VENDEDOR] Actualización exitosa")
      toast.success(mostrar ? "Vendedor visible" : "Vendedor oculto (365Soft)")

      // Actualizar el estado local inmediatamente
      if (selectedProperty && selectedProperty.id === id) {
        setSelectedProperty({
          ...selectedProperty,
          mostrar_vendedor: mostrar
        })
      }

      // Actualizar también el array de propiedades localmente para cambios inmediatos
      setProperties(prevProperties =>
        prevProperties.map(p =>
          p.id === id ? { ...p, mostrar_vendedor: mostrar } : p
        )
      )

      // Recargar del backend para asegurar sincronización
      await fetchProperties()
    } catch (error: any) {
      console.error("❌ [TOGGLE VENDEDOR] Error:", error)
      toast.error(error.message || "Error al actualizar visibilidad")
    }
  }

  const toggleMostrarAgencia = async (id: number, mostrar: boolean, nombrePersonalizado?: string | null) => {
    try {
      console.log("🔄 [TOGGLE AGENCIA] Enviando actualización:", { id, mostrar_agencia: mostrar, nombre_personalizado: nombrePersonalizado })
      await adminApi.updateProperty(id, {
        mostrar_agencia: mostrar,
        ...(nombrePersonalizado !== undefined && { agencia_nombre_personalizado: nombrePersonalizado || null })
      })
      console.log("✅ [TOGGLE AGENCIA] Actualización exitosa")
      toast.success(mostrar ? "Agencia visible" : "Agencia oculta (365Soft)")

      // Actualizar el estado local inmediatamente
      if (selectedProperty && selectedProperty.id === id) {
        setSelectedProperty({
          ...selectedProperty,
          mostrar_agencia: mostrar,
          ...(nombrePersonalizado !== undefined && { agencia_nombre_personalizado: nombrePersonalizado || null })
        })
      }

      // Actualizar también el array de propiedades localmente para cambios inmediatos
      setProperties(prevProperties =>
        prevProperties.map(p =>
          p.id === id ? {
            ...p,
            mostrar_agencia: mostrar,
            ...(nombrePersonalizado !== undefined && { agencia_nombre_personalizado: nombrePersonalizado || null })
          } : p
        )
      )

      // Recargar del backend para asegurar sincronización
      await fetchProperties()
    } catch (error: any) {
      console.error("❌ [TOGGLE AGENCIA] Error:", error)
      toast.error(error.message || "Error al actualizar visibilidad de agencia")
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

    try {
      setLoadingAdvisors(true)
      setLoadingAssignedAdvisors(true)

      // Cargar la propiedad actualizada desde el backend (no usar el array local)
      const propertyData = await adminApi.getProperty(propertyId)
      setSelectedProperty(propertyData)

      // Cargar todos los asesores disponibles
      const advisorsData = await adminApi.listAdvisors({ activo: true })
      console.log("📝 Asesores cargados:", advisorsData.advisors.map((a: any) => ({
        id: a.id,
        nombre: a.nombre,
        avatar_url: a.avatar_url,
        imagen_url: a.imagen_url
      })))
      setAdvisors(advisorsData.advisors)

      // Cargar asesores ya asignados a esta propiedad
      const assignedData = await adminApi.getPropertyAdvisors(propertyId)
      setAssignedAdvisors(assignedData.advisors)

      setAdvisorModalOpen(true)
    } catch (error: any) {
      toast.error(error.message || "Error al cargar asesores")
    } finally {
      setLoadingAdvisors(false)
      setLoadingAssignedAdvisors(false)
    }
  }

  const handleAssignAdvisor = async () => {
    if (!selectedPropertyId || !selectedAdvisorId) {
      toast.error("Selecciona un asesor")
      return
    }

    // Verificar si ya está asignado
    if (assignedAdvisors.some(a => a.id === selectedAdvisorId)) {
      toast.error("Este asesor ya está asignado a esta propiedad")
      return
    }

    try {
      await adminApi.assignAdvisorToProperty(selectedPropertyId, selectedAdvisorId)
      toast.success("Asesor asignado correctamente")

      // Recargar asesores asignados
      const assignedData = await adminApi.getPropertyAdvisors(selectedPropertyId)
      setAssignedAdvisors(assignedData.advisors)

      setSelectedAdvisorId(null)
      fetchProperties()
    } catch (error: any) {
      toast.error(error.message || "Error al asignar asesor")
    }
  }

  const handleRemoveAdvisor = async (advisorId: number) => {
    if (!selectedPropertyId) return

    try {
      await adminApi.removeAdvisorFromProperty(selectedPropertyId, advisorId)
      toast.success("Asesor eliminado de la propiedad")

      // Actualizar lista de asesores asignados
      setAssignedAdvisors(prev => prev.filter(a => a.id !== advisorId))
      fetchProperties()
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar asesor")
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

  const filteredProperties = (properties || []).filter(property =>
    (property.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (property.zona || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (property.vendedor_nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
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
          onClick={() => router.push('/admin/publicar')}
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
                      {property.asesores_asignados && property.asesores_asignados.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {property.asesores_asignados.map((pa: any) => (
                            <span
                              key={pa.id}
                              className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md"
                            >
                              {pa.asesor?.nombre || 'Sin nombre'}
                            </span>
                          ))}
                        </div>
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

      {/* Modal para asignar asesores */}
      <Dialog open={advisorModalOpen} onOpenChange={setAdvisorModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Gestionar Asesores de la Propiedad
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Información de la propiedad y usuario dueño */}
            {selectedProperty && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Propiedad</h3>
                  <p className="font-medium">{selectedProperty.titulo}</p>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">Agente visible en el card</h3>
                      <Select
                        value={selectedProperty.mostrar_vendedor && assignedAdvisors.length > 0 ? "asesor" : "365soft"}
                        onValueChange={(value) => toggleMostrarVendedor(selectedProperty.id, value === "asesor")}
                      >
                        <SelectTrigger className="text-xs h-9">
                          <SelectValue placeholder="Selecciona..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="365soft">365Soft (por defecto)</SelectItem>
                          {assignedAdvisors.length > 0 && (
                            <SelectItem value="asesor">
                              Asesor asignado: {assignedAdvisors[0]?.nombre || 'N/A'}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {assignedAdvisors.length === 0
                          ? "No hay asesores asignados. Se mostrará 365Soft."
                          : "Selecciona si mostrar el asesor o 365Soft"
                        }
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium truncate">
                        {selectedProperty.mostrar_vendedor && assignedAdvisors.length > 0
                          ? assignedAdvisors[0]?.nombre
                          : '365Soft'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selector para mostrar/ocultar agencia */}
                <div className="flex items-start gap-3 pt-2 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">Agencia visible en el card</h3>
                      <Select
                        value={getAgenciaSelectValue(selectedProperty)}
                        onValueChange={(value) => handleAgenciaChange(selectedProperty.id, value)}
                      >
                        <SelectTrigger className="text-xs h-9">
                          <SelectValue placeholder="Selecciona..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="365soft">365Soft (por defecto)</SelectItem>
                          <SelectItem value="vendedor">Vendedor: {selectedProperty.vendedor_nombre}</SelectItem>
                          <SelectItem value="personalizado">Personalizado...</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium truncate">
                        {getAgenciaDisplayValue(selectedProperty)}
                      </p>
                      {agenciaPersonalizado && (
                        <div className="mt-2 space-y-2">
                          <Input
                            placeholder="Escribe nombre personalizado"
                            value={agenciaPersonalizado}
                            onChange={(e) => setAgenciaPersonalizado(e.target.value)}
                            onBlur={(e) => {
                              const valor = e.target.value.trim()
                              toggleMostrarAgencia(selectedProperty.id, true, valor)
                            }}
                            className="text-xs h-8"
                          />
                          <p className="text-xs text-muted-foreground">
                            Presiona Enter o haz clic fuera para guardar
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Asesores ya asignados */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Asesores Asignados ({assignedAdvisors.length})
              </h3>

              {loadingAssignedAdvisors ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Cargando asesores asignados...
                </div>
              ) : assignedAdvisors.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
                  <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No hay asesores asignados a esta propiedad
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedAdvisors.map((advisor) => (
                    <div
                      key={advisor.id}
                      className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg group"
                    >
                      {/* Foto del asesor */}
                      {advisor.avatar_url ? (
                        <img
                          src={advisor.avatar_url}
                          alt={advisor.nombre}
                          className="w-12 h-12 rounded-full object-cover border-2 border-border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      {advisor.avatar_url ? null : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                      )}

                      {/* Información del asesor */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{advisor.nombre}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {advisor.telefono && (
                            <span className="truncate">{advisor.telefono}</span>
                          )}
                        </div>
                      </div>

                      {/* Botón eliminar */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAdvisor(advisor.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Agregar nuevo asesor */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Nuevo Asesor
              </h3>

              <div className="flex gap-2">
                <Select
                  value={selectedAdvisorId?.toString() || ""}
                  onValueChange={(value) => setSelectedAdvisorId(value ? Number(value) : null)}
                  disabled={loadingAdvisors}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={loadingAdvisors ? "Cargando asesores..." : "Seleccionar asesor"} />
                  </SelectTrigger>
                  <SelectContent>
                    {advisors
                      .filter(a => !assignedAdvisors.some(assigned => assigned.id === a.id))
                      .map((advisor) => (
                        <SelectItem key={advisor.id} value={advisor.id.toString()}>
                          <div className="flex items-center gap-2">
                            {advisor.avatar_url ? (
                              <img
                                src={advisor.avatar_url}
                                alt={advisor.nombre}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-3 w-3 text-primary" />
                              </div>
                            )}
                            <span>{advisor.nombre}</span>
                            {advisor.especialidad && (
                              <span className="text-muted-foreground text-xs ml-1">
                                ({advisor.especialidad})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleAssignAdvisor}
                  disabled={!selectedAdvisorId}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>

              {advisors.filter(a => !assignedAdvisors.some(assigned => assigned.id === a.id)).length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Todos los asesores activos ya están asignados a esta propiedad.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setAdvisorModalOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
