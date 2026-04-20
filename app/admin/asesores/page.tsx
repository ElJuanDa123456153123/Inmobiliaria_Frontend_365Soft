"use client"

import { useState, useEffect } from "react"
import { Search, UserCog, CheckCircle, XCircle, Trash2, Edit, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { adminApi, Advisor } from "@/lib/services/admin-api"
import { toast } from "sonner"

export default function AdminAdvisorsPage() {
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Estados para el modal de crear asesor
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    especialidad: "",
    activo: true,
  })

  useEffect(() => {
    fetchAdvisors()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const fetchAdvisors = async () => {
    try {
      setLoading(true)
      const data = await adminApi.listAdvisors({
        page: currentPage,
        limit: itemsPerPage,
      })
      setAdvisors(data.advisors)
    } catch (error: any) {
      toast.error(error.message || "Error al cargar asesores")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id: number) => {
    try {
      await adminApi.toggleAdvisorActive(id)
      toast.success("Asesor actualizado correctamente")
      fetchAdvisors()
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar asesor")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este asesor?")) return

    try {
      await adminApi.deleteAdvisor(id)
      toast.success("Asesor eliminado correctamente")
      fetchAdvisors()
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar asesor")
    }
  }

  const handleOpenCreateModal = () => {
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      especialidad: "",
      activo: true,
    })
    setCreateModalOpen(true)
  }

  const handleCreateAdvisor = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones básicas
    if (!formData.nombre.trim()) {
      toast.error("El nombre es requerido")
      return
    }
    if (!formData.email.trim()) {
      toast.error("El email es requerido")
      return
    }
    if (!formData.email.includes("@")) {
      toast.error("Email inválido")
      return
    }

    try {
      setCreateLoading(true)
      await adminApi.createAdvisor({
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono || undefined,
        especialidad: formData.especialidad || undefined,
        activo: formData.activo,
      })
      toast.success("Asesor creado exitosamente")
      setCreateModalOpen(false)
      fetchAdvisors()
    } catch (error: any) {
      toast.error(error.message || "Error al crear asesor")
    } finally {
      setCreateLoading(false)
    }
  }

  const filteredAdvisors = advisors.filter(advisor =>
    advisor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && advisors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-primary/5 via-background to-primary/5 text-muted-foreground">
        Cargando asesores...
      </div>
    )
  }

  return (
    <div className="p-8 pb-20 min-h-full bg-gradient-to-br from-primary/5 via-background to-primary/5">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-serif tracking-tight">Gestión de Asesores</h1>
          <p className="text-muted-foreground mt-2">Administra el directorio de asesores inmobiliarios</p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Asesor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Asesores", count: advisors.length, colorClass: "text-foreground", bgIcon: "bg-primary/10", iconColor: "text-primary", icon: UserCog },
          { label: "Activos", count: advisors.filter(a => a.activo).length, colorClass: "text-emerald-600", bgIcon: "bg-emerald-100", iconColor: "text-emerald-600", icon: CheckCircle },
          { label: "Inactivos", count: advisors.filter(a => !a.activo).length, colorClass: "text-red-600", bgIcon: "bg-red-100", iconColor: "text-red-600", icon: XCircle },
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

      {/* Main Table */}
      <div className="bg-background rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-border bg-muted/20">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="pl-9 bg-background focus-visible:ring-primary/20 border-border h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Advisors Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Especialidad</th>
                <th className="px-6 py-4">Propiedades</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {filteredAdvisors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <UserCog className="h-10 w-10 mb-3 opacity-50" />
                      <p className="text-base font-medium">No se encontraron asesores</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdvisors.map((advisor) => (
                  <tr key={advisor.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-muted-foreground">
                      #{advisor.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                          <span className="text-primary font-bold text-sm">
                            {advisor.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-foreground">{advisor.nombre}</div>
                          <div className="text-xs text-muted-foreground">{advisor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {advisor.telefono || 'Sin teléfono'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {advisor.especialidad ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800">
                          {advisor.especialidad}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {advisor.propiedades?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                        advisor.activo
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {advisor.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(advisor.id)}
                          title={advisor.activo ? "Desactivar" : "Activar"}
                          className={advisor.activo ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(advisor.id)}
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
      </div>

      {/* Modal para crear asesor */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Nuevo Asesor
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAdvisor} className="space-y-4 py-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Ej: Juan Pérez García"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                placeholder="Ej: +591 70000000"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>

            {/* Especialidad */}
            <div className="space-y-2">
              <Label htmlFor="especialidad">Especialidad</Label>
              <Input
                id="especialidad"
                name="especialidad"
                placeholder="Ej: Propiedades de Lujo, Ventas, Alquileres"
                value={formData.especialidad}
                onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Área de especialización del asesor (opcional)
              </p>
            </div>

            {/* Activo */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="activo">Asesor Activo</Label>
                <p className="text-xs text-muted-foreground">
                  Los asesores inactivos no aparecerán en las listas
                </p>
              </div>
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, activo: checked })
                }
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createLoading}
                className="flex-1"
              >
                {createLoading ? "Creando..." : "Crear Asesor"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
