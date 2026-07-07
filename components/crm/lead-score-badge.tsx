import { Badge } from "@/components/ui/badge"
import { Award, Activity, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ScoreLevel } from "@/lib/services/crm-api"

interface LeadScoreBadgeProps {
  level: ScoreLevel
  score: number
  showLabel?: boolean
  size?: "sm" | "default" | "lg"
  className?: string
}

export function LeadScoreBadge({
  level,
  score,
  showLabel = true,
  size = "default",
  className,
}: LeadScoreBadgeProps) {
  const getConfig = () => {
    switch (level) {
      case "ALTO":
        return {
          color: "bg-green-500 text-white hover:bg-green-600",
          icon: Award,
          label: "Alto",
        }
      case "MEDIO":
        return {
          color: "bg-yellow-500 text-white hover:bg-yellow-600",
          icon: Activity,
          label: "Medio",
        }
      case "BAJO":
        return {
          color: "bg-red-500 text-white hover:bg-red-600",
          icon: AlertCircle,
          label: "Bajo",
        }
      default:
        return {
          color: "bg-gray-500 text-white hover:bg-gray-600",
          icon: AlertCircle,
          label: "Desconocido",
        }
    }
  }

  const config = getConfig()
  const Icon = config.icon

  const sizeClasses = {
    sm: "h-6 text-xs px-2 py-0.5 gap-1.5",
    default: "h-7 text-sm px-2.5 py-1 gap-2",
    lg: "h-8 text-base px-3 py-1.5 gap-2",
  }

  return (
    <Badge
      variant="default"
      className={cn(
        "font-semibold border-0 shadow-sm transition-colors",
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {showLabel && <span>{config.label}</span>}
      <span className="font-mono font-bold">{score}</span>
    </Badge>
  )
}
