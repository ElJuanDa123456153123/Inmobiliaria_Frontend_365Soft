"use client"

import { useState, useEffect } from "react"
import { Search, UserCog, CheckCircle, XCircle, Trash2, Edit, Plus, User, Camera, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { api } from "@/lib/services/api"

interface User {
  id: number
  nombre: string
  email: string
  telefono: string
  rol: string
  activo: boolean
  verificado: boolean
  created_at: string
  apellido?: string
  nombre_inmobiliaria?: string
  nit?: string
  avatar_url?: string
}

export default function AdminAdvisorsPage() {
  const [advisors, setAdvisors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Estados para el modal de crear asesor
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    id: 0,
    nombre: "",
    email: "",
    password: "",
    telefono: "",
    rol: "agente",
    avatar_url: "",
    activo: true,
  })
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchAdvisors()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const fetchAdvisors = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Filtrar solo usuarios con rol "agente"
        const agentsOnly = (data.users || []).filter((user: User) => user.rol === "agente")
        console.log("📝 Asesores cargados:", agentsOnly.map((a: User) => ({ id: a.id, nombre: a.nombre, avatar_url: a.avatar_url })))
        setAdvisors(agentsOnly)
      } else {
        toast.error("Error al cargar asesores")
      }
    } catch (error: any) {
      toast.error(error.message || "Error al cargar asesores")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id: number) => {
    try {
      const token = localStorage.getItem("token")
      const user = advisors.find(a => a.id === id)
      if (!user) return

      const response = await fetch(`http://localhost:3001/api/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...user,
          activo: !user.activo
        })
      })

      if (response.ok) {
        toast.success("Asesor actualizado correctamente")
        fetchAdvisors()
      } else {
        toast.error("Error al actualizar asesor")
      }
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar asesor")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este asesor?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success("Asesor eliminado correctamente")
        fetchAdvisors()
      } else {
        toast.error("Error al eliminar asesor")
      }
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar asesor")
    }
  }

  const handleOpenCreateModal = () => {
    setFormData({
      id: 0,
      nombre: "",
      email: "",
      password: "",
      telefono: "",
      rol: "agente",
      avatar_url: "",
      activo: true,
    })
    setIsEditing(false)
    setImagenPreview(null)
    setImagenFile(null)
    setCreateModalOpen(true)
  }

  const handleOpenEditModal = (advisor: User) => {
    setFormData({
      id: advisor.id,
      nombre: advisor.nombre,
      email: advisor.email,
      password: "", // No mostrar contraseña al editar
      telefono: advisor.telefono,
      rol: advisor.rol,
      avatar_url: advisor.avatar_url || "",
      activo: advisor.activo,
    })
    setIsEditing(true)
    setImagenPreview(advisor.avatar_url || null)
    setImagenFile(null)
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
    // Solo validar contraseña al crear (no al editar)
    if (!isEditing && !formData.password.trim()) {
      toast.error("La contraseña es requerida")
      return
    }
    if (formData.password && formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    try {
      setCreateLoading(true)
      const token = localStorage.getItem("token")

      if (isEditing) {
        // Editar asesor existente
        const payload: any = {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          rol: formData.rol,
          activo: formData.activo
        }

        // Solo enviar contraseña si se proporciona
        if (formData.password) {
          payload.password = formData.password
        }

        // Subir nueva imagen si se seleccionó una
        if (imagenFile) {
          try {
            toast.info("Subiendo nueva imagen...")
            const uploadResult = await api.uploadAvatar(imagenFile)
            payload.avatar_url = uploadResult.url
            toast.success("Imagen actualizada correctamente")
          } catch (error: any) {
            toast.error(error.message || "Error al subir la imagen")
            return // Detener la actualización si falla la subida de imagen
          }
        } else if (formData.avatar_url) {
          // Mantener la imagen existente si no se seleccionó una nueva
          payload.avatar_url = formData.avatar_url
        }

        const response = await fetch(`http://localhost:3001/api/admin/users/${formData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })

        if (response.ok) {
          toast.success("Asesor actualizado exitosamente")
        } else {
          const data = await response.json()
          toast.error(data.error || "Error al actualizar asesor")
        }
      } else {
        // Crear nuevo asesor (usuario con rol agente)
        let avatarUrl = ""

        // Subir imagen si se seleccionó una
        if (imagenFile) {
          try {
            toast.info("Subiendo imagen...")
            const uploadResult = await api.uploadAvatar(imagenFile)
            avatarUrl = uploadResult.url
            toast.success("Imagen subida correctamente")
          } catch (error: any) {
            toast.error(error.message || "Error al subir la imagen")
            return // Detener la creación si falla la subida de imagen
          }
        }

        const response = await fetch("http://localhost:3001/api/admin/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            nombre: formData.nombre,
            email: formData.email,
            password: formData.password,
            telefono: formData.telefono,
            rol: formData.rol,
            avatar_url: avatarUrl || "", // Enviar cadena vacía si no hay imagen
            activo: formData.activo
          })
        })

        if (response.ok) {
          toast.success("Asesor creado exitosamente")
        } else {
          const data = await response.json()
          toast.error(data.error || "Error al crear asesor")
        }
      }

      setCreateModalOpen(false)
      setImagenPreview(null)
      setImagenFile(null)
      fetchAdvisors()
    } catch (error: any) {
      toast.error(error.message || "Error al guardar asesor")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleImagenUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen')
      return
    }

    // Validar tamaño (max 5MB para evitar problemas)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB')
      return
    }

    try {
      // Guardar el archivo original para subirlo al servidor
      setImagenFile(file)

      // Crear preview para mostrarlo en el modal
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagenPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)

      toast.success('Imagen seleccionada. Se guardará al crear el asesor.')
    } catch (error) {
      toast.error('Error al procesar la imagen')
    }
  }

  const handleRemoveImagen = () => {
    setImagenPreview(null)
    setImagenFile(null)
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
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-muted/30 border-b border-border text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {filteredAdvisors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <UserCog className="h-10 w-10 mb-3 opacity-50" />
                      <p className="text-base font-medium">No se encontraron asesores</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdvisors.map((advisor) => (
                  <tr key={advisor.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-muted-foreground">
                      #{advisor.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden border border-primary/20">
                          {advisor.avatar_url ? (
                            <img
                              src={advisor.avatar_url}
                              alt={advisor.nombre}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Si la imagen falla al cargar, mostrar iniciales
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          {!advisor.avatar_url && (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-bold text-sm">
                                {advisor.nombre ? advisor.nombre.charAt(0).toUpperCase() : 'A'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-foreground">{advisor.nombre}</div>
                          <div className="text-xs text-muted-foreground">{advisor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                      {advisor.telefono || 'Sin teléfono'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                        advisor.activo
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {advisor.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
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
                          onClick={() => handleOpenEditModal(advisor)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
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

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {filteredAdvisors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <UserCog className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-base font-medium">No se encontraron asesores</p>
            </div>
          ) : (
            filteredAdvisors.map((advisor) => (
              <div key={advisor.id} className="bg-background rounded-xl shadow-sm border border-border p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden border border-primary/20">
                    {advisor.avatar_url ? (
                      <img
                        src={advisor.avatar_url}
                        alt={advisor.nombre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    {!advisor.avatar_url && (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">
                          {advisor.nombre ? advisor.nombre.charAt(0).toUpperCase() : 'A'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{advisor.nombre}</div>
                    <div className="text-xs text-muted-foreground">{advisor.email}</div>
                    <div className="text-xs text-muted-foreground mt-1">#{advisor.id}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Teléfono:</span>
                    <span className="ml-1 text-foreground">{advisor.telefono || 'Sin teléfono'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estado:</span>
                    <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                      advisor.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {advisor.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
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
                    onClick={() => handleOpenEditModal(advisor)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
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
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal para crear/editar asesor */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              {isEditing ? "Editar Asesor" : "Nuevo Asesor"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Actualiza la información del asesor inmobiliario."
                : "Completa el formulario para registrar un nuevo asesor inmobiliario en el sistema."
              }
            </DialogDescription>
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

            {/* Foto de perfil */}
            <div className="space-y-2">
              <Label>Foto de Perfil</Label>
              <div className="flex items-center gap-4">
                {/* Preview circular */}
                <div className="relative w-24 h-24">
                  {imagenPreview ? (
                    <img
                      src={imagenPreview}
                      alt="Preview"
                      className="w-full h-full rounded-full object-cover border-4 border-border shadow-md"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-muted border-4 border-border flex items-center justify-center">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Controles */}
                <div className="flex-1 space-y-2">
                  <div>
                    <input
                      type="file"
                      id="imagen"
                      accept="image/*"
                      onChange={handleImagenUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('imagen')?.click()}
                      className="w-full"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Subir Foto
                    </Button>
                  </div>
                  {imagenPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImagen}
                      className="w-full text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Eliminar Foto
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Formatos: JPG, PNG, WEBP. Máximo 5MB (se convertirá a WEBP automáticamente)
                  </p>
                </div>
              </div>
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

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">
                {isEditing ? "Contraseña (dejar vacío para no cambiar)" : "Contraseña *"}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={isEditing ? "Nueva contraseña (opcional)" : "Mínimo 6 caracteres"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!isEditing}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                {isEditing
                  ? "Deja este campo vacío si no deseas cambiar la contraseña actual"
                  : "La contraseña debe tener al menos 6 caracteres"
                }
              </p>
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
                {createLoading
                  ? (isEditing ? "Actualizando..." : "Creando...")
                  : (isEditing ? "Guardar Cambios" : "Crear Asesor")
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
