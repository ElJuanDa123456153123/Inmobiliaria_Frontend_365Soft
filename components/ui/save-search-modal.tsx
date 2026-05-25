"use client"

import { useState, useEffect } from "react"
import { X, Bell, ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiService } from "@/lib/services/api"

interface SaveSearchModalProps {
  isOpen: boolean
  onClose: () => void
  filters: any
  searchTerm: string
  onSaveSuccess?: () => void
}

export function SaveSearchModal({ isOpen, onClose, filters, searchTerm, onSaveSuccess }: SaveSearchModalProps) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Autogenerar un nombre sugerido en base a los filtros
  useEffect(() => {
    if (isOpen) {
      setError("")
      setSuccess(false)
      
      const parts: string[] = []
      
      const tipoPropiedad = filters.type || filters.tipo_propiedad
      if (tipoPropiedad && tipoPropiedad !== "todas") {
        const propLabels: Record<string, string> = {
          casa: "Casas",
          departamento: "Departamentos",
          terreno: "Terrenos",
          oficina: "Oficinas",
          local: "Locales"
        }
        parts.push(propLabels[tipoPropiedad] || tipoPropiedad)
      } else {
        parts.push("Inmuebles")
      }

      const tipoOperacion = filters.operation || filters.tipo_operacion
      if (tipoOperacion && tipoOperacion !== "todas") {
        const opLabels: Record<string, string> = {
          venta: "en Venta",
          alquiler: "en Alquiler",
          anticretico: "en Anticrético"
        }
        parts.push(opLabels[tipoOperacion] || tipoOperacion)
      }

      const zona = searchTerm || filters.zona
      if (zona) {
        parts.push(`en ${zona}`)
      }

      setName(parts.join(" "))
    }
  }, [isOpen, filters, searchTerm])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Por favor, introduce un nombre para la búsqueda.")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      setError("Debes iniciar sesión para poder guardar búsquedas.")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Unificar filtros para enviarle al backend
      const filtersToSave = {
        tipo_operacion: filters.operation || filters.tipo_operacion || "todas",
        tipo_propiedad: filters.type || filters.tipo_propiedad || "todas",
        zona: searchTerm || filters.zona || "",
        precio_min: filters.priceMin || filters.precio_min || "",
        precio_max: filters.priceMax || filters.precio_max || "",
        moneda: filters.moneda || "todas",
        dormitorios: filters.bedrooms || filters.dormitorios || "todas",
        banos: filters.banos || "todas",
        garaje: filters.garaje || "todas"
      }

      await apiService.saveSearch(name, filtersToSave)
      setSuccess(true)
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess()
        onClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Error al guardar la búsqueda.")
    } finally {
      setLoading(false)
    }
  }

  // Generar etiquetas legibles para los filtros aplicados
  const getFilterBadges = () => {
    const badges: string[] = []
    
    const operation = filters.operation || filters.tipo_operacion
    if (operation && operation !== "todas") {
      badges.push(`Operación: ${operation}`)
    }
    
    const type = filters.type || filters.tipo_propiedad
    if (type && type !== "todas") {
      badges.push(`Tipo: ${type}`)
    }
    
    const zona = searchTerm || filters.zona
    if (zona) {
      badges.push(`Zona: ${zona}`)
    }

    const priceMin = filters.priceMin || filters.precio_min
    const priceMax = filters.priceMax || filters.precio_max
    const moneda = filters.moneda !== "todas" ? (filters.moneda === "BOB" ? "Bs" : "USD") : ""
    if (priceMin || priceMax) {
      if (priceMin && priceMax) {
        badges.push(`Precio: ${priceMin} - ${priceMax} ${moneda}`)
      } else if (priceMin) {
        badges.push(`Precio Mín: ${priceMin} ${moneda}`)
      } else {
        badges.push(`Precio Máx: ${priceMax} ${moneda}`)
      }
    }

    const bedrooms = filters.bedrooms || filters.dormitorios
    if (bedrooms && bedrooms !== "todas") {
      badges.push(`Dormitorios: ${bedrooms}`)
    }

    return badges
  }

  const badges = getFilterBadges()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-border overflow-hidden transform scale-100 transition-all duration-300">
        
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-transparent">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Guardar Búsqueda</h2>
              <p className="text-xs text-muted-foreground">Recibe alertas cuando haya nuevos inmuebles</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <p className="text-lg font-bold text-foreground text-center">¡Búsqueda Guardada!</p>
              <p className="text-sm text-muted-foreground text-center">La búsqueda se ha añadido a tu perfil.</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Nombre de la búsqueda
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Casas baratas en Sopocachi"
                  className="w-full text-sm py-2 px-3 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Filtros aplicados
                </label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-muted/40 rounded-xl border border-border/60">
                  {badges.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">Sin filtros específicos aplicados</span>
                  ) : (
                    badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center text-[11px] font-medium bg-primary/5 text-primary border border-primary/10 rounded-full px-2 py-0.5"
                      >
                        {badge}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3 text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/40">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping shrink-0" />
                <p>Monitoreamos nuevas publicaciones en tiempo real cada 1 minuto.</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="p-6 pt-0 border-t border-border/40 flex items-center justify-end gap-3 bg-muted/10">
            <Button variant="ghost" onClick={onClose} disabled={loading} className="text-sm font-medium">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="text-sm font-semibold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-100"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  Guardar Búsqueda
                </>
              )}
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}
