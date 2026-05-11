"use client"

import { useState, useEffect } from "react"
import { Search, Shield, ShieldCheck, Trash2 } from "lucide-react"
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
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const itemsPerPage = 10

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
        // data usually contains user object
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

  const handleToggleActive = async (userId: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}/toggle-active`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchUsers()
      } else {
        alert("Error al actualizar usuario")
      }
    } catch (error) {
      alert("Error al conectar con el servidor")
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchUsers()
      } else {
        alert("Error al eliminar usuario")
      }
    } catch (error) {
      alert("Error al conectar con el servidor")
    }
  }

  const filteredUsers = users.filter(user => {
    // Solo mostrar usuarios normales, excluir admin, agentes e inmobiliarias
    const isNormalUser = user.rol === "usuario"
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.telefono.includes(searchTerm)
    return isNormalUser && matchesSearch
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-primary/5 via-background to-primary/5 text-muted-foreground">
        Cargando usuarios...
      </div>
    )
  }

  return (
    <div className="p-8 pb-20 min-h-full bg-gradient-to-br from-primary/5 via-background to-primary/5">
      {/* Header aligned with Login aesthetics */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground font-serif tracking-tight">Usuarios Registrados</h1>
        <p className="text-muted-foreground mt-2">Gestiona los usuarios normales que se registraron en la plataforma (excluye administradores y asesores)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Usuarios", count: users.filter(u => u.rol === "usuario").length, colorClass: "text-foreground", bgIcon: "bg-primary/10", iconColor: "text-primary", icon: Shield },
          { label: "Activos", count: users.filter(u => u.rol === "usuario" && u.activo).length, colorClass: "text-emerald-600", bgIcon: "bg-emerald-100", iconColor: "text-emerald-600", icon: ShieldCheck },
          { label: "Inactivos", count: users.filter(u => u.rol === "usuario" && !u.activo).length, colorClass: "text-destructive", bgIcon: "bg-destructive/10", iconColor: "text-destructive", icon: Shield },
          { label: "Verificados", count: users.filter(u => u.rol === "usuario" && u.verificado).length, colorClass: "text-blue-600", bgIcon: "bg-blue-100", iconColor: "text-blue-600", icon: ShieldCheck },
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
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              className="pl-9 bg-background focus-visible:ring-primary/20 border-border h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Registro</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Shield className="h-10 w-10 mb-3 opacity-50" />
                      <p className="text-base font-medium">No se encontraron usuarios</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((user) => (
                  <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-muted-foreground">
                      #{user.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                          <span className="text-primary font-bold text-sm">
                            {user.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-foreground">{user.nombre}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {user.telefono}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                        user.activo ? "bg-emerald-100 text-emerald-800" : "bg-destructive/10 text-destructive"
                      }`}>
                        {user.activo ? "Activo" : "Inactivo"}
                      </span>
                      {user.verificado && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800">
                          Verificado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("es-BO")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(user.id)}
                          className={user.activo ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"}
                          title={user.activo ? "Desactivar" : "Activar"}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        {user.id !== currentUserId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="bg-muted/10 px-6 py-4 flex items-center justify-between border-t border-border">
            <div className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{filteredUsers.length > 0 ? indexOfFirstItem + 1 : 0}</span> a{" "}
              <span className="font-medium text-foreground">{Math.min(indexOfLastItem, filteredUsers.length)}</span> de{" "}
              <span className="font-medium text-foreground">{filteredUsers.length}</span> usuarios
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
    </div>
  )
}
