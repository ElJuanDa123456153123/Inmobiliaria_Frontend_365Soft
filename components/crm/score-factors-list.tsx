import { Card, CardContent } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LeadScore } from "@/lib/services/crm-api"

interface ScoreFactorsListProps {
  score: LeadScore
  className?: string
}

export function ScoreFactorsList({ score, className }: ScoreFactorsListProps) {
  const factors = [
    {
      label: "Presupuesto definido",
      active: score.has_budget,
      points: score.has_budget ? 20 : 0,
      icon: Check,
    },
    {
      label: "Zona específica",
      active: score.has_zone,
      points: score.has_zone ? 15 : 0,
      icon: Check,
    },
    {
      label: "Interacciones recientes",
      active: score.recent_interactions_count > 0,
      points: Math.min(score.recent_interactions_count * 5, 20),
      value: `${score.recent_interactions_count} interacción(es)`,
      icon: Check,
    },
    {
      label: "Propiedades vistas",
      active: score.has_viewed_properties,
      points: score.has_viewed_properties ? 10 : 0,
      icon: Check,
    },
    {
      label: "Favoritos marcados",
      active: score.has_favorites,
      points: score.has_favorites ? 10 : 0,
      icon: Check,
    },
    {
      label: "Propiedad específica",
      active: score.has_specific_property,
      points: score.has_specific_property ? 10 : 0,
      icon: Check,
    },
    {
      label: "Bonificación por origen",
      active: score.origin_bonus > 0,
      points: score.origin_bonus,
      value: `+${score.origin_bonus} pts`,
      icon: Check,
    },
    {
      label: "Bonificación por estado",
      active: score.state_bonus > 0,
      points: score.state_bonus,
      value: `+${score.state_bonus} pts`,
      icon: Check,
    },
  ]

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            Factores del Score
          </h4>
          <div className="space-y-2">
            {factors.map((factor) => {
              const Icon = factor.active ? factor.icon : X
              return (
                <div
                  key={factor.label}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        factor.active
                          ? "text-green-600"
                          : "text-muted-foreground"
                      )}
                    />
                    <span className="text-sm font-medium">{factor.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {factor.value && (
                      <span className="text-xs text-muted-foreground">
                        {factor.value}
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-xs font-mono font-semibold px-2 py-0.5 rounded",
                        factor.active
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      +{factor.points}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          {score.last_interaction_at && (
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Última interacción</span>
                <span className="font-mono">
                  {new Date(score.last_interaction_at).toLocaleDateString(
                    "es-ES"
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>Días desde última interacción</span>
                <span className="font-mono font-semibold">
                  {score.days_since_last_interaction} días
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
