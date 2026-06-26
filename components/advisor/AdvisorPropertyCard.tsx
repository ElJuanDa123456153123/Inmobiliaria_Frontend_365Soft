"use client"

import { MapPin, Bed, Bath, Maximize, Calendar, CheckCircle2, Clock, Home } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Property {
  id: number
  titulo: string
  precio: number
  moneda: string
  tipo_propiedad: string
  zona: string
  estado_propiedad: "pendiente" | "activo" | "vendido"
  imagen_url?: string
  created_at: string
}

interface AdvisorPropertyCardProps {
  property: Property
  onActivate?: (property: Property) => void
}

const statusConfig = {
  pendiente: {
    label: "Por Gestionar",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  activo: {
    label: "Activa",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
  },
  vendido: {
    label: "Vendida",
    color: "bg-blue-100 text-blue-800",
    icon: Home,
  },
}

const formatPrice = (price: number, moneda: string) => {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: moneda === "USD" ? "USD" : "BOB",
    maximumFractionDigits: 0,
  }).format(price)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Hoy"
  if (diffDays === 1) return "Ayer"
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`
  return date.toLocaleDateString("es-BO")
}

export function AdvisorPropertyCard({ property, onActivate }: AdvisorPropertyCardProps) {
  const status = statusConfig[property.estado_propiedad]
  const StatusIcon = status.icon

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {property.imagen_url ? (
          <img
            src={property.imagen_url}
            alt={property.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <Home className="h-16 w-16 text-blue-400" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={`${status.color} border-0`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
            <p className="text-lg font-bold text-gray-900">
              {formatPrice(property.precio, property.moneda)}
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2" title={property.titulo}>
          {property.titulo}
        </h3>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{property.zona}</span>
        </div>

        {/* Property Type Badge */}
        <Badge variant="outline" className="mb-3">
          {property.tipo_propiedad}
        </Badge>

        {/* Date */}
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDate(property.created_at)}
        </div>

        {/* Action Button */}
        {onActivate && property.estado_propiedad === "pendiente" && (
          <Button
            onClick={() => onActivate(property)}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Activar Propiedad
          </Button>
        )}

        {property.estado_propiedad === "activo" && (
          <div className="w-full text-center py-2 px-4 bg-green-50 text-green-700 rounded-md text-sm font-medium">
            ✓ Propiedad publicada
          </div>
        )}

        {property.estado_propiedad === "vendido" && (
          <div className="w-full text-center py-2 px-4 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
            ✓ Propiedad vendida
          </div>
        )}
      </CardContent>
    </Card>
  )
}
