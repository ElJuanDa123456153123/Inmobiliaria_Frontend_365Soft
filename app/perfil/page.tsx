"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Home,
  Eye,
  MessageSquare,
  Heart,
  Search,
  Clock,
  MessageCircle,
  HelpCircle,
  LogOut,
  Settings,
  ChevronRight,
  Plus,
  Edit,
  X,
  Calendar,
  MapPin as MapPinIcon,
  CreditCard,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface UserProfile {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  rol: string
  fecha_nacimiento?: string
  sexo?: string
  direccion?: string
  ci?: string
  nombre_inmobiliaria?: string
  nit?: string
  verificado: boolean
  activo: boolean
}

interface Property {
  id: number
  titulo: string
  precio: number
  tipo: string
  operacion: string
  ubicacion: string
  vistas: number
  contactos: number
  estado: 'publicada' | 'pausada' | 'en_revision'
  imagen?: string
}

type TabType = 'mi_perfil' | 'busquedas' | 'favoritos' | 'historial' | 'consultas'

export default function PerfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('mi_perfil')
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
    sexo: "",
    direccion: "",
    ci: "",
    nueva_password: "",
    confirmar_password: ""
  })

  const properties = [
    {
      id: 1,
      titulo: "Departamento en venta en Sopocachi",
      precio: 85000,
      tipo: "departamento",
      operacion: "venta",
      ubicacion: "Sopocachi, La Paz",
      vistas: 245,
      contactos: 12,
      estado: "publicada" as const
    },
    {
      id: 2,
      titulo: "Casa en alquiler en San Miguel",
      precio: 2500,
      tipo: "casa",
      operacion: "alquiler",
      ubicacion: "San Miguel, La Paz",
      vistas: 189,
      contactos: 8,
      estado: "publicada" as const
    },
    {
      id: 3,
      titulo: "Terreno en venta en Achumani",
      precio: 120000,
      tipo: "terreno",
      operacion: "venta",
      ubicacion: "Achumani, La Paz",
      vistas: 67,
      contactos: 3,
      estado: "pausada" as const
    }
  ]

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/ingresar")
      return
    }

    const userName = localStorage.getItem("userName")
    const userEmail = localStorage.getItem("userEmail")
    const userRole = localStorage.getItem("userRole")

    if (userName) {
      // Separar nombre y apellido
      const nameParts = userName.split(" ")
      const nombre = nameParts[0] || ""
      const apellido = nameParts.slice(1).join(" ") || ""

      setUser({
        id: 1,
        nombre: nombre,
        apellido: apellido,
        email: userEmail || "",
        telefono: "",
        rol: userRole || "usuario",
        verificado: true,
        activo: true
      })
      setFormData({
        nombre: nombre,
        apellido: apellido,
        email: userEmail || "",
        telefono: "",
        fecha_nacimiento: "",
        sexo: "",
        direccion: "",
        ci: "",
        nueva_password: "",
        confirmar_password: ""
      })
    }

    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userRole")
    router.push("/")
  }

  const handleEditProfile = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono || "",
        fecha_nacimiento: user.fecha_nacimiento || "",
        sexo: user.sexo || "",
        direccion: user.direccion || "",
        ci: user.ci || "",
        nueva_password: "",
        confirmar_password: ""
      })
    }
    setIsEditing(false)
  }

  const handleSaveProfile = () => {
    console.log("Guardando perfil:", formData)

    // Actualizar localStorage temporalmente
    const nombreCompleto = `${formData.nombre} ${formData.apellido}`.trim()
    localStorage.setItem("userName", nombreCompleto)
    localStorage.setItem("userEmail", formData.email)

    setUser(prev => prev ? {
      ...prev,
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      telefono: formData.telefono,
      fecha_nacimiento: formData.fecha_nacimiento,
      sexo: formData.sexo,
      direccion: formData.direccion,
      ci: formData.ci
    } : null)
    setIsEditing(false)

    // Disparar evento para actualizar el header
    window.dispatchEvent(new Event("auth-change"))
  }

  const tabs = [
    { id: 'mi_perfil' as TabType, label: 'Mi Perfil', icon: User },
    { id: 'busquedas' as TabType, label: 'Mis Búsquedas', icon: Search },
    { id: 'favoritos' as TabType, label: 'Favoritos', icon: Heart },
    { id: 'historial' as TabType, label: 'Historial', icon: Clock },
    { id: 'consultas' as TabType, label: 'Consultas', icon: MessageCircle },
  ]

  const getRoleBadge = (rol: string) => {
    const badges = {
      'admin': { label: 'Administrador', color: 'bg-purple-100 text-purple-700' },
      'agente': { label: 'Agente Inmobiliario', color: 'bg-blue-100 text-blue-700' },
      'inmobiliaria': { label: 'Inmobiliaria', color: 'bg-green-100 text-green-700' },
      'usuario': { label: 'Usuario', color: 'bg-gray-100 text-gray-700' }
    }
    return badges[rol as keyof typeof badges] || badges.usuario
  }

  const getStatusBadge = (estado: Property['estado']) => {
    const badges = {
      'publicada': { label: 'Publicada', color: 'bg-green-100 text-green-700' },
      'pausada': { label: 'Pausada', color: 'bg-yellow-100 text-yellow-700' },
      'en_revision': { label: 'En Revisión', color: 'bg-orange-100 text-orange-700' }
    }
    return badges[estado]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const roleBadge = getRoleBadge(user.rol)
  const nombreCompleto = `${user.nombre} ${user.apellido}`.trim()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Header del perfil con nombre y badge */}
        <div className="bg-gradient-to-r from-primary to-primary/90 text-white">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{nombreCompleto}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Menú de navegación */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-4">
                  <nav className="space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                            activeTab === tab.id
                              ? 'bg-primary text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{tab.label}</span>
                          {activeTab === tab.id && <ChevronRight className="w-5 h-5 ml-auto" />}
                        </button>
                      )
                    })}
                  </nav>

                  <div className="border-t mt-4 pt-4 space-y-1">
                    <button
                      onClick={() => router.push('/publicar')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Publicar propiedad</span>
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Configuración</span>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Soporte */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    ¿Necesitas ayuda?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Para contactarte con soporte técnico escríbenos un email y te responderemos a la brevedad.
                  </p>
                  <a href="mailto:info@365soft.com" className="text-primary hover:underline text-sm font-medium">
                    info@365soft.com
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Contenido principal */}
            <div className="lg:col-span-3">
              {activeTab === 'mi_perfil' && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle>Editar mi perfil</CardTitle>
                    {!isEditing && (
                      <Button
                        onClick={handleEditProfile}
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nombre */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Nombre <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Tu nombre"
                            className={!isEditing ? "bg-gray-50" : ""}
                          />
                        </div>

                        {/* Apellido */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Apellido <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={formData.apellido}
                            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Tu apellido"
                            className={!isEditing ? "bg-gray-50" : ""}
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={!isEditing}
                            placeholder="tu@email.com"
                            className={!isEditing ? "bg-gray-50" : ""}
                          />
                        </div>

                        {/* Teléfono */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Teléfono
                          </label>
                          <Input
                            type="tel"
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            disabled={!isEditing}
                            placeholder="+591 XXXXXXXX"
                            className={!isEditing ? "bg-gray-50" : ""}
                          />
                        </div>

                        {/* Fecha de nacimiento */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Fecha de nacimiento
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <select
                              value={formData.fecha_nacimiento?.split('-')[2] || ""}
                              onChange={(e) => {
                                const dia = e.target.value
                                const mes = formData.fecha_nacimiento?.split('-')[1] || ""
                                const anio = formData.fecha_nacimiento?.split('-')[0] || ""
                                setFormData({ ...formData, fecha_nacimiento: `${anio}-${mes}-${dia}` })
                              }}
                              disabled={!isEditing}
                              className={`px-3 py-2 border rounded-lg text-sm ${
                                !isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'
                              }`}
                            >
                              <option value="">Día</option>
                              {Array.from({ length: 31 }, (_, i) => (
                                <option key={i} value={String(i + 1).padStart(2, '0')}>
                                  {i + 1}
                                </option>
                              ))}
                            </select>
                            <select
                              value={formData.fecha_nacimiento?.split('-')[1] || ""}
                              onChange={(e) => {
                                const mes = e.target.value
                                const dia = formData.fecha_nacimiento?.split('-')[2] || ""
                                const anio = formData.fecha_nacimiento?.split('-')[0] || ""
                                setFormData({ ...formData, fecha_nacimiento: `${anio}-${mes}-${dia}` })
                              }}
                              disabled={!isEditing}
                              className={`px-3 py-2 border rounded-lg text-sm ${
                                !isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'
                              }`}
                            >
                              <option value="">Mes</option>
                              <option value="01">Enero</option>
                              <option value="02">Febrero</option>
                              <option value="03">Marzo</option>
                              <option value="04">Abril</option>
                              <option value="05">Mayo</option>
                              <option value="06">Junio</option>
                              <option value="07">Julio</option>
                              <option value="08">Agosto</option>
                              <option value="09">Septiembre</option>
                              <option value="10">Octubre</option>
                              <option value="11">Noviembre</option>
                              <option value="12">Diciembre</option>
                            </select>
                            <select
                              value={formData.fecha_nacimiento?.split('-')[0] || ""}
                              onChange={(e) => {
                                const anio = e.target.value
                                const mes = formData.fecha_nacimiento?.split('-')[1] || ""
                                const dia = formData.fecha_nacimiento?.split('-')[2] || ""
                                setFormData({ ...formData, fecha_nacimiento: `${anio}-${mes}-${dia}` })
                              }}
                              disabled={!isEditing}
                              className={`px-3 py-2 border rounded-lg text-sm ${
                                !isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'
                              }`}
                            >
                              <option value="">Año</option>
                              {Array.from({ length: 100 }, (_, i) => (
                                <option key={i} value={String(new Date().getFullYear() - i)}>
                                  {new Date().getFullYear() - i}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Sexo */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Sexo
                          </label>
                          <select
                            value={formData.sexo}
                            onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                            disabled={!isEditing}
                            className={`w-full px-3 py-2 border rounded-lg text-sm ${
                              !isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'
                            }`}
                          >
                            <option value="">Sin especificar</option>
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                          </select>
                        </div>

                        {/* Dirección */}
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium text-gray-700">
                            Dirección
                          </label>
                          <Input
                            value={formData.direccion}
                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Calle, número, ciudad"
                            className={!isEditing ? "bg-gray-50" : ""}
                          />
                        </div>

                        {/* C.I */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            C.I
                          </label>
                          <Input
                            value={formData.ci}
                            onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Número de carnet"
                            className={!isEditing ? "bg-gray-50" : ""}
                          />
                        </div>

                        {/* Nueva contraseña */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Nueva contraseña
                          </label>
                          <Input
                            type="password"
                            value={formData.nueva_password}
                            onChange={(e) => setFormData({ ...formData, nueva_password: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Dejar en blanco para mantener la actual"
                            className={!isEditing ? "bg-gray-50" : ""}
                          />
                        </div>

                        {/* Confirmar contraseña */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Confirmar contraseña
                          </label>
                          <Input
                            type="password"
                            value={formData.confirmar_password}
                            onChange={(e) => setFormData({ ...formData, confirmar_password: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Dejar en blanco para mantener la actual"
                            className={!isEditing ? "bg-gray-50" : ""}
                          />
                        </div>
                      </div>

                      {/* Botones de acción */}
                      {isEditing && (
                        <div className="flex gap-3 pt-4 border-t">
                          <Button
                            onClick={handleSaveProfile}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Guardar
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            type="button"
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Otras tabs (vacías por ahora) */}
              {activeTab === 'busquedas' && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Mis Búsquedas</h3>
                    <p className="text-muted-foreground mb-4">Guarda tus búsquedas favoritas para recibir alertas</p>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'favoritos' && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Mis Favoritos</h3>
                    <p className="text-muted-foreground mb-4">Aún no tienes propiedades favoritas</p>
                    <Button onClick={() => router.push('/')}>
                      Explorar propiedades
                    </Button>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'historial' && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Historial</h3>
                    <p className="text-muted-foreground mb-4">Tu historial de propiedades vistas</p>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'consultas' && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Mis Consultas</h3>
                    <p className="text-muted-foreground mb-4">Todavía no tienes consultas</p>
                    <p className="text-sm text-muted-foreground">
                      Cuando consultes sobre una propiedad, aparecerá aquí
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
