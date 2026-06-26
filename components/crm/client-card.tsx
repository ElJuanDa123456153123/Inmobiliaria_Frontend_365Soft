import { Client, ClientStatus } from "@/lib/services/crm-api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, Building2, Clock } from "lucide-react"

interface ClientCardProps {
  client: Client
  onClick?: () => void
}

export function ClientCard({ client, onClick }: ClientCardProps) {
  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case "Nuevo":
        return "bg-blue-500"
      case "Contactado":
        return "bg-yellow-500"
      case "Interesado":
        return "bg-green-500"
      case "EnNegociacion":
        return "bg-orange-500"
      case "Cerrado":
        return "bg-green-600"
      case "Perdido":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Hoy"
    } else if (diffDays === 1) {
      return "Ayer"
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `Hace ${weeks} semana${weeks > 1 ? "s" : ""}`
    } else {
      const months = Math.floor(diffDays / 30)
      return `Hace ${months} mes${months > 1 ? "es" : ""}`
    }
  }

  const getOriginIcon = (origin: string) => {
    switch (origin) {
      case "Web":
        return "🌐"
      case "WhatsApp":
        return "💬"
      case "Referencia":
        return "👥"
      case "Instagram":
        return "📸"
      case "Facebook":
        return "📘"
      case "Telefono":
        return "📞"
      default:
        return "👤"
    }
  }

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header con nombre y estado */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {client.nombre}
            </h3>
            {client.property && (
              <div className="flex items-center text-sm text-gray-600">
                <Building2 className="w-3 h-3 mr-1" />
                <span className="truncate">{client.property.titulo}</span>
              </div>
            )}
          </div>
          <Badge className={`${getStatusColor(client.estado)} text-white`}>
            {client.estado}
          </Badge>
        </div>

        {/* Información de contacto */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-700">
            <Phone className="w-4 h-4 mr-2 text-gray-500" />
            <span className="font-medium">{client.telefono}</span>
          </div>

          {client.email && (
            <div className="flex items-center text-sm text-gray-700">
              <Mail className="w-4 h-4 mr-2 text-gray-500" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
        </div>

        {/* Origen y último contacto */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <span className="mr-1">{getOriginIcon(client.origen)}</span>
            <span className="capitalize">{client.origen}</span>
          </div>

          {client.updated_at && (
            <div className="flex items-center text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              <span>{formatTimeAgo(client.updated_at)}</span>
            </div>
          )}
        </div>

        {/* Próximo contacto pendiente */}
        {client.proximo_contacto && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center text-sm text-orange-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Contacto programado: {new Date(client.proximo_contacto).toLocaleDateString("es-BO")}</span>
            </div>
          </div>
        )}

        {/* Notas cortas */}
        {client.notas && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-gray-600 line-clamp-2">{client.notas}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
