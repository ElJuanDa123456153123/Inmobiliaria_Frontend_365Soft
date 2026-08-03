"use client"

import { useState, useEffect } from "react"
import { Search, Edit, Key, UserPlus, X, Check, Eye, EyeOff, Shield, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface User {
  id: number
  nombre: string
  email: string
  telefono: string
  rol: string
  activo: boolean
  verificado: boolean
  created_at: string
  nombre_inmobiliaria?: string
  nit?: string
  avatar_url?: string
}

export default function AccessManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const itemsPerPage = 10

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [formError, setFormError] = useState("")
  
  const [formData, setFormData] = useState({
    id: 0,
    nombre: "",
    email: "",
    password: "",
    telefono: "",
    rol: "agente",
    nombre_inmobiliaria: "",
    nit: "",
    activo: true
  })

  useEffect(() => {
    fetchUsers()
    fetchMe()
  }, [])

  const fetchMe = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        const me = data.user || data
        setCurrentUserId(me.id)
      }
    } catch (error) {
      console.error("Error fetching me:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        alert("Error al cargar usuarios")
      }
    } catch (error) {
      alert("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setFormData({
      id: 0,
      nombre: "",
      email: "",
      password: "",
      telefono: "",
      rol: "agente",
      nombre_inmobiliaria: "",
      nit: "",
      activo: true
    })
    setIsEditMode(false)
    setFormError("")
    setIsModalOpen(true)
    setShowPassword(false)
  }

  const openEditModal = (user: User) => {
    setFormData({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      password: "",
      telefono: user.telefono,
      rol: user.rol,
      nombre_inmobiliaria: user.nombre_inmobiliaria || "",
      nit: user.nit || "",
      activo: user.activo
    })
    setIsEditMode(true)
    setFormError("")
    setIsModalOpen(true)
    setShowPassword(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setSubmitLoading(true)

    try {
      const token = localStorage.getItem("token")
      const url = isEditMode 
        ? `http://localhost:3001/api/admin/users/${formData.id}` 
        : "http://localhost:3001/api/admin/users"
      
      const method = isEditMode ? "PUT" : "POST"

      const payload: any = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        rol: formData.rol,
        activo: formData.activo
      }

      if (formData.password) {
        payload.password = formData.password
      } else if (!isEditMode) {
        setFormError("La contraseña es requerida para el nuevo usuario")
        setSubmitLoading(false)
        return
      }

      if (formData.rol === "inmobiliaria") {
        payload.nombre_inmobiliaria = formData.nombre_inmobiliaria
        payload.nit = formData.nit
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        setIsModalOpen(false)
        fetchUsers()
      } else {
        setFormError(data.error || "Error al guardar el usuario")
      }
    } catch (error) {
      setFormError("Error al conectar con el servidor")
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este acceso? Esta acción no se puede deshacer.")) return;
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchUsers()
      } else {
        alert("Error al eliminar el usuario")
      }
    } catch (error) {
      alert("Error al conectar con el servidor")
    }
  }

  const filteredUsers = users.filter(user => {
    // Solo mostrar admin y agentes (agente)
    const isAllowedRole = user.rol === "admin" || user.rol === "agente"
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.rol.toLowerCase().includes(searchTerm.toLowerCase())
    return isAllowedRole && matchesSearch
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case "admin": return "bg-primary/10 text-primary border border-primary/20"
      case "agente": return "bg-blue-100 text-blue-800 border border-blue-200"
      case "inmobiliaria": return "bg-emerald-100 text-emerald-800 border border-emerald-200"
      default: return "bg-muted text-muted-foreground border border-border"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/5 via-background to-primary/5 text-muted-foreground">
        Cargando módulo de accesos...
      </div>
    )
  }

  return (
    <div className="p-8 pb-20 min-h-full bg-gradient-to-br from-primary/5 via-background to-primary/5">
      {/* Header aligned with Login aesthetics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-serif tracking-tight flex items-center gap-3">
            <Key className="h-8 w-8 text-primary" />
            Gestión de Accesos
          </h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-xl">
            Administra los accesos de administradores y asesores (agentes) al panel de control.
          </p>
        </div>
        <Button onClick={openCreateModal} size="lg" className="shadow-md">
          <UserPlus className="h-5 w-5 mr-2" />
          Crear Nuevo Acceso
        </Button>
      </div>

      <div className="bg-background rounded-xl shadow-sm border border-border overflow-hidden mb-6">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/20">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Buscar nombre, correo o rol..."
              className="pl-9 bg-background focus-visible:ring-primary/20 border-border h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            Mostrando <span className="text-foreground">{filteredUsers.length}</span> accesos
          </div>
        </div>

        {/* Users Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-muted/30 border-b border-border text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Registrado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Shield className="h-10 w-10 mb-3 opacity-50" />
                      <p className="text-base font-medium">No hay accesos encontrados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((user) => (
                  <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden border border-primary/20">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.nombre}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-bold text-sm">
                                {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-foreground">{user.nombre}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${getRoleBadgeColor(user.rol)}`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${user.activo ? 'bg-primary' : 'bg-destructive'}`}></div>
                        <span className="text-sm text-foreground font-medium">{user.activo ? 'Permitido' : 'Bloqueado'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("es-BO")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        onClick={() => openEditModal(user)}
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary"
                        title="Modificar Accesos"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.id !== currentUserId && (
                        <Button
                          onClick={() => handleDelete(user.id)}
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive ml-2"
                          title="Eliminar Acceso"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Shield className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-base font-medium">No hay accesos encontrados</p>
            </div>
          ) : (
            currentItems.map((user) => (
              <div key={user.id} className="bg-background rounded-xl shadow-sm border border-border p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden border border-primary/20">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.nombre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">
                          {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{user.nombre}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Rol:</span>
                    <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider ${getRoleBadgeColor(user.rol)}`}>
                      {user.rol}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Registrado:</span>
                    <span className="ml-1 text-foreground">{new Date(user.created_at).toLocaleDateString("es-BO")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${user.activo ? 'bg-primary' : 'bg-destructive'}`}></div>
                  <span className="text-sm text-foreground font-medium">{user.activo ? 'Permitido' : 'Bloqueado'}</span>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    onClick={() => openEditModal(user)}
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary"
                    title="Modificar Accesos"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {user.id !== currentUserId && (
                    <Button
                      onClick={() => handleDelete(user.id)}
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      title="Eliminar Acceso"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="bg-muted/10 px-6 py-4 flex items-center justify-between border-t border-border">
            <div className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{filteredUsers.length > 0 ? indexOfFirstItem + 1 : 0}</span> a{" "}
              <span className="font-medium text-foreground">{Math.min(indexOfLastItem, filteredUsers.length)}</span> de{" "}
              <span className="font-medium text-foreground">{filteredUsers.length}</span> accesos
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
              
              <div className="flex gap-1 overflow-x-auto max-w-[150px] sm:max-w-none">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="min-w-[32px]"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg shadow-xl rounded-xl bg-background border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground font-serif flex items-center gap-2">
                {isEditMode ? <Edit className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
                {isEditMode ? "Modificar Acceso" : "Nuevo Acceso"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              {formError && (
                <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-start gap-2">
                  <X className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>{formError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Nombre Completo</label>
                    <Input
                      required
                      placeholder="Ej. Juan Pérez"
                      className="h-10"
                      value={formData.nombre}
                      onChange={e => setFormData({...formData, nombre: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Correo Electrónico</label>
                    <Input
                      required
                      type="email"
                      placeholder="correo@ejemplo.com"
                      className="h-10"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Teléfono (Opcional)</label>
                    <Input
                      placeholder="+591 71234567"
                      className="h-10"
                      value={formData.telefono}
                      onChange={e => setFormData({...formData, telefono: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Rol de Sistema</label>
                    <select
                      className="w-full h-10 px-3 py-2 border border-input rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-ring focus:border-input"
                      value={formData.rol}
                      onChange={e => setFormData({...formData, rol: e.target.value})}
                    >
                      <option value="agente">Agente Inmobiliario (Asesor)</option>
                      <option value="admin">Administrador Total</option>
                    </select>
                  </div>
                </div>

                {formData.rol === "inmobiliaria" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Nombre Inmobiliaria</label>
                      <Input
                        required
                        placeholder="Real Estate Bo"
                        className="h-10"
                        value={formData.nombre_inmobiliaria}
                        onChange={e => setFormData({...formData, nombre_inmobiliaria: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">NIT</label>
                      <Input
                        placeholder="Número de NIT"
                        className="h-10"
                        value={formData.nit}
                        onChange={e => setFormData({...formData, nit: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-border">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {isEditMode ? "Nueva Contraseña" : "Contraseña"}
                    {isEditMode && <span className="text-xs text-muted-foreground ml-2 font-normal">(Opcional)</span>}
                  </label>
                  <div className="relative">
                    <Input
                      required={!isEditMode}
                      type={showPassword ? "text" : "password"}
                      placeholder={isEditMode ? "Dejar en blanco para no cambiar..." : "Contraseña segura..."}
                      className="h-10 pr-10"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.activo}
                        onChange={e => setFormData({...formData, activo: e.target.checked})}
                      />
                      <div className={`block w-11 h-6 rounded-full transition-colors ${formData.activo ? 'bg-primary' : 'bg-muted'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.activo ? 'transform translate-x-5' : ''}`}></div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground block">Permitir acceso al sistema</span>
                    </div>
                  </label>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-border">
                  <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitLoading} className="min-w-[140px]">
                    {submitLoading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin mr-2"></span>
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    {isEditMode ? "Guardar" : "Crear Acceso"}
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
