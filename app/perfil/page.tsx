"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Home,
  Heart,
  Search,
  Clock,
  MessageCircle,
  HelpCircle,
  Settings,
  ChevronRight,
  Plus,
  Edit,
  MapPin,
  Image as ImageIcon,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { apiService, UserProfile, Property } from "@/lib/services/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { getImageUrl } from "@/lib/utils"

type TabType = 'resumen' | 'editar_perfil' | 'busquedas' | 'favoritos' | 'historial' | 'consultas'

export default function PerfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('resumen')
  const [properties, setProperties] = useState<Property[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [favorites, setFavorites] = useState<{ id: number, property_id: number, property: Property }[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(true)

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

  // Cargar datos del usuario desde el backend
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/ingresar")
        return
      }

      try {
        const userData = await apiService.getProfile()

        // Actualizar localStorage para mantener compatibilidad
        localStorage.setItem("userName", `${userData.nombre} ${userData.apellido}`.trim())
        localStorage.setItem("userEmail", userData.email)
        localStorage.setItem("userRole", userData.rol)

        setUser(userData)

        // Formatear fecha de nacimiento si existe
        let fechaNacimiento = ""
        if (userData.fecha_nacimiento) {
          const date = new Date(userData.fecha_nacimiento)
          const anio = date.getFullYear()
          const mes = String(date.getMonth() + 1).padStart(2, '0')
          const dia = String(date.getDate()).padStart(2, '0')
          fechaNacimiento = `${anio}-${mes}-${dia}`
        }

        setFormData({
          nombre: userData.nombre || "",
          apellido: userData.apellido || "",
          email: userData.email || "",
          telefono: userData.telefono || "",
          fecha_nacimiento: fechaNacimiento,
          sexo: userData.sexo || "",
          direccion: userData.direccion || "",
          ci: userData.ci || "",
          nueva_password: "",
          confirmar_password: ""
        })
      } catch (error) {
        console.error('Error cargando perfil:', error)
        toast.error('Error al cargar el perfil')
        router.push("/ingresar")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  // Cargar propiedades del usuario
  useEffect(() => {
    const fetchProperties = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const userProperties = await apiService.getMyProperties()
        console.log('Propiedades del usuario:', userProperties)
        console.log('Cantidad de propiedades:', userProperties.length)
        setProperties(userProperties)
      } catch (error) {
        console.error('Error cargando propiedades:', error)
      } finally {
        setLoadingProperties(false)
      }
    }

    fetchProperties()
  }, [])

  // Cargar propiedades favoritas del usuario
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        setLoadingFavorites(true)
        const res = await apiService.getFavorites()
        // Filtrar elementos que no tengan una propiedad válida
        const validFavorites = (res.favorites || []).filter(f => f.property)
        setFavorites(validFavorites)
      } catch (error) {
        console.error('Error cargando favoritos:', error)
      } finally {
        setLoadingFavorites(false)
      }
    }

    fetchFavorites()

    // Escuchar el evento de favoritos actualizados para recargar la lista
    window.addEventListener("favorites-updated", fetchFavorites)
    return () => {
      window.removeEventListener("favorites-updated", fetchFavorites)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userRole")
    router.push("/")
  }

  const handleSaveProfile = async () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    if (!formData.email.trim()) {
      toast.error('El email es requerido')
      return
    }

    // Validar contraseña si se proporciona
    if (formData.nueva_password) {
      if (formData.nueva_password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres')
        return
      }

      if (formData.nueva_password !== formData.confirmar_password) {
        toast.error('Las contraseñas no coinciden')
        return
      }
    }

    setSaving(true)

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono || '',
        fecha_nacimiento: formData.fecha_nacimiento || '',
        sexo: formData.sexo || '',
        direccion: formData.direccion || '',
        ci: formData.ci || '',
        avatar_url: '',
        nueva_password: formData.nueva_password || '',
      }

      const response = await apiService.updateProfile(payload)

      // Actualizar estado local
      setUser(response.user)

      // Actualizar localStorage
      localStorage.setItem("userName", `${response.user.nombre} ${response.user.apellido}`.trim())
      localStorage.setItem("userEmail", response.user.email)

      // Disparar evento para actualizar el header
      window.dispatchEvent(new Event("auth-change"))

      toast.success('Perfil actualizado exitosamente')

      // Limpiar campos de contraseña
      setFormData(prev => ({
        ...prev,
        nueva_password: "",
        confirmar_password: ""
      }))
    } catch (error: any) {
      console.error('Error guardando perfil:', error)
      toast.error(error.message || 'Error al actualizar el perfil')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'resumen' as TabType, label: 'Resumen', icon: User },
    { id: 'busquedas' as TabType, label: 'Mis Búsquedas', icon: Search },
    { id: 'favoritos' as TabType, label: 'Favoritos', icon: Heart },
    { id: 'historial' as TabType, label: 'Historial', icon: Clock },
    { id: 'consultas' as TabType, label: 'Consultas', icon: MessageCircle },
  ]

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

  const nombreCompleto = `${user.nombre} ${user.apellido}`.trim()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Menú de navegación */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-4">
                  {/* Avatar con nombre */}
                  <div className="flex flex-col items-center mb-6 pb-6 border-b">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-2xl font-bold mb-3">
                      {user.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900">{nombreCompleto}</h2>
                      <button
                        onClick={() => setActiveTab('editar_perfil')}
                        className="text-gray-400 hover:text-primary transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

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
              {activeTab === 'resumen' && (
                <div className="space-y-8">
                  {/* Mis Propiedades */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Home className="w-5 h-5" />
                        Mis Propiedades
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Botón para publicar */}
                        <div className="text-center space-y-4 p-6 bg-gray-50 rounded-lg">
                          <p className="text-muted-foreground">
                            ¿Querés vender o alquilar una propiedad?
                          </p>
                          <Button
                            onClick={() => router.push('/publicar')}
                            className="bg-primary hover:bg-primary/90"
                            size="lg"
                          >
                            Publicar una propiedad
                          </Button>
                        </div>

                        {/* Lista de propiedades */}
                        {loadingProperties ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          </div>
                        ) : properties.length > 0 ? (
                          <div className="space-y-3">
                            {properties.map((property) => {
                              // Obtener la imagen principal
                              const mainImage = property.imagenes && property.imagenes.length > 0
                                ? property.imagenes.find(img => img.principal) || property.imagenes[0]
                                : null

                              // Formatear precio
                              const moneda = property.moneda === 'BOB' ? 'Bs' : '$'
                              let precioFormateado = `${moneda} ${property.precio.toLocaleString()}`
                              if (property.tipo_operacion === 'alquiler') {
                                precioFormateado += '/mes'
                              } else if (property.tipo_operacion === 'anticretico') {
                                precioFormateado += ' Anticrético'
                              }

                              return (
                                <button
                                  key={property.id}
                                  onClick={() => router.push(`/propiedades/${property.id}`)}
                                  className="w-full text-left group"
                                >
                                  <Card className="transition-all hover:shadow-md hover:border-primary/50">
                                    <CardContent className="p-4">
                                      <div className="flex gap-4">
                                        {/* Imagen */}
                                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                                          {mainImage ? (
                                            <img
                                              src={getImageUrl(mainImage.image_url) || ''}
                                              alt={property.titulo}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                              <ImageIcon className="w-8 h-8 text-gray-400" />
                                            </div>
                                          )}
                                        </div>

                                        {/* Información */}
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors mb-1 truncate">
                                            {property.titulo}
                                          </h4>
                                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                                            <MapPin className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{property.zona}</span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-primary">
                                              {precioFormateado}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                              property.estado_propiedad === 'activo'
                                                ? 'bg-green-100 text-green-800'
                                                : property.estado_propiedad === 'vendido'
                                                ? 'bg-blue-100 text-blue-800'
                                                : property.estado_propiedad === 'inactivo'
                                                ? 'bg-gray-100 text-gray-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                              {property.estado_propiedad.charAt(0).toUpperCase() + property.estado_propiedad.slice(1)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </button>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 mb-1">No tienes propiedades publicadas</p>
                            <p className="text-sm text-gray-400">¡Comienza publicando tu primera propiedad!</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mis Consultas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Mis Consultas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-16">
                        <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                        <h3 className="text-xl font-semibold mb-3">TODAVÍA NO TIENES CONSULTAS</h3>
                        <p className="text-muted-foreground text-sm">
                          Cuando consultes sobre una propiedad, aparecerá aquí
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'editar_perfil' && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle>Editar mi perfil</CardTitle>
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
                            placeholder="Tu nombre"
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
                            placeholder="Tu apellido"
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
                            placeholder="tu@email.com"
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
                            placeholder="+591 XXXXXXXX"
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
                              className="px-3 py-2 border rounded-lg text-sm bg-white"
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
                              className="px-3 py-2 border rounded-lg text-sm bg-white"
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
                              className="px-3 py-2 border rounded-lg text-sm bg-white"
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
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
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
                            placeholder="Calle, número, ciudad"
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
                            placeholder="Número de carnet"
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
                            placeholder="Dejar en blanco para mantener la actual"
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
                            placeholder="Dejar en blanco para mantener la actual"
                          />
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="bg-primary hover:bg-primary/90"
                          type="submit"
                        >
                          {saving ? 'Guardando...' : 'Guardar'}
                        </Button>
                      </div>
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
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      Mis Favoritos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingFavorites ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : favorites.length > 0 ? (
                      <div className="space-y-3">
                        {favorites.map((fav) => {
                          const property = fav.property
                          if (!property) return null

                          // Obtener la imagen principal
                          const mainImage = property.imagenes && property.imagenes.length > 0
                            ? property.imagenes.find(img => img.principal) || property.imagenes[0]
                            : null

                          // Formatear precio
                          const moneda = property.moneda === 'BOB' ? 'Bs' : '$'
                          let precioFormateado = `${moneda} ${property.precio.toLocaleString()}`
                          if (property.tipo_operacion === 'alquiler') {
                            precioFormateado += '/mes'
                          } else if (property.tipo_operacion === 'anticretico') {
                            precioFormateado += ' Anticrético'
                          }

                          return (
                            <div key={property.id} className="relative group">
                              <button
                                onClick={() => router.push(`/propiedades/${property.id}`)}
                                className="w-full text-left"
                              >
                                <Card className="transition-all hover:shadow-md hover:border-primary/50">
                                  <CardContent className="p-4">
                                    <div className="flex gap-4">
                                      {/* Imagen */}
                                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                                        {mainImage ? (
                                          <img
                                            src={getImageUrl(mainImage.image_url) || ''}
                                            alt={property.titulo}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                            <ImageIcon className="w-8 h-8 text-gray-400" />
                                          </div>
                                        )}
                                      </div>

                                      {/* Información */}
                                      <div className="flex-1 min-w-0 pr-8">
                                        <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors mb-1 truncate">
                                          {property.titulo}
                                        </h4>
                                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                                          <MapPin className="w-4 h-4 flex-shrink-0" />
                                          <span className="truncate">{property.zona}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-lg font-bold text-primary">
                                            {precioFormateado}
                                          </span>
                                          <span className={`text-xs px-2 py-1 rounded-full ${
                                            property.estado_propiedad === 'activo'
                                              ? 'bg-green-100 text-green-800'
                                              : property.estado_propiedad === 'vendido'
                                              ? 'bg-blue-100 text-blue-800'
                                              : property.estado_propiedad === 'inactivo'
                                              ? 'bg-gray-100 text-gray-800'
                                              : 'bg-yellow-100 text-yellow-800'
                                          }`}>
                                            {property.estado_propiedad.charAt(0).toUpperCase() + property.estado_propiedad.slice(1)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </button>
                              
                              {/* Botón para quitar de favoritos */}
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  try {
                                    await apiService.removeFavorite(property.id)
                                    setFavorites(prev => prev.filter(f => f.property_id !== property.id))
                                    toast.success("Eliminado de favoritos")
                                    // Disparar evento para que otros componentes se enteren
                                    window.dispatchEvent(new Event("favorites-updated"))
                                  } catch (error) {
                                    console.error("Error al eliminar de favoritos:", error)
                                    toast.error("No se pudo eliminar de favoritos")
                                  }
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors z-10"
                                title="Quitar de favoritos"
                              >
                                <Heart className="w-5 h-5 fill-red-500" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-1">Aún no tienes propiedades favoritas</p>
                        <p className="text-sm text-gray-400 mb-4">Explora nuestras propiedades y guarda las que más te gusten</p>
                        <Button onClick={() => router.push('/')}>
                          Explorar propiedades
                        </Button>
                      </div>
                    )}
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
