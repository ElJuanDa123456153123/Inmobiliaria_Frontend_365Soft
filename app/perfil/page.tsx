"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  ChevronLeft,
  Plus,
  Edit,
  MapPin,
  Image as ImageIcon,
  Bell,
  BellOff,
  Trash2,
  Eye,
  CreditCard,
  TrendingUp,
  Building2,
  Calendar,
  CheckCircle2,
  LayoutDashboard,
  BarChart3,
  KeyRound,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QrPagoCard } from "@/components/profile/qr-pago-card"
import { Input } from "@/components/ui/input"
import { apiService, UserProfile, Property, SavedSearch, ViewHistoryItem, Subscription, QrPago } from "@/lib/services/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { getImageUrl } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ExpiracionBadge } from "@/components/propiedades/ExpiracionBadge"
import { VisitasTab } from "@/components/profile/visitas-tab"

type TabType = 'resumen' | 'editar_perfil' | 'busquedas' | 'favoritos' | 'historial' | 'consultas' | 'suscripciones' | 'visitas'

function PerfilContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('resumen')
  const [properties, setProperties] = useState<Property[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [favorites, setFavorites] = useState<{ id: number, property_id: number, property: Property }[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(true)
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [loadingSearches, setLoadingSearches] = useState(true)
  const [viewHistory, setViewHistory] = useState<ViewHistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [historyPage, setHistoryPage] = useState(1)
  const [historyTotalPages, setHistoryTotalPages] = useState(1)
  const [historyTotal, setHistoryTotal] = useState(0)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [payments, setPayments] = useState<QrPago[]>([])
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [hasActiveProperties, setHasActiveProperties] = useState(false)
  const [activePropertiesCount, setActivePropertiesCount] = useState(0)

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

        console.log("🔍 fetchProfile - Datos recibidos:", userData)
        console.log("🔍 fetchProfile - user:", userData.user)
        console.log("🔍 fetchProfile - nombre:", userData.user?.nombre, "| apellido:", userData.user?.apellido)

        // Actualizar localStorage para mantener compatibilidad
        // Validar nombre y apellido antes de guardar para evitar "undefined undefined"
        const nombre = userData.user?.nombre?.trim() || ""
        const apellido = userData.user?.apellido?.trim() || ""
        const nombreCompleto = apellido ? `${nombre} ${apellido}`.trim() : nombre

        console.log("🔍 fetchProfile - Guardando en localStorage:", nombreCompleto)
        console.log("🔍 fetchProfile - nombre:", nombre, "| apellido:", apellido, "| nombreCompleto:", nombreCompleto)

        localStorage.setItem("userName", nombreCompleto)
        localStorage.setItem("userEmail", userData.user?.email)
        localStorage.setItem("userRole", userData.user?.rol)

        console.log("✅ localStorage actualizado - userName:", localStorage.getItem("userName"))

        setUser(userData.user)

        // Formatear fecha de nacimiento si existe
        let fechaNacimiento = ""
        if (userData.user?.fecha_nacimiento) {
          const date = new Date(userData.user.fecha_nacimiento)
          const anio = date.getFullYear()
          const mes = String(date.getMonth() + 1).padStart(2, '0')
          const dia = String(date.getDate()).padStart(2, '0')
          fechaNacimiento = `${anio}-${mes}-${dia}`
        }

        setFormData({
          nombre: userData.user?.nombre || "",
          apellido: userData.user?.apellido || "",
          email: userData.user?.email || "",
          telefono: userData.user?.telefono || "",
          fecha_nacimiento: fechaNacimiento,
          sexo: userData.user?.sexo || "",
          direccion: userData.user?.direccion || "",
          ci: userData.user?.ci || "",
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

  // Leer ?tab= del URL (para venir desde email o notificacion)
  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam === "visitas" || tabParam === "consultas" || tabParam === "historial" ||
        tabParam === "suscripciones" || tabParam === "favoritos" || tabParam === "busquedas") {
      setActiveTab(tabParam as TabType)
    }
  }, [searchParams])

  // Cargar propiedades del usuario
  useEffect(() => {
    const fetchProperties = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const userProperties = await apiService.getMyProperties()
        console.log('Propiedades del usuario:', userProperties)
        console.log('Cantidad de propiedades:', userProperties.properties?.length)
        setProperties(userProperties.properties || [])
      } catch (error) {
        console.error('Error cargando propiedades:', error)
      } finally {
        setLoadingProperties(false)
      }
    }

    fetchProperties()
  }, [])

  // Verificar si tiene propiedades activas para mostrar el Panel
  useEffect(() => {
    const checkActiveProperties = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const response = await fetch("http://localhost:3001/api/panel/dashboard", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          const count = data.propiedades_activas || 0
          setActivePropertiesCount(count)
          setHasActiveProperties(count > 0)
        } else if (response.status === 403) {
          setHasActiveProperties(false)
          setActivePropertiesCount(0)
        }
      } catch (error) {
        console.error("Error verificando propiedades activas:", error)
        setHasActiveProperties(false)
      }
    }

    checkActiveProperties()
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

  // Cargar búsquedas guardadas del usuario
  const fetchSavedSearches = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      setLoadingSearches(true)
      const res = await apiService.getSavedSearches()
      setSavedSearches(res.searches || [])
    } catch (error) {
      console.error('Error cargando búsquedas guardadas:', error)
    } finally {
      setLoadingSearches(false)
    }
  }

  useEffect(() => {
    fetchSavedSearches()

    window.addEventListener("saved-searches-updated", fetchSavedSearches)
    return () => {
      window.removeEventListener("saved-searches-updated", fetchSavedSearches)
    }
  }, [])

  // Cargar historial de vistas del usuario
  const fetchViewHistory = async (page: number = 1) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      setLoadingHistory(true)
      const res = await apiService.getViewHistory(page, 20)
      setViewHistory(res.views || [])
      setHistoryPage(res.page)
      setHistoryTotalPages(res.pages)
      setHistoryTotal(res.total)
    } catch (error) {
      console.error('Error cargando historial:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'historial') {
      fetchViewHistory(historyPage)
    }
  }, [activeTab, historyPage])

  // Cargar suscripción y pagos
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        // Cargar suscripción
        const subData = await apiService.getMySubscription()
        setSubscription(subData)
      } catch (error) {
        console.log('No tiene suscripción:', error)
        setSubscription(null)
      } finally {
        setLoadingSubscription(false)
      }

      try {
        // Cargar historial de pagos
        const paymentsData = await apiService.getMyPayments()
        setPayments(paymentsData.pagos || [])
      } catch (error) {
        console.error('Error cargando pagos:', error)
      } finally {
        setLoadingPayments(false)
      }
    }

    fetchSubscriptionData()
  }, [])

  // Formatear tiempo relativo ("Visto hace X minutos", "Visto ayer", etc.)
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return "Visto hace un momento"
    if (diffMins < 60) return `Visto hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`
    if (diffHours < 24) return `Visto hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    if (diffDays === 1) return "Visto ayer"
    if (diffDays < 7) return `Visto hace ${diffDays} días`
    if (diffDays < 30) return `Visto hace ${Math.floor(diffDays / 7)} ${Math.floor(diffDays / 7) === 1 ? 'semana' : 'semanas'}`
    return `Visto el ${date.toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }
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
      // Validar nombre y apellido antes de guardar para evitar "undefined undefined"
      const nombre = response.user.nombre?.trim() || ""
      const apellido = response.user.apellido?.trim() || ""
      const nombreCompleto = apellido ? `${nombre} ${apellido}`.trim() : nombre
      localStorage.setItem("userName", nombreCompleto)
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
    { id: 'suscripciones' as TabType, label: 'Suscripciones', icon: CreditCard },
    { id: 'historial' as TabType, label: 'Historial', icon: Clock },
    { id: 'consultas' as TabType, label: 'Consultas', icon: MessageCircle },
    { id: 'visitas' as TabType, label: 'Visitas', icon: Calendar },
  ]

  const getFilterChips = (filtros: any) => {
    if (!filtros) return []
    const chips: string[] = []
    
    const operation = filtros.tipo_operacion || filtros.operation
    if (operation && operation !== 'todas') {
      chips.push(`Operación: ${operation}`)
    }
    
    const type = filtros.tipo_propiedad || filtros.type
    if (type && type !== 'todas') {
      chips.push(`Tipo: ${type}`)
    }
    
    const zona = filtros.zona || filtros.search
    if (zona) {
      chips.push(`Zona: ${zona}`)
    }
    
    const priceMin = filtros.precio_min || filtros.priceMin
    const priceMax = filtros.precio_max || filtros.priceMax
    const moneda = filtros.moneda !== 'todas' ? (filtros.moneda === 'BOB' ? 'Bs' : 'USD') : ''
    if (priceMin || priceMax) {
      if (priceMin && priceMax) {
        chips.push(`Precio: ${priceMin} - ${priceMax} ${moneda}`)
      } else if (priceMin) {
        chips.push(`Precio Mín: >= ${priceMin} ${moneda}`)
      } else if (priceMax) {
        chips.push(`Precio Máx: <= ${priceMax} ${moneda}`)
      }
    }
    
    const bedrooms = filtros.dormitorios || filtros.bedrooms
    if (bedrooms && bedrooms !== 'todas') {
      chips.push(`Dormitorios: ${bedrooms}`)
    }
    
    const bathrooms = filtros.banos || filtros.bathrooms
    if (bathrooms && bathrooms !== 'todas') {
      chips.push(`Baños: ${bathrooms}`)
    }

    return chips
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

  // Validar nombre y apellido antes de mostrar para evitar "undefined undefined"
  const nombreCompleto = user.apellido?.trim()
    ? `${user.nombre || ''} ${user.apellido}`.trim()
    : (user.nombre?.trim() || 'Usuario')

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
                      {(user.nombre?.trim() || user.apellido?.trim() || 'U').charAt(0).toUpperCase()}
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
                      onClick={() => router.push('/mis-contratos')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      <KeyRound className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Mis contratos</span>
                      <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                    </button>
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

              {/* QR de cobros */}
              <div className="mt-4">
                <QrPagoCard />
              </div>

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
                  {/* Panel de Gestión - Solo mostrar si tiene propiedades activas */}
                  {hasActiveProperties && (
                    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <LayoutDashboard className="w-5 h-5 text-primary" />
                            <span className="text-lg">Panel de Gestión</span>
                          </div>
                          <Badge className="bg-primary text-primary-foreground">
                            {activePropertiesCount} {activePropertiesCount === 1 ? 'propiedad activa' : 'propiedades activas'}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">
                            Gestiona tus propiedades, contactos, visitas y más desde el panel de control.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                              onClick={() => router.push('/panel')}
                              className="bg-primary hover:bg-primary/90 flex-1"
                            >
                              <LayoutDashboard className="w-4 h-4 mr-2" />
                              Ir al Panel
                            </Button>
                            <Button
                              onClick={() => router.push('/panel/reportes')}
                              variant="outline"
                              className="flex-1"
                            >
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Ver Reportes
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                            <div className="flex items-center gap-2 text-sm">
                              <MessageCircle className="w-4 h-4 text-primary" />
                              <span className="text-muted-foreground">Contactos</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="text-muted-foreground">Visitas</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <TrendingUp className="w-4 h-4 text-primary" />
                              <span className="text-muted-foreground">Estadísticas</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

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
                                            <div className="flex items-center gap-2">
                                              <ExpiracionBadge fechaExpiracion={property.fecha_expiracion || null} />
                                              <span className={`text-xs px-2 py-1 rounded-full ${
                                                property.estado_propiedad === 'activo'
                                                  ? 'bg-green-100 text-green-800'
                                                  : property.estado_propiedad === 'vendido'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : property.estado_propiedad === 'inactivo'
                                                  ? 'bg-gray-100 text-gray-800'
                                                  : 'bg-yellow-100 text-yellow-800'
                                              }`}>
                                                {property.estado_propiedad ? (property.estado_propiedad.charAt(0).toUpperCase() + property.estado_propiedad.slice(1)) : 'Pendiente'}
                                              </span>
                                            </div>
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

              {/* Otras tabs */}
              {activeTab === 'busquedas' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-primary" />
                      Mis Búsquedas Guardadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingSearches ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : savedSearches.length > 0 ? (
                      <div className="space-y-4">
                        {savedSearches.map((search) => {
                          const chips = getFilterChips(search.filtros)
                          const matchesCount = search.matches_count !== undefined ? search.matches_count : 0

                          return (
                            <div
                              key={search.id}
                              className="p-4 border rounded-xl hover:shadow-md transition-all bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                            >
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-bold text-gray-900 text-base">{search.nombre}</h4>
                                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${search.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {search.is_active ? 'Alertas activas' : 'Alertas pausadas'}
                                  </span>
                                </div>

                                {/* Chips de filtros */}
                                <div className="flex flex-wrap gap-1.5">
                                  {chips.map((chip, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-block text-[11px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border"
                                    >
                                      {chip}
                                    </span>
                                  ))}
                                  {chips.length === 0 && (
                                    <span className="text-xs text-muted-foreground italic">Sin filtros específicos</span>
                                  )}
                                </div>

                                <p className="text-xs text-muted-foreground">
                                  Guardado el: {new Date(search.created_at).toLocaleDateString('es-BO')}
                                </p>
                              </div>

                              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                                {/* Contador de coincidencias */}
                                <div className="text-center sm:text-right md:text-center lg:text-right px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10 mr-0 sm:mr-2">
                                  <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Coincidencias</span>
                                  <span className="text-sm font-bold text-primary">{matchesCount} {matchesCount === 1 ? 'inmueble' : 'inmuebles'}</span>
                                </div>

                                {/* Botón Ver Coincidencias */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const params = new URLSearchParams()
                                    const filters = search.filtros
                                    if (filters) {
                                      const operation = filters.tipo_operacion || filters.operation
                                      if (operation && operation !== 'todas') params.append('operation', operation)
                                      
                                      const type = filters.tipo_propiedad || filters.type
                                      if (type && type !== 'todas') params.append('type', type)
                                      
                                      const searchVal = filters.zona || filters.search
                                      if (searchVal) params.append('search', searchVal)
                                      
                                      const priceMin = filters.precio_min || filters.priceMin
                                      if (priceMin) params.append('priceMin', String(priceMin))
                                      
                                      const priceMax = filters.precio_max || filters.priceMax
                                      if (priceMax) params.append('priceMax', String(priceMax))
                                      
                                      const bedrooms = filters.dormitorios || filters.bedrooms
                                      if (bedrooms && bedrooms !== 'todas') params.append('bedrooms', String(bedrooms))
                                    }
                                    router.push(`/propiedades?${params.toString()}`)
                                  }}
                                  className="flex items-center gap-1 text-xs"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Ver coincidencias
                                </Button>

                                {/* Botón Pausar/Activar */}
                                <Button
                                  variant={search.is_active ? "secondary" : "outline"}
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      const res = await apiService.toggleSavedSearch(search.id)
                                      setSavedSearches(prev => prev.map(s => s.id === search.id ? { ...s, is_active: res.saved_search.is_active } : s))
                                      toast.success(res.saved_search.is_active ? "Alertas activadas" : "Alertas pausadas")
                                    } catch (err) {
                                      toast.error("Error al cambiar estado de alertas")
                                    }
                                  }}
                                  className="flex items-center gap-1 text-xs"
                                >
                                  {search.is_active ? (
                                    <>
                                      <BellOff className="w-3.5 h-3.5" />
                                      Pausar
                                    </>
                                  ) : (
                                    <>
                                      <Bell className="w-3.5 h-3.5" />
                                      Activar
                                    </>
                                  )}
                                </Button>

                                {/* Botón Eliminar */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    if (confirm("¿Estás seguro de que quieres eliminar esta búsqueda guardada?")) {
                                      try {
                                        await apiService.deleteSavedSearch(search.id)
                                        setSavedSearches(prev => prev.filter(s => s.id !== search.id))
                                        toast.success("Búsqueda eliminada correctamente")
                                      } catch (err) {
                                        toast.error("Error al eliminar la búsqueda")
                                      }
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-1">Aún no tienes búsquedas guardadas</p>
                        <p className="text-sm text-gray-400 mb-4">Guarda tus búsquedas desde el buscador para recibir alertas al instante</p>
                        <Button onClick={() => router.push('/propiedades')}>
                          Ir al buscador
                        </Button>
                      </div>
                    )}
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
                                            {property.estado_propiedad ? (property.estado_propiedad.charAt(0).toUpperCase() + property.estado_propiedad.slice(1)) : 'Pendiente'}
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
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-xl font-bold">
                        <Clock className="w-5 h-5 text-primary" />
                        Historial de Propiedades Vistas
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {historyTotal === 0
                          ? "No has visto ninguna propiedad aún"
                          : `Has visto ${historyTotal} ${historyTotal === 1 ? 'propiedad' : 'propiedades'}`}
                      </p>
                    </div>
                    {viewHistory.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          if (confirm("¿Estás seguro de que deseas limpiar todo tu historial de vistas?")) {
                            try {
                              await apiService.clearViewHistory()
                              setViewHistory([])
                              setHistoryTotal(0)
                              setHistoryPage(1)
                              setHistoryTotalPages(1)
                              toast.success("Historial limpiado correctamente")
                            } catch (err) {
                              toast.error("Error al limpiar el historial")
                            }
                          }
                        }}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                        Limpiar Historial
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {loadingHistory ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : viewHistory.length > 0 ? (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          {viewHistory.map((item) => {
                            const property = item.property
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
                              <div key={item.id} className="relative group">
                                <button
                                  onClick={() => router.push(`/propiedades/${property.id}`)}
                                  className="w-full text-left"
                                >
                                  <Card className="transition-all hover:shadow-md hover:border-primary/50">
                                    <CardContent className="p-4">
                                      <div className="flex gap-4">
                                        {/* Imagen */}
                                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 relative">
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
                                        <div className="flex-1 min-w-0 pr-12">
                                          <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors mb-1 truncate text-base">
                                            {property.titulo}
                                          </h4>
                                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                                            <MapPin className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{property.zona}</span>
                                          </div>
                                          <div className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-primary" />
                                            <span>{formatTimeAgo(item.viewed_at)}</span>
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
                                              {property.estado_propiedad ? (property.estado_propiedad.charAt(0).toUpperCase() + property.estado_propiedad.slice(1)) : 'Pendiente'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </button>

                                {/* Botón para quitar del historial */}
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    try {
                                      await apiService.deleteViewHistoryItem(item.id)
                                      toast.success("Eliminado del historial")
                                      fetchViewHistory(historyPage)
                                    } catch (error) {
                                      console.error("Error al eliminar del historial:", error)
                                      toast.error("No se pudo eliminar del historial")
                                    }
                                  }}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors z-10"
                                  title="Eliminar del historial"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            )
                          })}
                        </div>

                        {/* Paginación */}
                        {historyTotalPages > 1 && (
                          <div className="flex items-center justify-center gap-2 pt-6 border-t">
                            <Button
                              variant="outline"
                              size="icon"
                              disabled={historyPage === 1}
                              onClick={() => setHistoryPage(prev => Math.max(prev - 1, 1))}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            
                            {Array.from({ length: historyTotalPages }, (_, i) => i + 1).map((p) => (
                              <Button
                                key={p}
                                variant={historyPage === p ? "default" : "outline"}
                                size="sm"
                                onClick={() => setHistoryPage(p)}
                                className="w-9 h-9 p-0"
                              >
                                {p}
                              </Button>
                            ))}

                            <Button
                              variant="outline"
                              size="icon"
                              disabled={historyPage === historyTotalPages}
                              onClick={() => setHistoryPage(prev => Math.min(prev + 1, historyTotalPages))}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-1">Aún no tienes historial de vistas</p>
                        <p className="text-sm text-gray-400 mb-4 font-medium">Explora propiedades para guardarlas automáticamente aquí</p>
                        <Button onClick={() => router.push('/propiedades')}>
                          Ver propiedades
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'suscripciones' && (
                <div className="space-y-6">
                  {/* Suscripción Actual */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Mi Suscripción Actual
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingSubscription ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      ) : subscription ? (
                        <div className="space-y-6">
                          {/* Métricas principales */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                <span className="text-sm text-gray-600">Disponibles</span>
                              </div>
                              <p className="text-3xl font-bold text-primary">
                                {(subscription.plan?.limite_propiedades || 0) - (subscription.propiedades_usadas || 0)}
                              </p>
                              <p className="text-xs text-gray-500">propiedades</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-4 border border-green-200">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-gray-600">Usadas</span>
                              </div>
                              <p className="text-3xl font-bold text-green-600">
                                {subscription.propiedades_usadas || 0}
                              </p>
                              <p className="text-xs text-gray-500">propiedades</p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4 border border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Home className="w-5 h-5 text-blue-600" />
                                <span className="text-sm text-gray-600">Total</span>
                              </div>
                              <p className="text-3xl font-bold text-blue-600">
                                {subscription.plan?.limite_propiedades || 0}
                              </p>
                              <p className="text-xs text-gray-500">en el plan</p>
                            </div>

                            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg p-4 border border-amber-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-5 h-5 text-amber-600" />
                                <span className="text-sm text-gray-600">Vigencia</span>
                              </div>
                              <p className="text-2xl font-bold text-amber-700">
                                {subscription.plan?.duracion_meses || 0} {(subscription.plan?.duracion_meses || 0) === 1 ? 'mes' : 'meses'}
                              </p>
                              <p className="text-xs text-gray-500">hasta el {new Date(subscription.fecha_fin).toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                          </div>

                          {/* Detalles del plan */}
                          <div className="border-t pt-6">
                            <h3 className="font-semibold text-gray-900 mb-4">{subscription.plan?.nombre || "Plan"}</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-gray-600">Precio pagado</span>
                                <span className="text-xl font-bold text-primary">
                                  Bs.{subscription.plan?.precio?.toLocaleString() || "0"}
                                </span>
                              </div>

                              {subscription.plan?.caracteristicas && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-700">Características incluidas:</p>
                                  <div className="grid md:grid-cols-2 gap-2">
                                    {subscription.plan.caracteristicas.split(',').map((caracteristica, index) => (
                                      <div key={index} className="flex items-start gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{caracteristica.trim()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-between items-center pt-3">
                                <span className="text-gray-600">Método de pago</span>
                                <Badge variant="outline">{subscription.plan?.metodo_pago || "QR"}</Badge>
                              </div>
                            </div>
                          </div>

                          {/* Botón para publicar */}
                          {((subscription.plan?.limite_propiedades || 0) - (subscription.propiedades_usadas || 0)) > 0 && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-green-800">¡Tienes publicaciones disponibles!</p>
                                  <p className="text-sm text-green-600">
                                    {((subscription.plan?.limite_propiedades || 0) - (subscription.propiedades_usadas || 0)) === 1
                                      ? "Te queda 1 propiedad disponible"
                                      : `Te quedan ${(subscription.plan?.limite_propiedades || 0) - (subscription.propiedades_usadas || 0)} propiedades disponibles`
                                    }
                                  </p>
                                </div>
                                <Button
                                  onClick={() => router.push('/publicar')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Home className="w-4 h-4 mr-2" />
                                  Publicar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">No tienes una suscripción activa</h3>
                          <p className="text-gray-500 mb-4">Selecciona un plan para comenzar a publicar tus propiedades</p>
                          <Button onClick={() => router.push('/planes')} className="bg-primary hover:bg-primary/90">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Ver Planes Disponibles
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Historial de Pagos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Historial de Pagos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingPayments ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      ) : payments.length > 0 ? (
                        <div className="space-y-3">
                          {payments.map((payment) => (
                            <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    payment.estado === 'PAGADO'
                                      ? 'bg-green-100 text-green-600'
                                      : payment.estado === 'PENDIENTE'
                                      ? 'bg-yellow-100 text-yellow-600'
                                      : 'bg-red-100 text-red-600'
                                  }`}>
                                    <CreditCard className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">Bs.{payment.monto?.toLocaleString() || "0"}</p>
                                    <p className="text-sm text-gray-500">Ref: {payment.alias}</p>
                                  </div>
                                </div>
                                <Badge
                                  variant={payment.estado === 'PAGADO' ? 'default' : 'secondary'}
                                  className={payment.estado === 'PAGADO' ? 'bg-green-600' : ''}
                                >
                                  {payment.estado}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500 mb-1">Fecha</p>
                                  <p className="font-medium">{new Date(payment.created_at).toLocaleDateString('es-BO')}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">Vencimiento</p>
                                  <p className="font-medium">{new Date(payment.fecha_vencimiento).toLocaleDateString('es-BO')}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">Plan</p>
                                  <p className="font-medium">{payment.plan_id ? `Plan #${payment.plan_id}` : 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">Método</p>
                                  <p className="font-medium">QR</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 mb-1">No tienes pagos registrados</p>
                          <p className="text-sm text-gray-400">Tus pagos aparecerán aquí</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'consultas' && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Mis Consultas</h3>
                    <p className="text-muted-foreground mb-4">Todavia no tienes consultas</p>
                    <p className="text-sm text-muted-foreground">
                      Cuando consultes sobre una propiedad, aparecera aqui
                    </p>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'visitas' && (
                <VisitasTab />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function PerfilPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <PerfilContent />
    </Suspense>
  )
}
