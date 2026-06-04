"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Check, Crown } from "lucide-react"
import { apiService, Subscription } from "@/lib/services/api"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface PlanSelectorProps {
  onSubscriptionChange?: (subscription: Subscription | null) => void
}

export function PlanSelector({ onSubscriptionChange }: PlanSelectorProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Cargar suscripciones al montar
  useEffect(() => {
    loadSubscriptions()
  }, [])

  // Escuchar cambios de suscripción (desde otras pestañas)
  useEffect(() => {
    const handleSubscriptionChange = () => {
      loadSubscriptions()
    }
    window.addEventListener("subscription-changed", handleSubscriptionChange)
    return () => window.removeEventListener("subscription-changed", handleSubscriptionChange)
  }, [])

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        setSelectedSubscription(null)
        setSubscriptions([])
        setLoading(false)
        return
      }

      const subs = await apiService.getMySubscriptions()
      setSubscriptions(subs)

      // Encontrar la suscripción seleccionada
      const selected = subs.find(sub => sub.seleccionada)
      setSelectedSubscription(selected || null)

      // Notificar al componente padre
      if (onSubscriptionChange) {
        onSubscriptionChange(selected || null)
      }
    } catch (error: any) {
      console.error("Error cargando suscripciones:", error)
      // No mostrar error si no hay suscripciones
      setSelectedSubscription(null)
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSubscription = async (subscriptionId: number) => {
    try {
      await apiService.selectSubscription(subscriptionId)

      // Recargar suscripciones
      await loadSubscriptions()

      // Disparar evento para otros componentes
      window.dispatchEvent(new Event("subscription-changed"))

      setIsOpen(false)
      toast.success("Plan seleccionado correctamente")
    } catch (error: any) {
      console.error("Error seleccionando suscripción:", error)
      toast.error(error.message || "Error al seleccionar el plan")
    }
  }

  // Si no hay usuario logueado o no hay suscripciones, no mostrar nada
  if (!selectedSubscription) {
    return null
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border-primary/20 hover:border-primary/40"
      >
        <Crown className="h-4 w-4 text-primary" />
        <span className="hidden sm:inline">
          {selectedSubscription.plan?.nombre || "Plan"}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-border py-2 z-50">
          <div className="px-4 py-2 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Selecciona un plan
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {subscriptions.map((subscription) => {
              const disponibles = (subscription.plan?.limite_propiedades || 0) - (subscription.propiedades_usadas || 0)
              const agotado = disponibles <= 0

              return (
                <div key={subscription.id} className="border-b border-border last:border-b-0">
                  <button
                    onClick={() => handleSelectSubscription(subscription.id)}
                    className="w-full px-4 py-3 hover:bg-muted transition-colors flex items-start gap-3"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {subscription.plan?.nombre || "Plan"}
                        </span>
                        {subscription.seleccionada && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                        {agotado && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            Agotado
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>{subscription.propiedades_usadas}/{subscription.plan?.limite_propiedades || 0} propiedades usadas</p>
                        {subscription.fecha_fin && (
                          <p>Vence: {new Date(subscription.fecha_fin).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Botón de renovar si está agotado */}
                  {agotado && subscription.plan && (
                    <a
                      href={`/pagar/${subscription.plan.id}`}
                      onClick={() => setIsOpen(false)}
                      className="mx-4 mb-3 block text-center text-xs bg-primary text-white px-3 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Renovar este plan
                    </a>
                  )}
                </div>
              )
            })}
          </div>

          <div className="px-4 py-2 border-t border-border">
            <a
              href="/planes"
              className="block text-center text-sm text-primary hover:underline"
              onClick={() => setIsOpen(false)}
            >
              + Adquirir nuevo plan
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
