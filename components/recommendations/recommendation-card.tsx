import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  TrendingUp,
  Info,
  Building2,
} from "lucide-react"
import { PropertyRecommendation } from "@/lib/services/recommendations-api"
import { cn } from "@/lib/utils"

interface RecommendationCardProps {
  recommendation: PropertyRecommendation
  onViewDetails?: () => void
  onContact?: () => void
  className?: string
}

export function RecommendationCard({
  recommendation,
  onViewDetails,
  onContact,
  className,
}: RecommendationCardProps) {
  const { property, score, reason, match_factors } = recommendation

  const getScoreColor = () => {
    if (score >= 0.7) return "bg-green-500 text-white"
    if (score >= 0.5) return "bg-yellow-500 text-white"
    return "bg-blue-500 text-white"
  }

  const getScoreLabel = () => {
    if (score >= 0.7) return "Excelente Match"
    if (score >= 0.5) return "Buen Match"
    return "Match Posible"
  }

  const formatPrice = () => {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: property.moneda,
      maximumFractionDigits: 0,
    }).format(property.precio)
  }

  const getOperationBadge = () => {
    const colors = {
      venta: "bg-green-500 text-white",
      alquiler: "bg-blue-500 text-white",
      anticretico: "bg-orange-500 text-white",
    }
    return colors[property.tipo_operacion as keyof typeof colors] || "bg-gray-500"
  }

  return (
    <Card
      className={cn(
        "overflow-hidden hover:shadow-xl transition-all duration-300 group",
        className
      )}
    >
      {/* Imagen con badges */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {property.imagenes && property.imagenes.length > 0 ? (
          <img
            src={
              property.imagenes[0].principal
                ? property.imagenes[0].image_url
                : property.imagenes[0].image_url
            }
            alt={property.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Building2 className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Badge de score */}
        <div className="absolute top-3 right-3">
          <Badge className={cn("flex items-center gap-1.5 shadow-lg", getScoreColor())}>
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-semibold">{getScoreLabel()}</span>
            <span className="font-mono font-bold">
              {Math.round(score * 100)}%
            </span>
          </Badge>
        </div>

        {/* Badge de tipo de operación */}
        <div className="absolute top-3 left-3">
          <Badge className={cn("shadow-lg", getOperationBadge())}>
            {property.tipo_operacion}
          </Badge>
        </div>

        {/* Tipo de propiedad */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="shadow-lg">
            {property.tipo_propiedad}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Precio */}
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-foreground">
            {formatPrice()}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {property.titulo}
        </h3>

        {/* Ubicación */}
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="line-clamp-1">{property.zona}</span>
        </div>

        {/* Características */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {property.dormitorios && property.dormitorios !== "sin-definir" && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.dormitorios}</span>
            </div>
          )}
          {property.banos && property.banos !== "sin-definir" && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.banos}</span>
            </div>
          )}
          {property.metros_edificados && (
            <div className="flex items-center gap-1">
              <Maximize className="w-4 h-4" />
              <span>{property.metros_edificados} m²</span>
            </div>
          )}
        </div>

        {/* Razón de recomendación */}
        <div className="pt-3 border-t">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground mb-1">
                Por qué te recomendamos esto:
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {reason}
              </p>
            </div>
          </div>
        </div>

        {/* Factores de match */}
        {match_factors && match_factors.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {match_factors.slice(0, 3).map((factor, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-2 py-0.5"
              >
                {factor}
              </Badge>
            ))}
            {match_factors.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{match_factors.length - 3} más
              </Badge>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-2 pt-2">
          {onViewDetails && (
            <Button onClick={onViewDetails} className="flex-1">
              Ver Detalles
            </Button>
          )}
          {onContact && (
            <Button onClick={onContact} variant="outline" className="flex-1">
              Contactar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
