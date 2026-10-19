"use client"

import { useState, useEffect, useRef } from "react"
import { Send, MessageSquare, User, Calendar, Trash2, Image as ImageIcon, Paperclip, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
const WS_URL = API_URL.replace(/^http/, "ws")

interface Conversation {
  other_user_id: number
  other_user_name: string
  other_user_email: string
  property_id?: number
  property_titulo?: string
  unread_count: number
  last_message?: string
  last_message_time?: string
}

interface Message {
  id: number
  de_user_id: number
  para_user_id: number
  mensaje: string
  tipo_mensaje?: string
  archivo_url?: string
  archivo_nombre?: string
  leido: boolean
  created_at: string
  de_user?: {
    id: number
    nombre: string
    email: string
  }
  para_user?: {
    id: number
    nombre: string
    email: string
  }
}

interface VisitaRequest {
  type: string
  visit_id: number
  cliente_nombre: string
  cliente_telefono: string
  horario_preferido: string
}

export default function PanelMensajesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const selectedConversationRef = useRef<Conversation | null>(null)
  const currentUserIdRef = useRef<number | null>(null)
  const fetchConversationsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Estados para el modal de visita
  const [modalVisitaAbierto, setModalVisitaAbierto] = useState(false)
  const [nombreVisitante, setNombreVisitante] = useState("")
  const [telefonoVisitante, setTelefonoVisitante] = useState("")
  const [horarioPreferido, setHorarioPreferido] = useState("")
  const [enviandoVisita, setEnviandoVisita] = useState(false)

  // Estados para el modal de confirmación de visita (vendedor)
  const [modalConfirmarVisitaAbierto, setModalConfirmarVisitaAbierto] = useState(false)
  const [visitaAConfirmar, setVisitaAConfirmar] = useState<VisitaRequest | null>(null)
  const [fechaVisita, setFechaVisita] = useState("")
  const [horaVisita, setHoraVisita] = useState("")
  const [confirmandoVisita, setConfirmandoVisita] = useState(false)
  const [enviandoArchivo, setEnviandoArchivo] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estado para previsualizar archivo antes de enviar
  const [archivoPendiente, setArchivoPendiente] = useState<{ file: File; preview: string; isImage: boolean } | null>(null)
  const [mensajeArchivo, setMensajeArchivo] = useState("")

  // Cargar conversaciones al montar
  useEffect(() => {
    fetchConversations()
  }, [])

  // Obtener usuario actual una sola vez
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        const userResponse = await fetch(`${API_URL}/api/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setCurrentUserId(userData.user.id)
        }
      } catch (error) {
        console.error("Error obteniendo usuario actual:", error)
      }
    }
    fetchCurrentUser()
  }, [])

  // Mantener refs sincronizadas para usar en el WebSocket sin reconectar
  useEffect(() => {
    selectedConversationRef.current = selectedConversation
  }, [selectedConversation])

  useEffect(() => {
    currentUserIdRef.current = currentUserId
  }, [currentUserId])

  // WebSocket connection (se conecta una sola vez al montar)
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    let reconnectTimeout: ReturnType<typeof setTimeout>
    let isMounted = true
    let reconnectAttempts = 0
    const MAX_RECONNECT_ATTEMPTS = 10

    const connect = () => {
      console.log("🔌 Conectando WebSocket...")
      const ws = new WebSocket(`${WS_URL}/ws?token=${token}`)

      ws.onopen = () => {
        console.log("✅ WebSocket conectado")
        reconnectAttempts = 0
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === "new_message") {
            const mensaje = data.message?.message
            if (!mensaje) return

            const conv = selectedConversationRef.current
            const currentId = currentUserIdRef.current

            // Si el mensaje es de la conversación actual, agregarlo (con dedup)
            // Filtrar también por property_id para evitar mensajes cruzados entre propiedades
            if (conv && currentId &&
                ((mensaje.de_user_id === currentId && mensaje.para_user_id === conv.other_user_id) ||
                 (mensaje.de_user_id === conv.other_user_id && mensaje.para_user_id === currentId)) &&
                (!conv.property_id || !mensaje.property_id || conv.property_id === mensaje.property_id)) {
              setMessages(prev => {
                if (prev.some(m => m.id === mensaje.id)) return prev
                return [...prev, mensaje]
              })
              scrollToBottom()
            }

            // Actualizar lista de conversaciones (con debounce)
            debouncedFetchConversations()
          }
        } catch (err) {
          console.error("Error procesando mensaje WebSocket:", err)
        }
      }

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error)
      }

      ws.onclose = (event) => {
        console.log("🔌 WebSocket desconectado:", event.code, event.reason)
        // Reconexión automática con backoff exponencial si fue un cierre anormal
        if (isMounted && event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
          reconnectAttempts++
          console.log(`🔌 Reconectando WebSocket en ${delay / 1000}s (intento ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`)
          reconnectTimeout = setTimeout(() => {
            connect()
          }, delay)
        }
      }

      wsRef.current = ws
    }

    connect()

    return () => {
      isMounted = false
      clearTimeout(reconnectTimeout)
      if (fetchConversationsTimeoutRef.current) {
        clearTimeout(fetchConversationsTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close(1000)
      }
    }
  }, [])

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/panel/messages/conversations`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error("❌ Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  // Versión con debounce para evitar múltiples llamadas rápidas desde el WebSocket
  const debouncedFetchConversations = () => {
    if (fetchConversationsTimeoutRef.current) {
      clearTimeout(fetchConversationsTimeoutRef.current)
    }
    fetchConversationsTimeoutRef.current = setTimeout(() => {
      fetchConversations()
    }, 500)
  }

  const fetchMessages = async (otherUserId: number, propertyId?: number) => {
    try {
      const token = localStorage.getItem("token")
      const url = propertyId
        ? `${API_URL}/api/panel/messages/thread/${otherUserId}?property_id=${propertyId}`
        : `${API_URL}/api/panel/messages/thread/${otherUserId}`

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])

        // Marcar mensajes como leídos
        markMessagesAsRead(otherUserId)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const markMessagesAsRead = async (otherUserId: number) => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`${API_URL}/api/panel/messages/mark-read/${otherUserId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation.other_user_id, conversation.property_id)
  }

  // Eliminar conversación completa
  const handleDeleteConversation = async () => {
    if (!selectedConversation) return
    if (!confirm("¿Eliminar toda la conversación? Esta acción no se puede deshacer.")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/panel/messages/conversation/${selectedConversation.other_user_id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success("Conversación eliminada")
        setMessages([])
        setSelectedConversation(null)
        fetchConversations()
      } else {
        toast.error("Error al eliminar la conversación")
      }
    } catch (error) {
      console.error("Error eliminando conversación:", error)
      toast.error("Error al eliminar la conversación")
    }
  }

  // Seleccionar archivo para previsualizar antes de enviar
  const handleSelectFile = (file: File) => {
    const isImage = file.type.startsWith("image/")
    const preview = isImage ? URL.createObjectURL(file) : ""
    setMensajeArchivo("")
    setArchivoPendiente({ file, preview, isImage })
  }

  // Confirmar y enviar archivo con mensaje opcional
  const handleConfirmarArchivo = async () => {
    if (!archivoPendiente || !selectedConversation) return

    const { file } = archivoPendiente
    setEnviandoArchivo(true)

    try {
      const token = localStorage.getItem("token")
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
          para_user_id: selectedConversation.other_user_id,
          property_id: selectedConversation.property_id,
          mensaje: mensajeArchivo.trim() || file.name,
          tipo_mensaje: uploadData.tipo_mensaje,
          archivo_url: uploadData.url,
          archivo_nombre: file.name
        })
      })

      if (sendResponse.ok) {
        const data = await sendResponse.json()
        if (data.mensaje && data.mensaje.id) {
          setMessages(prev => {
            if (prev.some(m => m.id === data.mensaje.id)) return prev
            return [...prev, data.mensaje]
          })
        }
        scrollToBottom()
        fetchConversations()
      }
    } catch (error) {
      console.error("Error subiendo archivo:", error)
      toast.error("Error al subir archivo")
    } finally {
      setEnviandoArchivo(false)
      cancelarArchivoPendiente()
    }
  }

  // Cancelar envío de archivo
  const cancelarArchivoPendiente = () => {
    if (archivoPendiente?.preview) {
      URL.revokeObjectURL(archivoPendiente.preview)
    }
    setArchivoPendiente(null)
    setMensajeArchivo("")
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedConversation || !currentUserId) return

    const messageData = {
      para_user_id: selectedConversation.other_user_id,
      property_id: selectedConversation.property_id,
      mensaje: newMessage.trim()
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/panel/messages/send`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(messageData)
      })

      if (response.ok) {
        const data = await response.json()
        // Deduplicar: el WebSocket también puede entregar este mensaje
        if (data.mensaje && data.mensaje.id) {
          setMessages(prev => {
            if (prev.some(m => m.id === data.mensaje.id)) return prev
            return [...prev, data.mensaje]
          })
        }
        setNewMessage("")
        scrollToBottom()
        fetchConversations() // Actualizar lista de conversaciones
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  // Función para solicitar visita
  const handleSolicitarVisita = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedConversation?.property_id) {
      toast.error("No hay propiedad relacionada")
      return
    }

    if (!nombreVisitante.trim() || !telefonoVisitante.trim() || !horarioPreferido) {
      toast.error("Por favor completa todos los campos")
      return
    }

    setEnviandoVisita(true)

    try {
      const token = localStorage.getItem("token")

      // 1. Crear la visita en la base de datos
      const visitaResponse = await fetch(`${API_URL}/api/panel/visits`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          property_id: selectedConversation.property_id,
          nombre_completo: nombreVisitante,
          telefono: telefonoVisitante,
          horario_preferido: horarioPreferido
        })
      })

      if (visitaResponse.ok) {
        const visitaData = await visitaResponse.json()

        // 2. Enviar mensaje automático en el chat
        const mensajeVisita = JSON.stringify({
          type: "VISIT_REQUEST",
          visit_id: visitaData.visit.id,
          cliente_nombre: nombreVisitante,
          cliente_telefono: telefonoVisitante,
          horario_preferido: horarioPreferido
        })

        await fetch(`${API_URL}/api/panel/messages/send`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            para_user_id: selectedConversation.other_user_id,
            property_id: selectedConversation.property_id,
            mensaje: mensajeVisita
          })
        })

        // 3. Cerrar modal y limpiar formulario
        setModalVisitaAbierto(false)
        setNombreVisitante("")
        setTelefonoVisitante("")
        setHorarioPreferido("")

        toast.success("Solicitud de visita enviada correctamente")
      } else {
        toast.error("Error al enviar solicitud de visita")
      }
    } catch (error) {
      console.error("Error solicitando visita:", error)
      toast.error("Error al enviar solicitud de visita")
    } finally {
      setEnviandoVisita(false)
    }
  }

  // Función para abrir modal de confirmación de visita
  const handleAbrirModalConfirmar = (visitaData: VisitaRequest) => {
    setVisitaAConfirmar(visitaData)
    setModalConfirmarVisitaAbierto(true)

    // Establecer fecha y hora por defecto (mañana a las 10:00)
    const manana = new Date()
    manana.setDate(manana.getDate() + 1)
    manana.setHours(10, 0, 0, 0)

    setFechaVisita(manana.toISOString().split('T')[0]) // YYYY-MM-DD
    setHoraVisita("10:00")
  }

  // Función para confirmar visita (aceptar)
  const handleConfirmarVisita = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!visitaAConfirmar) {
      toast.error("No hay visita seleccionada")
      return
    }

    if (!fechaVisita || !horaVisita) {
      toast.error("Por favor selecciona fecha y hora")
      return
    }

    setConfirmandoVisita(true)

    try {
      const token = localStorage.getItem("token")

      // Combinar fecha y hora
      const fechaVisitaCompleta = `${fechaVisita} ${horaVisita}`

      // Confirmar visita
      const response = await fetch(`${API_URL}/api/panel/visits/${visitaAConfirmar.visit_id}/confirm`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fecha_visita: fechaVisitaCompleta
        })
      })

      if (response.ok) {
        await response.json()

        // Enviar mensaje automático en el chat
        const mensajeConfirmacion = `✅ Visita CONFIRMADA para el ${new Date(fechaVisitaCompleta).toLocaleString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`

        await fetch(`${API_URL}/api/panel/messages/send`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            para_user_id: selectedConversation?.other_user_id,
            property_id: selectedConversation?.property_id,
            mensaje: mensajeConfirmacion
          })
        })

        // Cerrar modal
        setModalConfirmarVisitaAbierto(false)
        setVisitaAConfirmar(null)
        setFechaVisita("")
        setHoraVisita("")

        toast.success("Visita confirmada correctamente")
      } else {
        toast.error("Error al confirmar visita")
      }
    } catch (error) {
      console.error("Error confirmando visita:", error)
      toast.error("Error al confirmar visita")
    } finally {
      setConfirmandoVisita(false)
    }
  }

  // Función para rechazar visita
  const handleRechazarVisita = async (visitaId: number) => {
    if (!confirm("¿Estás seguro de rechazar esta visita?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")

      // Rechazar visita (cambiar estado a cancelada)
      const response = await fetch(`${API_URL}/api/panel/visits/${visitaId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          estado: "cancelada",
          notas: "Visita rechazada por el vendedor"
        })
      })

      if (response.ok) {
        // Enviar mensaje automático en el chat
        const mensajeRechazo = "❌ Lo siento, no puedo recibir la visita en este momento."

        await fetch(`${API_URL}/api/panel/messages/send`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            para_user_id: selectedConversation?.other_user_id,
            property_id: selectedConversation?.property_id,
            mensaje: mensajeRechazo
          })
        })

        toast.success("Visita rechazada")
      } else {
        toast.error("Error al rechazar visita")
      }
    } catch (error) {
      console.error("Error rechazando visita:", error)
      toast.error("Error al rechazar visita")
    }
  }

  // Función para parsear mensajes especiales
  const parseMensajeEspecial = (mensaje: string) => {
    try {
      const data = JSON.parse(mensaje)
      return data
    } catch {
      return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultas</h1>
          <p className="text-gray-600 mt-1">Preguntas y conversaciones sobre tus propiedades</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Lista de Conversaciones */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Conversaciones</h2>
          </div>

          <div className="overflow-y-auto h-full">
            {!conversations || conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No tienes conversaciones aún</p>
              </div>
            ) : (
              conversations.filter(c => c && c.other_user_id).map((conversation) => (
                <div
                  key={conversation.other_user_id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.other_user_id === conversation.other_user_id
                      ? "bg-blue-50 border-l-4 border-l-blue-600"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.other_user_name}
                        </h3>
                        {conversation.unread_count > 0 && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      {conversation.property_titulo && (
                        <p className="text-xs text-gray-600 truncate">
                          {conversation.property_titulo}
                        </p>
                      )}
                      {conversation.last_message && (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.last_message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Selecciona una conversación</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedConversation.other_user_name}
                  </h3>
                  {selectedConversation.property_titulo && (
                    <p className="text-sm text-gray-600">
                      {selectedConversation.property_titulo}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Botón Solicitar Visita (solo si hay propiedad relacionada) */}
                  {selectedConversation.property_id && (
                    <Button
                      onClick={() => setModalVisitaAbierto(true)}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Solicitar Visita
                    </Button>
                  )}

                  {/* Botón Eliminar Conversación (destructivo, discreto) */}
                  <Button
                    onClick={handleDeleteConversation}
                    variant="ghost"
                    size="sm"
                    title="Eliminar conversación"
                    className="flex items-center gap-2 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <p>No hay mensajes aún</p>
                    <p className="text-sm mt-1">¡Sé el primero en saludar!</p>
                  </div>
                ) : (
                  messages.filter(m => m && m.id && m.de_user_id).map((message) => {
                    const isFromMe = message.de_user_id === currentUserId
                    const mensajeEspecial = parseMensajeEspecial(message.mensaje)
                    const esVisitRequest = mensajeEspecial?.type === "VISIT_REQUEST"

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isFromMe
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}>
                          {esVisitRequest && !isFromMe ? (
                            // Mensaje especial de solicitud de visita (solo visible para el vendedor)
                            <div className="space-y-3">
                              <div className="border-b border-gray-300 pb-2">
                                <p className="text-sm font-semibold">📅 Solicitud de Visita</p>
                              </div>

                              <div className="space-y-1 text-sm">
                                <p><strong>Cliente:</strong> {mensajeEspecial.cliente_nombre}</p>
                                <p><strong>Teléfono:</strong> {mensajeEspecial.cliente_telefono}</p>
                                <p><strong>Horario preferido:</strong> {mensajeEspecial.horario_preferido}</p>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAbrirModalConfirmar(mensajeEspecial)}
                                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                                >
                                  ✅ Aceptar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRechazarVisita(mensajeEspecial.visit_id)}
                                  className="flex-1"
                                >
                                  ❌ Rechazar
                                </Button>
                              </div>
                            </div>
                          ) : esVisitRequest && isFromMe ? (
                            // Mensaje especial de solicitud de visita (vista del emisor)
                            <div className="space-y-2">
                              <div className="border-b border-blue-300/30 pb-2">
                                <p className="text-sm font-semibold">📅 Solicitud de Visita Enviada</p>
                              </div>
                              <div className="space-y-1 text-sm">
                                <p><strong>Cliente:</strong> {mensajeEspecial.cliente_nombre}</p>
                                <p><strong>Teléfono:</strong> {mensajeEspecial.cliente_telefono}</p>
                                <p><strong>Horario preferido:</strong> {mensajeEspecial.horario_preferido}</p>
                              </div>
                              <p className={`text-xs mt-1 ${isFromMe ? "text-blue-200" : "text-gray-500"}`}>
                                {new Date(message.created_at).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ) : message.tipo_mensaje === "imagen" && message.archivo_url ? (
                            // Mensaje con imagen adjunta
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
                              <p className={`text-xs ${isFromMe ? "text-blue-200" : "text-gray-500"}`}>
                                {new Date(message.created_at).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ) : message.tipo_mensaje === "documento" && message.archivo_url ? (
                            // Mensaje con documento adjunto
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
                              <p className={`text-xs ${isFromMe ? "text-blue-200" : "text-gray-500"}`}>
                                {new Date(message.created_at).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ) : (
                            // Mensaje normal
                            <>
                              <p className="text-sm">{message.mensaje}</p>
                              <p className={`text-xs mt-1 ${
                                isFromMe ? "text-blue-200" : "text-gray-500"
                              }`}>
                                {new Date(message.created_at).toLocaleTimeString('es-BO', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex gap-2 items-center">
                  {/* Botón subir imagen */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleSelectFile(file)
                      e.target.value = ""
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={enviandoArchivo}
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
                      if (file) handleSelectFile(file)
                      e.target.value = ""
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={enviandoArchivo}
                    title="Enviar documento"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>

                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={enviandoArchivo ? "Subiendo archivo..." : "Escribe un mensaje..."}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={enviandoArchivo}
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || enviandoArchivo}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Modal de Solicitud de Visita */}
      {modalVisitaAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Solicitar Visita
              </h3>

              {selectedConversation?.property_titulo && (
                <p className="text-sm text-gray-600 mb-4">
                  Propiedad: {selectedConversation.property_titulo}
                </p>
              )}

              <form onSubmit={handleSolicitarVisita} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tu nombre completo *
                  </label>
                  <input
                    type="text"
                    value={nombreVisitante}
                    onChange={(e) => setNombreVisitante(e.target.value)}
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
                    value={telefonoVisitante}
                    onChange={(e) => setTelefonoVisitante(e.target.value)}
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
                    value={horarioPreferido}
                    onChange={(e) => setHorarioPreferido(e.target.value)}
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
                    {enviandoVisita ? "Enviando..." : "Enviar Solicitud"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Fecha (para vendedor) */}
      {modalConfirmarVisitaAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Confirmar Visita
              </h3>

              {visitaAConfirmar && (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Solicitud de visita de <strong>{visitaAConfirmar.cliente_nombre}</strong>
                  </p>

                  <p className="text-sm text-gray-600 mb-4">
                    Horario preferido: <strong>{visitaAConfirmar.horario_preferido}</strong>
                  </p>
                </>
              )}

              <form onSubmit={handleConfirmarVisita} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selecciona fecha *
                  </label>
                  <input
                    type="date"
                    value={fechaVisita}
                    onChange={(e) => setFechaVisita(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} // Solo fechas futuras
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selecciona hora *
                  </label>
                  <select
                    value={horaVisita}
                    onChange={(e) => setHoraVisita(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona una hora</option>
                    <option value="08:00">08:00 AM</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="18:00">06:00 PM</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalConfirmarVisitaAbierto(false)}
                    disabled={confirmandoVisita}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={confirmandoVisita}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {confirmandoVisita ? "Confirmando..." : "Confirmar Visita"}
                  </Button>
                </div>
              </form>
            </div>
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
                  onClick={handleConfirmarArchivo}
                  disabled={enviandoArchivo}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {enviandoArchivo ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
