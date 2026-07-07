"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Sparkles, ArrowRight } from "lucide-react"
import { recommendationsApiService, PropertyRecommendation } from "@/lib/services/recommendations-api"
import { RecommendationCard } from "./recommendation-card"
import { toast } from "sonner"

interface RecommendationsSectionProps {
  title?: string
  subtitle?: string
  limit?: number
  className?: string
}

export function RecommendationsSection({
  title = "Recomendado para ti",
  subtitle = "Propiedades seleccionadas según tu perfil",
  limit = 6,
  className,
}: RecommendationsSectionProps) {
  const [recommendations, setRecommendations] = useState<PropertyRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [recalculando, setRecalculando] = useState(false)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const response = await recommendationsApiService.getRecommendations(limit)
      setRecommendations(response.recommendations)
    } catch (error: any) {
      console.error("Error fetching recommendations:", error)
      toast.error(error.message || "Error al cargar recomendaciones")
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculate = async () => {
    try {
      setRecalculando(true)
      await fetchRecommendations()
      toast.success("Recomendaciones actualizadas")
    } catch (error: any) {
      console.error("Error recalculating:", error)
    } finally {
      setRecalculando(false)
    }
  }

  const handleViewDetails = (propertyId: number) => {
    window.location.href = `/propiedades/${propertyId}`
  }

  const handleContact = (propertyId: number) => {
    window.location.href = `/propiedades/${propertyId}?contact=true`
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Analizando tu perfil...</p>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-12 text-center">
          <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Sin recomendaciones aún
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Comienza a ver propiedades y marca favoritas para que podamos
            recomendarte las mejores opciones
          </p>
          <Button onClick={() => window.location.href = "/propiedades"}>
            Explorar Propiedades
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRecalculate}
          disabled={recalculando}
          className="gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${recalculando ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </div>

      {/* Grid de recomendaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.property.id}
            recommendation={recommendation}
            onViewDetails={() => handleViewDetails(recommendation.property.id)}
            onContact={() => handleContact(recommendation.property.id)}
          />
        ))}
      </div>

      {/* Ver más */}
      {recommendations.length === limit && (
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" className="gap-2">
            Ver Más Recomendaciones
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
