import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LeadScoreBadge } from "./lead-score-badge"
import { ScoreFactorsList } from "./score-factors-list"
import { TrendingUp, Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LeadScore } from "@/lib/services/crm-api"

interface LeadScoreCardProps {
  score: LeadScore
  clientName?: string
  showFactors?: boolean
  showRecalculate?: boolean
  onRecalculate?: () => void
  isLoading?: boolean
  className?: string
}

export function LeadScoreCard({
  score,
  clientName,
  showFactors = false,
  showRecalculate = false,
  onRecalculate,
  isLoading = false,
  className,
}: LeadScoreCardProps) {
  const getLevelColor = () => {
    switch (score.level) {
      case "ALTO":
        return "text-green-600 dark:text-green-400"
      case "MEDIO":
        return "text-yellow-600 dark:text-yellow-400"
      case "BAJO":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-gray-600"
    }
  }

  const getLevelBgColor = () => {
    switch (score.level) {
      case "ALTO":
        return "bg-green-50 dark:bg-green-950"
      case "MEDIO":
        return "bg-yellow-50 dark:bg-yellow-950"
      case "BAJO":
        return "bg-red-50 dark:bg-red-950"
      default:
        return "bg-gray-50 dark:bg-gray-950"
    }
  }

  return (
    <Card
      className={cn(
        "overflow-hidden hover:shadow-lg transition-shadow",
        className
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">Calificación del Lead</CardTitle>
            {clientName && (
              <p className="text-sm text-muted-foreground">{clientName}</p>
            )}
          </div>
          {showRecalculate && onRecalculate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRecalculate}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4",
                  isLoading && "animate-spin"
                )}
              />
              Recalcular
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score principal */}
        <div
          className={cn(
            "flex items-center justify-between p-6 rounded-xl",
            getLevelBgColor()
          )}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className={cn("w-5 h-5", getLevelColor())} />
              <p className="text-sm font-medium text-muted-foreground">
                Nivel de Calificación
              </p>
            </div>
            <div className="flex items-center gap-3">
              <LeadScoreBadge level={score.level} score={score.score} size="lg" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Puntuación</p>
            <p className="text-4xl font-bold font-mono">{score.score}</p>
            <p className="text-xs text-muted-foreground mt-1">/ 100 puntos</p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            Información Adicional
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Último cálculo:</span>
            </div>
            <div className="text-sm font-mono text-foreground">
              {score.last_calculated_at
                ? new Date(score.last_calculated_at).toLocaleDateString(
                    "es-ES"
                  )
                : "No calculado"}
            </div>
          </div>
        </div>

        {/* Factores del score */}
        {showFactors && <ScoreFactorsList score={score} />}
      </CardContent>
    </Card>
  )
}
