"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { apiService, Notification } from "@/lib/services/api"
import { 
  Bell, Check, CheckSquare, Clock, CreditCard, 
  Filter, Home, Loader2, Search, Trash2, 
  User, UserPlus, AlertTriangle, Eye, ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotificacionesPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<boolean | undefined>(undefined) // undefined = all, true = read, false = unread
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/ingresar")
      return
    }

    try {
      setLoading(true)
      const res = await apiService.getNotifications(page, 20, filter)
      setNotifications(res.notifications || [])
      setTotalPages(res.total_pages || 1)
      setUnreadCount(res.unread_count || 0)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [page, filter])

  // Marcar una como leída
  const handleMarkAsRead = async (id: number) => {
    try {
      await apiService.markNotificationAsRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
      // Disparar evento para actualizar el header
      window.dispatchEvent(new Event("notifications-updated"))
      // Recargar contador local
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Marcar todas como leídas
  const handleMarkAllRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      window.dispatchEvent(new Event("notifications-updated"))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  // Obtener icono según el tipo de notificación
  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case "propiedad_aprobada":
        return <Check className="h-5 w-5 text-emerald-500" />
      case "propiedad_rechazada":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "propiedad_vencimiento":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "propiedad_desactivada":
        return <ShieldAlert className="h-5 w-5 text-orange-500" />
      case "nuevo_cliente":
        return <User className="h-5 w-5 text-blue-500" />
      case "propiedad_asignada":
        return <UserPlus className="h-5 w-5 text-violet-500" />
      case "pago_confirmado":
        return <CreditCard className="h-5 w-5 text-emerald-600" />
      case "busqueda_coincidencia":
        return <Search className="h-5 w-5 text-indigo-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  // Obtener estilo de fondo para el icono según el tipo
  const getIconBg = (tipo: string) => {
    switch (tipo) {
      case "propiedad_aprobada":
        return "bg-emerald-50"
      case "propiedad_rechazada":
        return "bg-red-50"
      case "propiedad_vencimiento":
        return "bg-amber-50"
      case "propiedad_desactivada":
        return "bg-orange-50"
      case "nuevo_cliente":
        return "bg-blue-50"
      case "propiedad_asignada":
        return "bg-violet-50"
      case "pago_confirmado":
        return "bg-emerald-50"
      case "busqueda_coincidencia":
        return "bg-indigo-50"
      default:
        return "bg-gray-50"
    }
  }

  // Obtener etiqueta legible para el tipo
  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "propiedad_aprobada":
        return "Aprobada"
      case "propiedad_rechazada":
        return "Rechazada"
      case "propiedad_vencimiento":
        return "Vencimiento"
      case "propiedad_desactivada":
        return "Desactivada"
      case "nuevo_cliente":
        return "Cliente Interesado"
      case "propiedad_asignada":
        return "Asignación"
      case "pago_confirmado":
        return "Pago Confirmado"
      case "busqueda_coincidencia":
        return "Búsqueda Guardada"
      default:
        return "Aviso"
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header de la sección */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Gestiona tus alertas, avisos de propiedades y estados de pago
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <Button 
                onClick={handleMarkAllRead} 
                variant="outline" 
                size="sm"
                className="self-start sm:self-center border-primary/20 text-primary hover:bg-primary/5 font-semibold"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
          </div>

          {/* Filtros de la lista */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-4 mb-6 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2 items-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Filtrar:
              </span>
              <button
                onClick={() => { setFilter(undefined); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === undefined 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => { setFilter(false); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  filter === false 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                No leídas
                {unreadCount > 0 && (
                  <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === false ? "bg-white text-primary" : "bg-primary/10 text-primary"}`}>
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => { setFilter(true); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === true 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Leídas
              </button>
            </div>

            <div className="text-xs text-muted-foreground">
              Mostrando página {page} de {totalPages}
            </div>
          </div>

          {/* Cuerpo de la lista */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`bg-white rounded-xl shadow-sm border border-border overflow-hidden transition-all duration-200 hover:shadow-md ${
                    !notif.is_read 
                      ? "border-l-4 border-l-primary" 
                      : "opacity-80"
                  }`}
                >
                  <div className="p-5 flex gap-4 items-start">
                    {/* Icono de notificación */}
                    <div className={`p-2.5 rounded-xl shrink-0 ${getIconBg(notif.tipo)}`}>
                      {getNotificationIcon(notif.tipo)}
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-800">
                          {getTipoLabel(notif.tipo)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notif.created_at).toLocaleDateString('es-BO')} a las {new Date(notif.created_at).toLocaleTimeString('es-BO', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-gray-900 mt-2 text-sm sm:text-base">
                        {notif.titulo || getTipoLabel(notif.tipo)}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {notif.mensaje}
                      </p>

                      {/* Botones de acción / enlaces profundos */}
                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        {notif.property_id && (
                          <Button
                            onClick={() => router.push(`/propiedades/${notif.property_id}`)}
                            size="sm"
                            variant="secondary"
                            className="bg-primary/5 text-primary hover:bg-primary/10 font-semibold"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver propiedad
                          </Button>
                        )}

                        {!notif.is_read && (
                          <Button
                            onClick={() => handleMarkAsRead(notif.id)}
                            size="sm"
                            variant="ghost"
                            className="text-gray-600 hover:bg-gray-100"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Marcar como leída
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Controles de Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                  >
                    Anterior
                  </Button>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      variant={page === i + 1 ? "default" : "outline"}
                      size="sm"
                      className="w-9 h-9 p-0"
                    >
                      {i + 1}
                    </Button>
                  ))}

                  <Button
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-border">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tienes notificaciones</h3>
              <p className="text-muted-foreground mb-6">
                {filter === undefined 
                  ? "Te mantendremos al tanto de cualquier novedad de tus propiedades." 
                  : "No encontramos notificaciones con el filtro seleccionado."}
              </p>
              <Button onClick={() => router.push('/')} size="lg">
                <Home className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
