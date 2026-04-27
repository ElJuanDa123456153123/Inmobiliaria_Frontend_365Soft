"use client"

import { useState } from "react"
import { Check, Trash2, Shield, ShieldCheck, UserCog, Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { adminApi } from "@/lib/services/admin-api"
import { toast } from "sonner"

interface PropertyBatchActionsProps {
  selectedIds: number[]
  onClearSelection: () => void
  onRefresh: () => void
}

export function PropertyBatchActions({
  selectedIds,
  onClearSelection,
  onRefresh,
}: PropertyBatchActionsProps) {
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedAction, setSelectedAction] = useState<string>("")

  const handleBatchAction = async () => {
    if (!selectedAction || selectedIds.length === 0) return

    setActionLoading(true)
    try {
      switch (selectedAction) {
        case "activate":
          await Promise.all(
            selectedIds.map((id) => adminApi.updatePropertyStatus(id, "activo"))
          )
          toast.success(`${selectedIds.length} propiedades activadas`)
          break

        case "deactivate":
          await Promise.all(
            selectedIds.map((id) => adminApi.updatePropertyStatus(id, "inactivo"))
          )
          toast.success(`${selectedIds.length} propiedades desactivadas`)
          break

        case "featured":
          // We need to get the current state first, but for simplicity, we'll just feature them
          await Promise.all(
            selectedIds.map((id) => adminApi.toggleFeatured(id, true))
          )
          toast.success(`${selectedIds.length} propiedades destacadas`)
          break

        case "not_featured":
          await Promise.all(
            selectedIds.map((id) => adminApi.toggleFeatured(id, false))
          )
          toast.success(`${selectedIds.length} propiedades ya no destacadas`)
          break

        case "sold":
          await Promise.all(
            selectedIds.map((id) => adminApi.updatePropertyStatus(id, "vendido"))
          )
          toast.success(`${selectedIds.length} propiedades marcadas como vendidas`)
          break

        case "delete":
          if (confirm(`¿Estás seguro de eliminar ${selectedIds.length} propiedades?`)) {
            await Promise.all(
              selectedIds.map((id) => adminApi.deleteProperty(id))
            )
            toast.success(`${selectedIds.length} propiedades eliminadas`)
          } else {
            setActionLoading(false)
            return
          }
          break

        default:
          break
      }

      onClearSelection()
      onRefresh()
    } catch (error: any) {
      toast.error(error.message || "Error al realizar acción en lote")
    } finally {
      setActionLoading(false)
      setSelectedAction("")
    }
  }

  if (selectedIds.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-background border border-border shadow-lg rounded-lg px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
            {selectedIds.length}
          </div>
          <span className="text-sm font-medium">
            {selectedIds.length} {selectedIds.length === 1 ? "propiedad seleccionada" : "propiedades seleccionadas"}
          </span>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Select
            value={selectedAction}
            onValueChange={setSelectedAction}
            disabled={actionLoading}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Acción en lote..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activate">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  Activar
                </div>
              </SelectItem>
              <SelectItem value="deactivate">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-600" />
                  Desactivar
                </div>
              </SelectItem>
              <SelectItem value="featured">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-600" />
                  Destacar
                </div>
              </SelectItem>
              <SelectItem value="not_featured">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-gray-400" />
                  Quitar destacado
                </div>
              </SelectItem>
              <SelectItem value="sold">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-600" />
                  Marcar vendidas
                </div>
              </SelectItem>
              <SelectItem value="delete">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-red-600" />
                  Eliminar
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleBatchAction}
            disabled={!selectedAction || actionLoading}
            size="sm"
          >
            {actionLoading ? "Aplicando..." : "Aplicar"}
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon"
          onClick={onClearSelection}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
