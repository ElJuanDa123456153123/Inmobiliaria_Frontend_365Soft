"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Share2,
  Phone,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  MessageSquare,
  X,
  Send,
  Image as ImageIcon,
  Paperclip,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { apiService, Property } from "@/lib/services/api"
import { toast } from "sonner"
import { getImageUrl } from "@/lib/utils"
import dynamic from "next/dynamic"
import { FavoriteButton } from "@/components/ui/favorite-button"
import DOMPurify from "dompurify"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
const WS_URL = API_URL.replace(/^http/, "ws")

// Cargar el mapa de forma dinámica para evitar problemas de SSR
const Mapa = dynamic(() => import("@/components/mapa/Mapa"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse rounded-lg" />
})

interface ChatMessage {
  id: number
  de_user_id: number
  para_user_id: number
  mensaje: string
  tipo_mensaje?: string
  archivo_url?: string
  archivo_nombre?: string
  created_at?: string
}

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Estados para el modal de chat
  const [modalChatAbierto, setModalChatAbierto] = useState(false)
  const [chatVendedorId, setChatVendedorId] = useState<number | null>(null)
  const [chatVendedorNombre, setChatVendedorNombre] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const [enviandoMensaje, setEnviandoMensaje] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [enviandoArchivo, setEnviandoArchivo] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [archivoPendiente, setArchivoPendiente] = useState<{ file: File; preview: string; isImage: boolean } | null>(null)
  const [mensajeArchivo, setMensajeArchivo] = useState("")

  // Estados para el modal de solicitud de visita
  const [modalVisitaAbierto, setModalVisitaAbierto] = useState(false)
  const [nombreVisita, setNombreVisita] = useState("")
  const [telefonoVisita, setTelefonoVisita] = useState("")
  const [horarioVisita, setHorarioVisita] = useState("")
  const [enviandoVisita, setEnviandoVisita] = useState(false)

  // Estados para el modal de solicitud de alquiler
  const [modalAlquilerAbierto, setModalAlquilerAbierto] = useState(false)
  const [mensajeAlquiler, setMensajeAlquiler] = useState("")
  const [telefonoAlquiler, setTelefonoAlquiler] = useState("")
  const [enviandoAlquiler, setEnviandoAlquiler] = useState(false)
  const [yaSolicito, setYaSolicito] = useState(false)

  // Refs para usar dentro del WebSocket sin reconectar
  const chatVendedorIdRef = useRef<number | null>(null)
  const currentUserIdRef = useRef<number | null>(null)
  const propertyIdRef = useRef<number | null>(null)

  // Función para abrir modal de chat
  const abrirModalChat = async (vendedorId: number, vendedorNombre: string, propertyId: number) => {
    const token = localStorage.getItem("token")

    if (!token) {
      toast.error("Debes iniciar sesión para enviar mensajes")
      router.push(`/ingresar?redirect=/propiedades/${params.id}`)
      return
    }

    // Obtener ID del usuario actual primero para verificar si es el propio vendedor
    let currentId: number | null = null
    try {
      const userResponse = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!userResponse.ok) {
        toast.error("No se pudo verificar tu sesión. Inicia sesión nuevamente.")
        router.push(`/ingresar?redirect=/propiedades/${params.id}`)
        return
      }

      const userData = await userResponse.json()
      currentId = userData.user?.id

      if (!currentId) {
        toast.error("No se pudo obtener tu información de usuario")
        return
      }

      // Verificar si el usuario está intentando enviarse mensaje a sí mismo
      if (currentId === vendedorId) {
        toast.error("No puedes enviarte mensajes a ti mismo")
        return
      }
    } catch (error) {
      console.error("Error verificando usuario:", error)
      toast.error("Error al verificar tu sesión")
      return
    }

    // Abrir modal solo si tenemos el ID de usuario confirmado
    setChatVendedorId(vendedorId)
    setChatVendedorNombre(vendedorNombre)
    setChatMessages([]) // Limpiar mensajes anteriores
    setCurrentUserId(currentId)
    setModalChatAbierto(true)

    // Cargar mensajes existentes
    try {
      const response = await fetch(`${API_URL}/api/panel/messages/thread/${vendedorId}?property_id=${propertyId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Validar que data.messages sea un array
        if (Array.isArray(data.messages)) {
          setChatMessages(data.messages.filter((m: ChatMessage) => m && m.id))
        }
      }
    } catch (error) {
      console.error("Error cargando mensajes:", error)
      toast.error("Error al cargar mensajes")
    }
  }

  // Función para enviar mensaje en el modal
  const enviarMensajeChat = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nuevoMensaje.trim() || !chatVendedorId || !property) {
      toast.error("Faltan datos para enviar el mensaje")
      return
    }

    setEnviandoMensaje(true)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        toast.error("Debes iniciar sesión para enviar mensajes")
        return
      }

      console.log("Enviando mensaje:", {
        para_user_id: chatVendedorId,
        property_id: property.id,
        mensaje: nuevoMensaje.trim()
      })

      const response = await fetch(`${API_URL}/api/panel/messages/send`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          para_user_id: chatVendedorId,
          property_id: property.id,
          mensaje: nuevoMensaje.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Mensaje enviado:", data)

        // El backend devuelve "mensaje" (en español), no "message"
        if (data.mensaje && data.mensaje.id) {
          setChatMessages(prev => [...prev, data.mensaje])
          setNuevoMensaje("")
          toast.success("Mensaje enviado")
        } else {
          console.error("Estructura de respuesta inválida:", data)
          toast.error("Error en la respuesta del servidor")
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }))
        console.error("Error del servidor:", errorData)
        toast.error(`Error al enviar mensaje: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error enviando mensaje:", error)
      toast.error("Error al enviar mensaje")
    } finally {
      setEnviandoMensaje(false)
    }
  }

  // Seleccionar archivo para previsualizar antes de enviar
  const seleccionarArchivoChat = (file: File) => {
    const isImage = file.type.startsWith("image/")
    const preview = isImage ? URL.createObjectURL(file) : ""
    setMensajeArchivo("")
    setArchivoPendiente({ file, preview, isImage })
  }

  // Cancelar envío de archivo
  const cancelarArchivoPendiente = () => {
    if (archivoPendiente?.preview) {
      URL.revokeObjectURL(archivoPendiente.preview)
    }
    setArchivoPendiente(null)
    setMensajeArchivo("")
  }

  // Confirmar y enviar archivo
  const confirmarArchivoChat = async () => {
    if (!archivoPendiente || !chatVendedorId || !property) return

    const { file } = archivoPendiente
    setEnviandoArchivo(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Debes iniciar sesión para enviar archivos")
        return
      }

      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch(`${API_URL}/api/panel/messages/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      })

      if (!uploadResponse.ok) {
        const errData = await uploadResponse.json().catch(() => ({ error: "Error al subir archivo" }))
        toast.error(errData.error || "Error al subir archivo")
        return
      }

      const uploadData = await uploadResponse.json()

      const sendResponse = await fetch(`${API_URL}/api/panel/messages/send`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          para_user_id: chatVendedorId,
          property_id: property.id,
          mensaje: mensajeArchivo.trim() || file.name,
          tipo_mensaje: uploadData.tipo_mensaje,
          archivo_url: uploadData.url,
          archivo_nombre: file.name
        })
      })

      if (sendResponse.ok) {
        const data = await sendResponse.json()
        if (data.mensaje && data.mensaje.id) {
          setChatMessages(prev => {
            if (prev.some(m => m.id === data.mensaje.id)) return prev
            return [...prev, data.mensaje]
          })
        }
        setTimeout(() => {
          const container = document.getElementById("chat-messages-container")
          if (container) container.scrollTop = container.scrollHeight
        }, 100)
      }
    } catch (error) {
      console.error("Error subiendo archivo:", error)
      toast.error("Error al subir archivo")
    } finally {
      setEnviandoArchivo(false)
      cancelarArchivoPendiente()
    }
  }

  // Función para iniciar conversación con el vendedor/asesor (MANTENIDA PARA COMPATIBILIDAD)
  const iniciarConversacion = (vendedorId: number, propertyId: number) => {
    abrirModalChat(vendedorId, property?.vendedor_nombre || "Vendedor", propertyId)
  }

  // Función para abrir modal de solicitud de visita
  const abrirModalVisita = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Debes iniciar sesión para solicitar una visita")
      router.push(`/ingresar?redirect=/propiedades/${params.id}`)
      return
    }
    setModalVisitaAbierto(true)
  }

  // Función para enviar solicitud de visita
  const handleSolicitarVisita = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!property) return
    if (!nombreVisita.trim() || !telefonoVisita.trim() || !horarioVisita) {
      toast.error("Por favor completa todos los campos")
      return
    }

    setEnviandoVisita(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/panel/visits`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          property_id: property.id,
          nombre_completo: nombreVisita,
          telefono: telefonoVisita,
          horario_preferido: horarioVisita
        })
      })

      if (response.ok) {
        toast.success("Solicitud de visita enviada correctamente")
        setModalVisitaAbierto(false)
        setNombreVisita("")
        setTelefonoVisita("")
        setHorarioVisita("")
      } else {
        const errData = await response.json().catch(() => ({ error: "Error al enviar solicitud" }))
        toast.error(errData.error || "Error al enviar solicitud")
      }
    } catch (error) {
      console.error("Error solicitando visita:", error)
      toast.error("Error al enviar solicitud de visita")
    } finally {
      setEnviandoVisita(false)
    }
  }

  // Función para abrir modal de solicitud de alquiler
  const abrirModalAlquiler = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Debes iniciar sesión para solicitar el alquiler")
      router.push(`/ingresar?redirect=/propiedades/${params.id}`)
      return
    }
    setModalAlquilerAbierto(true)
  }

  // Función para enviar solicitud de alquiler
  const handleSolicitarAlquiler = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!property) return
    if (!telefonoAlquiler.trim()) {
      toast.error("Por favor ingresa tu teléfono de contacto")
      return
    }

    setEnviandoAlquiler(true)

    try {
      await apiService.solicitarAlquiler(property.id, {
        mensaje: mensajeAlquiler.trim() || undefined,
        telefono_contacto: telefonoAlquiler.trim(),
      })
      toast.success("Solicitud enviada. El propietario será notificado")
      setModalAlquilerAbierto(false)
      setMensajeAlquiler("")
      setTelefonoAlquiler("")
      setYaSolicito(true)
    } catch (error) {
      console.error("Error solicitando alquiler:", error)
      toast.error(error instanceof Error ? error.message : "Error al enviar la solicitud")
    } finally {
      setEnviandoAlquiler(false)
    }
  }

  // Verificar usuario actual y si ya tiene una solicitud pendiente en esta propiedad
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const checkUser = async () => {
      try {
        const userResponse = await fetch(`${API_URL}/api/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (!userResponse.ok) return
        const userData = await userResponse.json()
        setCurrentUserId(userData.user?.id || null)
      } catch {
        // silencioso
      }

      try {
        const data = await apiService.getSolicitudesEnviadas("pendiente")
        if (data.solicitudes?.some((s) => String(s.property_id) === String(params.id))) {
          setYaSolicito(true)
        }
      } catch {
        // silencioso
      }
    }

    checkUser()
  }, [params.id])

  // Determinar si el botón de solicitar (alquiler o anticrético) debe mostrarse
  const esPropiedadAlquilable = Boolean(
    property &&
    (property.tipo_operacion === 'alquiler' || property.tipo_operacion === 'anticretico')
  )
  const mostrarBotonAlquiler = Boolean(
    property &&
    esPropiedadAlquilable &&
    property.estado_propiedad === 'activo' &&
    !property.alquilada &&
    currentUserId !== null &&
    currentUserId !== property.user_id &&
    !yaSolicito
  )
  const esAnticretico = property?.tipo_operacion === 'anticretico'

  // Función para parsear mensajes especiales (solicitud de visita)
  const parseMensajeEspecial = (mensaje: string) => {
    try {
      const data = JSON.parse(mensaje)
      if (data && typeof data === "object" && data.type) {
        return data
      }
      return null
    } catch {
      return null
    }
  }

  // WebSocket para recibir mensajes en tiempo real en el modal de chat
  useEffect(() => {
    chatVendedorIdRef.current = chatVendedorId
  }, [chatVendedorId])

  useEffect(() => {
    currentUserIdRef.current = currentUserId
  }, [currentUserId])

  useEffect(() => {
    propertyIdRef.current = property?.id ?? null
  }, [property])

  useEffect(() => {
    if (!modalChatAbierto || !chatVendedorId || !currentUserId) {
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      return
    }

    let reconnectTimeout: ReturnType<typeof setTimeout>
    let isMounted = true
    let reconnectAttempts = 0
    const MAX_RECONNECT_ATTEMPTS = 10

    const connect = () => {
      console.log("🔌 Conectando WebSocket para modal de chat...")
      const ws = new WebSocket(`${WS_URL}/ws?token=${token}`)

      ws.onopen = () => {
        console.log("✅ WebSocket conectado para modal de chat")
        reconnectAttempts = 0
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === "new_message" || data.type === "message_sent") {
            const mensaje = data.message?.message
            if (!mensaje) return

            const vendedorId = chatVendedorIdRef.current
            const userId = currentUserIdRef.current
            const propId = propertyIdRef.current

            // Verificar si el mensaje es de/para el vendedor con el que estamos chateando
            const esDeLaConversacion = (mensaje.de_user_id === vendedorId && mensaje.para_user_id === userId) ||
              (mensaje.de_user_id === userId && mensaje.para_user_id === vendedorId)
            const esDeLaPropiedad = !mensaje.property_id || mensaje.property_id === propId

            if (esDeLaConversacion && esDeLaPropiedad) {
              setChatMessages(prev => {
                if (prev.some(m => m.id === mensaje.id)) {
                  return prev
                }
                return [...prev, mensaje]
              })
              setTimeout(() => {
                const messagesContainer = document.getElementById("chat-messages-container")
                if (messagesContainer) {
                  messagesContainer.scrollTop = messagesContainer.scrollHeight
                }
              }, 100)
            }
          }
        } catch (err) {
          console.error("Error procesando mensaje WebSocket:", err)
        }
      }

      ws.onerror = (error) => {
        console.error("❌ WebSocket error en modal:", error)
      }

      ws.onclose = (event) => {
        console.log("🔌 WebSocket desconectado en modal:", event.code, event.reason)
        if (isMounted && event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
          reconnectAttempts++
          console.log(`🔌 Reconectando WebSocket en ${delay / 1000}s (intento ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`)
          reconnectTimeout = setTimeout(() => {
            connect()
          }, delay)
        }
      }

      return ws
    }

    const ws = connect()

    return () => {
      isMounted = false
      clearTimeout(reconnectTimeout)
      if (ws) {
        ws.close()
      }
    }
  }, [modalChatAbierto, chatVendedorId, currentUserId])

  // Cargar propiedad desde el backend
  useEffect(() => {
    const fetchProperty = async () => {
      const id = params.id
      if (!id) return

      try {
        const propertyData = await apiService.getProperty(parseInt(id as string))
        console.log("📝 Propiedad cargada:", {
          id: propertyData.id,
          titulo: propertyData.titulo,
          asesores_asignados: propertyData.asesores_asignados,
          num_asesores: propertyData.asesores_asignados?.length || 0
        })
        setProperty(propertyData)

        // Registrar vista automáticamente si el usuario está logueado
        const token = localStorage.getItem("token")
        if (token) {
          apiService.recordView(propertyData.id).catch(() => {
            // Silenciar errores de registro de vista para no molestar al usuario
          })
        }
      } catch (error) {
        console.error('Error cargando propiedad:', error)
        toast.error('Error al cargar la propiedad')
        router.push('/propiedades')
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [params.id, router])

  // Formatear precio
  const formatPrice = () => {
    if (!property) return ''

    const precio = property.precio
    const moneda = property.moneda === 'BOB' ? 'Bs' : '$'

    if (property.tipo_operacion === 'alquiler') {
      return `${moneda} ${precio.toLocaleString()}/mes`
    } else if (property.tipo_operacion === 'anticretico') {
      return `${moneda} ${precio.toLocaleString()} Anticrético`
    } else {
      return `${moneda} ${precio.toLocaleString()}`
    }
  }

  // Obtener imágenes
  const getImages = () => {
    if (!property?.imagenes || property.imagenes.length === 0) {
      return ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop"]
    }
    return property.imagenes.map(img => getImageUrl(img.image_url) || img.image_url)
  }

  const images = getImages()

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando propiedad...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!property) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Inicio</Link>
              <span className="mx-2">/</span>
              <Link href="/propiedades" className="hover:text-foreground">Propiedades</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{property.titulo}</span>
            </nav>
          </div>
        </div>

        {/* Gallery */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-muted">
              <img
                src={images[currentImageIndex]}
                alt={property.titulo}
                className="w-full h-full object-cover"
              />

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <FavoriteButton propertyId={property.id} className="rounded-full" />
                <Button size="icon" variant="secondary" className="rounded-full">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-video w-32 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Vista ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Property Details */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                          {property.titulo}
                        </h1>
                        {property.alquilada && (
                          <span className="mb-2 inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                            Alquilada
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{property.zona}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {formatPrice()}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {property.tipo_operacion}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex gap-6 py-4 border-y border-border">
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{property.dormitorios} Dormitorios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{property.banos} Baños</span>
                    </div>
                    {property.garaje && property.garaje !== "0" && (
                      <div className="flex items-center gap-2">
                        <Maximize className="h-5 w-5 text-primary" />
                        <span className="font-semibold">{property.garaje} Garaje(s)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Maximize className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{property.metros_edificados}m²</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Descripción</h2>
                  <div
                    className="text-muted-foreground leading-relaxed [&_p]:mb-4 [&_p]:last:mb-0"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(property.descripcion) }}
                  />
                </div>

                {/* Condiciones de alquiler / anticrético */}
                {property.tipo_operacion === 'alquiler' && (property.deposito || property.plazo_minimo || (property.servicios_incluidos && property.servicios_incluidos.length > 0)) && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Condiciones de alquiler</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {property.deposito && (
                        <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                          <span className="text-muted-foreground">Depósito de garantía</span>
                          <span className="font-semibold capitalize">{property.deposito}</span>
                        </div>
                      )}
                      {property.plazo_minimo && (
                        <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                          <span className="text-muted-foreground">Plazo mínimo</span>
                          <span className="font-semibold capitalize">{property.plazo_minimo}</span>
                        </div>
                      )}
                      {property.servicios_incluidos && property.servicios_incluidos.length > 0 && (
                        <div className="sm:col-span-2">
                          <p className="text-sm text-muted-foreground mb-2">Servicios incluidos</p>
                          <div className="flex flex-wrap gap-2">
                            {property.servicios_incluidos.map((servicio, index) => (
                              <span key={index} className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 text-sm capitalize">
                                <Check className="h-3.5 w-3.5" />
                                {servicio.replace(/-/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Condiciones del anticrético */}
                {property.tipo_operacion === 'anticretico' && (property.duracion_contrato || property.opcion_compra) && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Condiciones del anticrético</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {property.duracion_contrato && (
                        <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                          <span className="text-muted-foreground">Duración del contrato</span>
                          <span className="font-semibold capitalize">{property.duracion_contrato}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                        <span className="text-muted-foreground">Opción de compra</span>
                        <span className="font-semibold">{property.opcion_compra ? "Sí" : "No"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confort y Seguridad */}
                {property.confort && Array.isArray(property.confort) && property.confort.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Confort</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {property.confort.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500 shrink-0" />
                          <span className="capitalize">{item.replace(/-/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {property.seguridad && Array.isArray(property.seguridad) && property.seguridad.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Seguridad</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {property.seguridad.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0" />
                          <span className="capitalize">{item.replace(/-/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Características</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {property.ano_construccion && (
                      <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                        <span className="text-muted-foreground">Año de construcción</span>
                        <span className="font-semibold">{property.ano_construccion}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                      <span className="text-muted-foreground">Estado</span>
                      <span className="font-semibold capitalize">{property.estado}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                      <span className="text-muted-foreground">Tipo de propiedad</span>
                      <span className="font-semibold capitalize">{property.tipo_propiedad}</span>
                    </div>
                    {property.metros_terreno > 0 && (
                      <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                        <span className="text-muted-foreground">Metros de terreno</span>
                        <span className="font-semibold">{property.metros_terreno}m²</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                      <span className="text-muted-foreground">Pisos</span>
                      <span className="font-semibold">{property.cantidad_pisos}</span>
                    </div>
                    {property.apto_oficina && (
                      <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                        <span className="text-muted-foreground">Apto oficina</span>
                        <span className="font-semibold">Sí</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                {property.latitud && property.longitud && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Ubicación</h2>
                    <div
                      className="relative rounded-lg overflow-hidden border border-border cursor-pointer group"
                      onClick={() => router.push(`/propiedades/${params.id}/mapa`)}
                    >
                      <div className="aspect-video w-full bg-muted">
                        <Mapa
                          latitud={property.latitud}
                          longitud={property.longitud}
                          zoom={15}
                          height="100%"
                          interactive={false}
                          showMarker={true}
                        />
                      </div>
                      {/* Overlay con hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                        <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                          <ExternalLink className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Click para ver mapa completo</span>
                        </div>
                      </div>
                    </div>
                    {property.direccion && (
                      <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {property.direccion}, {property.zona}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar - Contact Card */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-6">
                  {/* Asesores Asignados - COMENTADO TEMPORALMENTE - Enviar siempre al dueño
                  {property.asesores_asignados && property.asesores_asignados.length > 0 ? (
                    <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                      <h3 className="font-semibold text-lg mb-4">Contactar Asesor</h3>

                      <div className="space-y-4">
                        {property.asesores_asignados.map((asignacion) => {
                          const asesor = asignacion.asesor
                          if (!asesor) return null

                          return (
                            <div key={asignacion.id} className="space-y-4">
                              <div
                                className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border"
                              >
                                {asesor.avatar_url || asesor.imagen_url ? (
                                  <img
                                    src={getImageUrl(asesor.avatar_url || asesor.imagen_url) || asesor.avatar_url || asesor.imagen_url}
                                    alt={asesor.nombre}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-primary flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 text-white text-xl font-bold">
                                    {asesor.nombre ? asesor.nombre.charAt(0).toUpperCase() : 'A'}
                                  </div>
                                )}

                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-base">{asesor.nombre}</p>
                                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                                    {asesor.especialidad && (
                                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                        {asesor.especialidad}
                                      </span>
                                    )}
                                  </div>
                                  {asesor.telefono && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                      <Phone className="h-3 w-3" />
                                      <span>{asesor.telefono}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3">
                                {asesor.telefono && (
                                  <Button className="w-full" size="lg" asChild>
                                    <a href={`tel:${asesor.telefono}`}>
                                      <Phone className="h-4 w-4 mr-2" />
                                      Llamar ahora
                                    </a>
                                  </Button>
                                )}
                                {asesor.email && (
                                  <Button
                                    className="w-full"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => iniciarConversacion(asesor.id, property.id)}
                                  >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Enviar mensaje
                                  </Button>
                                )}
                                <Button className="w-full" variant="outline" size="lg">
                                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                  </svg>
                                  WhatsApp
                                </Button>
                              </div>

                              {(asesor.telefono || asesor.email) && (
                                <div className="pt-4 border-t border-border space-y-2 text-sm">
                                  {asesor.telefono && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Phone className="h-4 w-4" />
                                      <span>{asesor.telefono}</span>
                                    </div>
                                  )}
                                  {asesor.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Mail className="h-4 w-4" />
                                      <span>{asesor.email}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : */}
                    <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                      <h3 className="font-semibold text-lg mb-4">Contactar Dueño</h3>

                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-2xl font-bold">
                          {property.vendedor_nombre ? property.vendedor_nombre.charAt(0) : 'V'}
                        </div>
                        <div>
                          <div className="font-semibold">{property.vendedor_nombre}</div>
                          <div className="text-sm text-muted-foreground">
                            {property.vendedor_contacto || "Propietario"}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {mostrarBotonAlquiler && (
                          <Button className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg" onClick={abrirModalAlquiler}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {esAnticretico ? "Solicitar Anticrético" : "Solicitar Alquiler"}
                          </Button>
                        )}
                        {yaSolicito && esPropiedadAlquilable && !property.alquilada && (
                          <div className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg px-4 py-3 text-sm text-center font-medium">
                            Solicitud de alquiler enviada. El propietario la revisará pronto.
                          </div>
                        )}
                        {property.vendedor_telefono && (
                          <Button className="w-full" size="lg" asChild>
                            <a href={`tel:${property.vendedor_telefono}`}>
                              <Phone className="h-4 w-4 mr-2" />
                              Llamar ahora
                            </a>
                          </Button>
                        )}
                        {property.vendedor_email && (
                          <Button
                            className="w-full"
                            variant="outline"
                            size="lg"
                            onClick={() => iniciarConversacion(property.user_id, property.id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Enviar mensaje
                          </Button>
                        )}
                        <Button
                          className="w-full"
                          variant="outline"
                          size="lg"
                          onClick={abrirModalVisita}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Solicitar Visita
                        </Button>
                        <Button className="w-full" variant="outline" size="lg">
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          WhatsApp
                        </Button>
                      </div>

                      <div className="pt-4 border-t border-border space-y-2 text-sm">
                        {property.vendedor_telefono && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{property.vendedor_telefono}</span>
                          </div>
                        )}
                        {property.vendedor_horario && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{property.vendedor_horario}</span>
                          </div>
                        )}
                      </div>
                    </div>

                  {/* Publication Date */}
                  {property.fecha_publicacion && (
                    <div className="bg-card rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Publicado el {new Date(property.fecha_publicacion).toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Modal de Chat Emergente */}
      {modalChatAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            {/* Header del modal */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Chat con {chatVendedorNombre}</h3>
                {property && (
                  <p className="text-sm text-gray-600">{property.titulo}</p>
                )}
              </div>
              <button
                onClick={() => setModalChatAbierto(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mensajes */}
            <div id="chat-messages-container" className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No hay mensajes aún</p>
                  <p className="text-sm mt-1">¡Sé el primero en saludar!</p>
                </div>
              ) : (
                chatMessages.map((message, index) => {
                  // Validar que el mensaje tenga las propiedades necesarias
                  if (!message || !message.id) {
                    console.error("Mensaje inválido:", message)
                    return null
                  }

                  const isFromMe = message.de_user_id === currentUserId
                  const mensajeEspecial = parseMensajeEspecial(message.mensaje || "")
                  const esVisitRequest = mensajeEspecial?.type === "VISIT_REQUEST"

                  return (
                    <div
                      key={message.id || index}
                      className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isFromMe
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}>
                        {esVisitRequest ? (
                          <div className="space-y-2">
                            <div className="border-b border-gray-300/30 pb-2">
                              <p className="text-sm font-semibold flex items-center gap-1">
                                📅 {isFromMe ? "Solicitud de Visita Enviada" : "Solicitud de Visita"}
                              </p>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p><strong>Cliente:</strong> {mensajeEspecial.cliente_nombre}</p>
                              <p><strong>Teléfono:</strong> {mensajeEspecial.cliente_telefono}</p>
                              <p><strong>Horario preferido:</strong> {mensajeEspecial.horario_preferido}</p>
                            </div>
                            {message.created_at && (
                              <p className={`text-xs ${isFromMe ? "text-blue-200" : "text-gray-500"}`}>
                                {new Date(message.created_at).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        ) : message.tipo_mensaje === "imagen" && message.archivo_url ? (
                          <div className="space-y-2">
                            <a
                              href={message.archivo_url.startsWith("http") ? message.archivo_url : `${API_URL}${message.archivo_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={message.archivo_url.startsWith("http") ? message.archivo_url : `${API_URL}${message.archivo_url}`}
                                alt={message.archivo_nombre || "Imagen"}
                                className="rounded-lg max-w-full max-h-60 object-cover"
                              />
                            </a>
                            {message.mensaje && message.mensaje !== message.archivo_nombre && (
                              <p className="text-sm">{message.mensaje}</p>
                            )}
                            {message.created_at && (
                              <p className={`text-xs mt-1 ${isFromMe ? "text-blue-200" : "text-gray-500"}`}>
                                {new Date(message.created_at).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        ) : message.tipo_mensaje === "documento" && message.archivo_url ? (
                          <div className="space-y-2">
                            <a
                              href={message.archivo_url.startsWith("http") ? message.archivo_url : `${API_URL}${message.archivo_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 p-2 rounded-lg ${
                                isFromMe ? "bg-blue-500/30 hover:bg-blue-500/50" : "bg-gray-200 hover:bg-gray-300"
                              } transition-colors`}
                            >
                              <Paperclip className="h-5 w-5 shrink-0" />
                              <span className="text-sm truncate flex-1">{message.archivo_nombre || "Documento"}</span>
                              <Download className="h-4 w-4 shrink-0" />
                            </a>
                            {message.mensaje && message.mensaje !== message.archivo_nombre && (
                              <p className="text-sm">{message.mensaje}</p>
                            )}
                            {message.created_at && (
                              <p className={`text-xs mt-1 ${isFromMe ? "text-blue-200" : "text-gray-500"}`}>
                                {new Date(message.created_at).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        ) : (
                          <>
                            <p className="text-sm">{message.mensaje || "Mensaje sin texto"}</p>
                            {message.created_at && (
                              <p className={`text-xs mt-1 ${
                                isFromMe ? "text-blue-200" : "text-gray-500"
                              }`}>
                                {new Date(message.created_at).toLocaleTimeString('es-BO', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Input de mensaje */}
            <form onSubmit={enviarMensajeChat} className="p-4 border-t border-gray-200">
              <div className="flex gap-2 items-center">
                {/* Botón subir imagen */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) seleccionarArchivoChat(file)
                    e.target.value = ""
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={enviandoArchivo || enviandoMensaje}
                  title="Enviar imagen"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>

                {/* Botón subir documento */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) seleccionarArchivoChat(file)
                    e.target.value = ""
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={enviandoArchivo || enviandoMensaje}
                  title="Enviar documento"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                <input
                  type="text"
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  placeholder={enviandoArchivo ? "Subiendo archivo..." : "Escribe un mensaje..."}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={enviandoMensaje || enviandoArchivo}
                />
                <Button
                  type="submit"
                  disabled={!nuevoMensaje.trim() || enviandoMensaje || enviandoArchivo}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {enviandoMensaje ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Previsualización de Archivo */}
      {archivoPendiente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Enviar archivo
              </h3>

              {/* Previsualización */}
              <div className="mb-4">
                {archivoPendiente.isImage ? (
                  <img
                    src={archivoPendiente.preview}
                    alt="Preview"
                    className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <Paperclip className="h-10 w-10 text-gray-400" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {archivoPendiente.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(archivoPendiente.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mensaje opcional */}
              <input
                type="text"
                value={mensajeArchivo}
                onChange={(e) => setMensajeArchivo(e.target.value)}
                placeholder="Agregar un mensaje (opcional)..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />

              {/* Botones */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelarArchivoPendiente}
                  disabled={enviandoArchivo}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={confirmarArchivoChat}
                  disabled={enviandoArchivo}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {enviandoArchivo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Enviar"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Solicitud de Visita */}
      {modalVisitaAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Solicitar Visita
                </h3>
                <button
                  onClick={() => setModalVisitaAbierto(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {property && (
                <p className="text-sm text-gray-600 mb-4">
                  Propiedad: <strong>{property.titulo}</strong>
                </p>
              )}

              <form onSubmit={handleSolicitarVisita} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tu nombre completo *
                  </label>
                  <input
                    type="text"
                    value={nombreVisita}
                    onChange={(e) => setNombreVisita(e.target.value)}
                    placeholder="Juan Pérez"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tu teléfono *
                  </label>
                  <input
                    type="tel"
                    value={telefonoVisita}
                    onChange={(e) => setTelefonoVisita(e.target.value)}
                    placeholder="77712345"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horario preferido *
                  </label>
                  <select
                    value={horarioVisita}
                    onChange={(e) => setHorarioVisita(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un horario</option>
                    <option value="Mañana (9:00 - 12:00)">Mañana (9:00 - 12:00)</option>
                    <option value="Tarde (14:00 - 18:00)">Tarde (14:00 - 18:00)</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalVisitaAbierto(false)}
                    disabled={enviandoVisita}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={enviandoVisita}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {enviandoVisita ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Enviar Solicitud"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Solicitud de Alquiler */}
      {modalAlquilerAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {esAnticretico ? "Solicitar Anticrético" : "Solicitar Alquiler"}
                </h3>
                <button
                  onClick={() => setModalAlquilerAbierto(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {property && (
                <p className="text-sm text-gray-600 mb-4">
                  Propiedad: <strong>{property.titulo}</strong>
                  {property.deposito && (
                    <span className="block mt-1">
                      Depósito de garantía: <strong className="capitalize">{property.deposito}</strong>
                    </span>
                  )}
                  {esAnticretico && property.duracion_contrato && (
                    <span className="block mt-1">
                      Duración del anticrético: <strong className="capitalize">{property.duracion_contrato}</strong>
                    </span>
                  )}
                </p>
              )}

              <form onSubmit={handleSolicitarAlquiler} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tu teléfono de contacto *
                  </label>
                  <input
                    type="tel"
                    value={telefonoAlquiler}
                    onChange={(e) => setTelefonoAlquiler(e.target.value)}
                    placeholder="77712345"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje para el propietario (opcional)
                  </label>
                  <textarea
                    value={mensajeAlquiler}
                    onChange={(e) => setMensajeAlquiler(e.target.value)}
                    placeholder="Hola, estoy interesado en alquilar esta propiedad..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalAlquilerAbierto(false)}
                    disabled={enviandoAlquiler}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={enviandoAlquiler}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {enviandoAlquiler ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Enviar Solicitud"
                    )}
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
