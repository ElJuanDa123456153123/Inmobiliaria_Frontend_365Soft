import { Interaction, InteractionType } from "@/lib/services/crm-api"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface InteractionTimelineProps {
  interactions: Interaction[]
}

export function InteractionTimeline({ interactions }: InteractionTimelineProps) {
  const getInteractionIcon = (tipo: InteractionType) => {
    switch (tipo) {
      case "Llamada":
        return "📞"
      case "WhatsApp":
        return "💬"
      case "Email":
        return "✉️"
      case "Visita":
        return "🏠"
      case "Nota":
        return "📝"
      case "Reunion":
        return "👥"
      default:
        return "💭"
    }
  }

  const getInteractionColor = (tipo: InteractionType) => {
    switch (tipo) {
      case "Llamada":
        return "bg-blue-100 border-blue-300"
      case "WhatsApp":
        return "bg-green-100 border-green-300"
      case "Email":
        return "bg-purple-100 border-purple-300"
      case "Visita":
        return "bg-orange-100 border-orange-300"
      case "Nota":
        return "bg-gray-100 border-gray-300"
      case "Reunion":
        return "bg-indigo-100 border-indigo-300"
      default:
        return "bg-gray-100 border-gray-300"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return `Hace ${diffMinutes} minuto${diffMinutes !== 1 ? "s" : ""}`
      }
      return `Hace ${diffHours} hora${diffHours !== 1 ? "s" : ""}`
    } else if (diffDays === 1) {
      return "Ayer"
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`
    } else {
      return date.toLocaleDateString("es-BO", {
        day: "numeric",
        month: "short",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  if (interactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay interacciones registradas</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Línea vertical */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <div className="space-y-6">
        {interactions.map((interaction, index) => (
          <div key={interaction.id} className="relative pl-16">
            {/* Icono */}
            <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-2xl z-10">
              {getInteractionIcon(interaction.tipo)}
            </div>

            {/* Contenido */}
            <Card
              className={`p-4 ${getInteractionColor(interaction.tipo)} border-2`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {interaction.tipo}
                    </h4>
                    {interaction.cliente_estado && (
                      <Badge variant="outline" className="text-xs">
                        Estado: {interaction.cliente_estado}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{formatDate(interaction.created_at)}</p>
                </div>
              </div>

              <p className="text-gray-700">{interaction.notas}</p>

              {interaction.proximo_contacto && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <p className="text-sm text-orange-700 font-medium">
                    📅 Próximo contacto:{" "}
                    {new Date(interaction.proximo_contacto).toLocaleDateString(
                      "es-BO",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
