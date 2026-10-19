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
  Eye,
  Pencil,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { apiService, Property } from "@/lib/services/api"
import { getUserIdFromToken } from "@/lib/user-prefs"
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
  const [esPropietario, setEsPropietario] = useState(false)

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
  const [yaTieneVisitaPendiente, setYaTieneVisitaPendiente] = useState(false)
  // Agenda dinámica: disponibilidad del vendedor (horarios por día) + slot elegido
  const [disponibilidad, setDisponibilidad] = useState<{
    duracion_min: number
    horarios: Record<string, { desde: string; hasta: string }[]>
    ocupadas: string[]
  } | null>(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState("")
  const [slotSeleccionado, setSlotSeleccionado] = useState("")
  const [limiteFechas, setLimiteFechas] = useState(10)

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
          const delHilo = data.messages.filter((m: ChatMessage) => m && m.id)
          // Merge (no overwrite): evita perder mensajes enviados mientras cargaba el hilo
          setChatMessages(prev => {
            const vistos = new Set<number>()
            const combinados = [...delHilo, ...prev].filter((m) => {
              if (!m || !m.id || vistos.has(m.id)) return false
              vistos.add(m.id)
              return true
            })
            return combinados.sort((a, b) =>
              new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
            )
          })
        }
      }
    } catch (error) {
      console.error("Error cargando mensajes:", error)
      toast.error("Error al cargar mensajes")
    }
  }

  // Insertar un mensaje en el chat evitando duplicados:
  // 1) por id (POST y WebSocket devuelven el mismo registro)
  // 2) por firma de contenido (si el id llegara a diferir entre eventos)
  const mergeMensaje = (msg: ChatMessage) => {
    if (!msg || !msg.id) return
    setChatMessages(prev => {
      if (prev.some(m => m.id === msg.id)) return prev
      const firma = (m: ChatMessage) =>
        `${m.de_user_id}|${m.para_user_id}|${m.mensaje}|${m.created_at ? new Date(m.created_at).toISOString().slice(0, 16) : ""}`
      const firmaMsg = firma(msg)
      if (prev.some(m => firma(m) === firmaMsg)) return prev
      return [...prev, msg]
    })
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
          mergeMensaje(data.mensaje)
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
          mergeMensaje(data.mensaje)
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
  const abrirModalVisita = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Debes iniciar sesión para solicitar una visita")
      router.push(`/ingresar?redirect=/propiedades/${params.id}`)
      return
    }
    if (yaTieneVisitaPendiente) {
      toast.info("Ya tienes una visita pendiente para esta propiedad")
      return
    }

    // Cargar disponibilidad del vendedor (días, franjas, ocupados)
    setDisponibilidad(null)
    setFechaSeleccionada("")
    setSlotSeleccionado("")
    setModalVisitaAbierto(true)
    try {
      const res = await fetch(`${API_URL}/api/panel/visits/availability/${property?.id}`, {
        headers: { "Authorization": `Bearer ${token}` },
        cache: "no-store",
      })
      if (res.ok) {
        const data = await res.json()
        setDisponibilidad({
          duracion_min: data.duracion_min || 60,
          horarios: data.horarios || {},
          ocupadas: data.ocupadas || [],
        })
      }
    } catch {
      // Sin disponibilidad se muestra aviso y el usuario puede escribir su preferencia manual
    }
  }

  // Días de la semana que el vendedor atiende (con franjas configuradas)
  const diasAtendidos = (): number[] => {
    if (!disponibilidad) return [1, 2, 3, 4, 5, 6]
    return Object.keys(disponibilidad.horarios)
      .filter((d) => (disponibilidad.horarios[d]?.length ?? 0) > 0)
      .map(Number)
  }

  // Fechas disponibles: próximos días según disponibilidad del vendedor.
  // Muestra hasta limiteFechas (paginación con "Ver más/menos fechas" hasta 90 días).
  const generarFechasDisponibles = () => {
    const dias = diasAtendidos()
    const fechas: Date[] = []
    const hoy = new Date()
    for (let i = 1; fechas.length < limiteFechas && i <= 90; i++) {
      const d = new Date(hoy)
      d.setDate(hoy.getDate() + i)
      if (dias.includes(d.getDay())) fechas.push(d)
    }
    return fechas
  }

  const totalFechasEn90Dias = () => {
    const dias = diasAtendidos()
    const hoy = new Date()
    let total = 0
    for (let i = 1; i <= 90; i++) {
      const d = new Date(hoy)
      d.setDate(hoy.getDate() + i)
      if (dias.includes(d.getDay())) total++
    }
    return total
  }

  // Horarios del día elegido: franjas configuradas para ese día de la semana,
  // en pasos de duracion_min, excluyendo ocupados y horarios ya pasados
  const generarSlotsDisponibles = () => {
    if (!disponibilidad || !fechaSeleccionada) return []
    const duracion = disponibilidad.duracion_min || 60
    const slots: string[] = []
    const ahora = new Date()
    const esHoy = fechaSeleccionada === ahora.toISOString().slice(0, 10)

    // Día de la semana de la fecha elegida ("0"=Dom .. "6"=Sáb)
    const [y, m, d] = fechaSeleccionada.split("-").map(Number)
    const diaSemana = new Date(y, m - 1, d).getDay()
    const franjas = disponibilidad.horarios[String(diaSemana)] || []

    for (const rango of franjas) {
      const [hDesde, mDesde] = rango.desde.split(":").map(Number)
      const [hHasta, mHasta] = rango.hasta.split(":").map(Number)
      let minutos = hDesde * 60 + mDesde
      const fin = hHasta * 60 + mHasta
      while (minutos + duracion <= fin) {
        const hh = String(Math.floor(minutos / 60)).padStart(2, "0")
        const mm = String(minutos % 60).padStart(2, "0")
        const slot = `${hh}:${mm}`
        const ocupado = disponibilidad.ocupadas?.some(o => o === `${fechaSeleccionada} ${slot}`)
        const pasado = esHoy && minutos <= ahora.getHours() * 60 + ahora.getMinutes()
        if (!ocupado && !pasado) slots.push(slot)
        minutos += duracion
      }
    }
    return slots
  }

  // Función para enviar solicitud de visita
  const handleSolicitarVisita = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!property) return
    if (!nombreVisita.trim() || !telefonoVisita.trim()) {
      toast.error("Por favor completa tu nombre y teléfono")
      return
    }
    if (!fechaSeleccionada || !slotSeleccionado) {
      toast.error("Selecciona el día y el horario de tu visita")
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
          horario_preferido: `${fechaSeleccionada} ${slotSeleccionado}`,
          fecha_visita: `${fechaSeleccionada} ${slotSeleccionado}`
        })
      })

      if (response.ok) {
        toast.success("Solicitud de visita enviada correctamente")
        setModalVisitaAbierto(false)
        setYaTieneVisitaPendiente(true)
      } else {
        const errData = await response.json().catch(() => ({ error: "Error al enviar solicitud" }))
        toast.error(errData.error || "Error al enviar solicitud")
        // Si ya tenía una pendiente (409), refrescar el estado del botón
        if (response.status === 409) setYaTieneVisitaPendiente(true)
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
        // Autollenado del formulario de visita con los datos de la cuenta
        setNombreVisita([userData.user?.nombre, userData.user?.apellido].filter(Boolean).join(" ") || "")
        setTelefonoVisita(userData.user?.telefono || "")
      } catch {
        // silencioso
      }

      // ¿Ya tiene una visita pendiente para esta propiedad? → ocultar botón de agendar
      try {
        const visitsResponse = await fetch(`${API_URL}/api/panel/visits/my`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (visitsResponse.ok) {
          const visitsData = await visitsResponse.json()
          const tienePendiente = (visitsData.visits || []).some(
            (v: any) => String(v.property_id) === String(params.id) && v.estado === "pendiente"
          )
          setYaTieneVisitaPendiente(tienePendiente)
        }
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
              mergeMensaje(mensaje)
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

  // Detectar si el visitante es el dueño del aviso → barra de propietario
  useEffect(() => {
    if (!property) return
    const userId = getUserIdFromToken()
    setEsPropietario(Boolean(userId && Number(userId) === property.user_id))
  }, [property])

  // Lista de días activos con sus franjas (para el bloque "Días de disponibilidad")
  const disponibilidadVendedorLista = () => {
    const disp = property?.vendedor_disponibilidad
    if (!disp?.horarios) return []
    const orden = ["1", "2", "3", "4", "5", "6", "0"]
    const labels: Record<string, string> = { "0": "Domingo", "1": "Lunes", "2": "Martes", "3": "Miércoles", "4": "Jueves", "5": "Viernes", "6": "Sábado" }
    return orden
      .filter((d) => (disp.horarios[d]?.length ?? 0) > 0)
      .map((d) => ({
        dia: labels[d],
        franjas: disp.horarios[d].map((f) => `${f.desde.slice(0, 5)} - ${f.hasta.slice(0, 5)}`).join(" y "),
      }))
  }

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

      {/* Barra de propietario: solo la ve el dueño del aviso */}
      {esPropietario && (
        <div className="bg-primary text-white shadow-md border-b border-black/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Eye className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">
                  Estás viendo tu aviso como lo ven los compradores
                </p>
                <p className="text-xs text-white/80">
                  Vista previa · visible solo para ti
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/panel/propiedades">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/60 bg-transparent text-white hover:bg-white/15 hover:text-white font-semibold"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Volver al panel
                </Button>
              </Link>
              <Link href={`/publicar/formulario?edit=${property.id}`}>
                <Button
                  size="sm"
                  className="bg-white text-primary hover:bg-white/90 font-bold shadow"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar aviso
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

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
                            Preguntar al vendedor
                          </Button>
                        )}
                        {yaTieneVisitaPendiente ? (
                          <div className="w-full bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-4 py-3 text-sm text-center font-medium">
                            📅 Ya tienes una visita pendiente para esta propiedad
                          </div>
                        ) : (
                          <Button
                            className="w-full"
                            variant="outline"
                            size="lg"
                            onClick={abrirModalVisita}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Agendar Visita
                          </Button>
                        )}
                        {property.vendedor_telefono && (
                          <Button
                            className="w-full bg-[#25D366] hover:bg-[#1eb856] text-white border-0"
                            size="lg"
                            asChild
                          >
                            <a
                              href={`https://wa.me/591${property.vendedor_telefono.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, me interesa esta propiedad: ${property.titulo}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              WhatsApp
                            </a>
                          </Button>
                        )}
                      </div>

                      <div className="pt-4 border-t border-border space-y-2 text-sm">
                        {property.vendedor_telefono && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{property.vendedor_telefono}</span>
                          </div>
                        )}
                        {disponibilidadVendedorLista().length > 0 ? (
                          <div className="rounded-lg border border-border bg-muted/40 p-3">
                            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                              <Calendar className="h-3.5 w-3.5" />
                              Días de disponibilidad
                            </div>
                            <div className="space-y-1.5">
                              {disponibilidadVendedorLista().map((d) => (
                                <div key={d.dia} className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-medium text-foreground">{d.dia}</span>
                                  <span className="text-xs text-muted-foreground">{d.franjas}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          property.vendedor_horario && (
                            <div className="flex items-start gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span className="text-xs leading-snug">
                                Atiende: {property.vendedor_horario}
                              </span>
                            </div>
                          )
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
                <h3 className="font-semibold text-gray-900">Consultas de la propiedad</h3>
                <p className="text-xs text-gray-500">Conversa con {chatVendedorNombre}</p>
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
                  <p>No hay consultas aún</p>
                  <p className="text-sm mt-1">Haz tu primera consulta sobre esta propiedad</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between gap-4 bg-gray-50 rounded-t-2xl">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Agendar Visita</h3>
                {property && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    {property.titulo}
                    <span className="block text-xs text-gray-500">
                      Agenda de {property.vendedor_nombre} (vendedor)
                    </span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setModalVisitaAbierto(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSolicitarVisita} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-6 grid md:grid-cols-2 gap-6">
                {/* Columna izquierda: datos del interesado + resumen */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                    <p className="text-xs text-primary font-medium flex items-center gap-1">
                      ✓ Datos verificados de tu cuenta (no editables, evita fraudes)
                    </p>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nombre completo
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={nombreVisita}
                          readOnly
                          placeholder="Juan Pérez"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 text-sm cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={telefonoVisita}
                        readOnly
                        placeholder="77712345"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Resumen de la selección */}
                  <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
                      Tu visita
                    </p>
                    {fechaSeleccionada && slotSeleccionado ? (
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">
                          {new Date(`${fechaSeleccionada}T12:00:00`).toLocaleDateString("es-BO", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </span>
                        <span className="block mt-0.5">
                          A las <strong>{slotSeleccionado}</strong> ({disponibilidad?.duracion_min || 60} min aprox.)
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Elige día y horario de la agenda del vendedor →
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                      El vendedor recibirá tu propuesta y podrá confirmarla, reprogramarla o rechazarla. Te avisamos por notificación y correo.
                    </p>
                  </div>
                </div>

                {/* Columna derecha: agenda */}
                <div className="space-y-5">
                  {!disponibilidad ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 py-8 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando horarios disponibles...
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          1. Elige el día
                        </label>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {generarFechasDisponibles().map((fecha) => {
                            const iso = fecha.toISOString().slice(0, 10)
                            const isSelected = fechaSeleccionada === iso
                            const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
                            const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
                            return (
                              <button
                                key={iso}
                                type="button"
                                onClick={() => {
                                  setFechaSeleccionada(iso)
                                  setSlotSeleccionado("")
                                }}
                                className={`
                                  flex flex-col items-center px-3 py-2 rounded-lg border-2 min-w-[64px] transition-all
                                  ${isSelected
                                    ? "bg-primary text-white border-primary shadow"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-primary/50"
                                  }
                                `}
                              >
                                <span className="text-[10px] uppercase">{diasSemana[fecha.getDay()]}</span>
                                <span className="text-lg font-bold leading-none">{fecha.getDate()}</span>
                                <span className="text-[10px]">{meses[fecha.getMonth()]}</span>
                              </button>
                            )
                          })}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {totalFechasEn90Dias() > limiteFechas && (
                            <button
                              type="button"
                              onClick={() => setLimiteFechas((prev) => Math.min(prev + 10, 90))}
                              className="text-xs text-primary hover:underline"
                            >
                              Ver más fechas →
                            </button>
                          )}
                          {limiteFechas > 10 && (
                            <button
                              type="button"
                              onClick={() => setLimiteFechas(10)}
                              className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
                            >
                              Ver menos
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          2. Elige el horario <span className="text-xs text-gray-400">({disponibilidad.duracion_min} min)</span>
                        </label>
                        {!fechaSeleccionada ? (
                          <p className="text-xs text-gray-500">Selecciona primero un día</p>
                        ) : generarSlotsDisponibles().length === 0 ? (
                          <p className="text-xs text-gray-500">No hay horarios libres este día. Prueba con otro.</p>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {generarSlotsDisponibles().map((slot) => {
                              const isSelected = slotSeleccionado === slot
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setSlotSeleccionado(slot)}
                                  className={`
                                    px-2 py-2 rounded-lg border-2 text-sm font-medium transition-all
                                    ${isSelected
                                      ? "bg-primary text-white border-primary shadow"
                                      : "bg-white text-gray-600 border-gray-200 hover:border-primary/50"
                                    }
                                  `}
                                >
                                  {slot}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3">
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
                  disabled={enviandoVisita || !fechaSeleccionada || !slotSeleccionado}
                  className="flex-1"
                >
                  {enviandoVisita ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Solicitar Visita"
                  )}
                </Button>
              </div>
            </form>
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
