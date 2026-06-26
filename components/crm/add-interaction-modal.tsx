"use client"

import { useState } from "react"
import { MessageSquare, Phone, Mail, Building2, Calendar, FileText, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { crmApiService, CreateInteractionRequest, InteractionType, ClientStatus } from "@/lib/services/crm-api"
import { toast } from "sonner"

interface AddInteractionModalProps {
  clientId: number
  currentStatus: ClientStatus
  onClose: () => void
  onSuccess: () => void
}

export function AddInteractionModal({ clientId, currentStatus, onClose, onSuccess }: AddInteractionModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Omit<CreateInteractionRequest, 'client_id'>>({
    tipo: "Llamada",
    notas: "",
    proximo_contacto: "",
    cliente_estado: currentStatus,
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.notas.trim()) {
      toast.error("Las notas son requeridas")
      return
    }

    try {
      setLoading(true)

      const request: CreateInteractionRequest = {
        ...formData,
        client_id: clientId,
      }

      await crmApiService.createInteraction(clientId, request)
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Error creating interaction:", error)
      toast.error(error.message || "Error al registrar interacción")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getInteractionIcon = (tipo: InteractionType) => {
    switch (tipo) {
      case "Llamada":
        return Phone
      case "WhatsApp":
        return MessageSquare
      case "Email":
        return Mail
      case "Visita":
        return Building2
      case "Nota":
        return FileText
      case "Reunion":
        return Users
      default:
        return FileText
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Registrar Interacción
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Tipo de interacción */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Interacción</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => handleChange("tipo", value as InteractionType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Llamada">📞 Llamada</SelectItem>
                <SelectItem value="WhatsApp">💬 WhatsApp</SelectItem>
                <SelectItem value="Email">✉️ Email</SelectItem>
                <SelectItem value="Visita">🏠 Visita</SelectItem>
                <SelectItem value="Nota">📝 Nota</SelectItem>
                <SelectItem value="Reunion">👥 Reunión</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas *</Label>
            <Textarea
              id="notas"
              placeholder="Describe la interacción..."
              value={formData.notas}
              onChange={(e) => handleChange("notas", e.target.value)}
              disabled={loading}
              rows={4}
              required
            />
          </div>

          {/* Próximo contacto */}
          <div className="space-y-2">
            <Label htmlFor="proximo_contacto">Próximo Contacto (opcional)</Label>
            <Input
              id="proximo_contacto"
              type="datetime-local"
              value={formData.proximo_contacto}
              onChange={(e) => handleChange("proximo_contacto", e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Programa el próximo contacto con el cliente
            </p>
          </div>

          {/* Cambiar estado */}
          <div className="space-y-2">
            <Label htmlFor="cliente_estado">Actualizar Estado del Cliente</Label>
            <Select
              value={formData.cliente_estado}
              onValueChange={(value) => handleChange("cliente_estado", value as ClientStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nuevo">🔵 Nuevo</SelectItem>
                <SelectItem value="Contactado">🟡 Contactado</SelectItem>
                <SelectItem value="Interesado">🟢 Interesado</SelectItem>
                <SelectItem value="EnNegociacion">🟠 En Negociación</SelectItem>
                <SelectItem value="Cerrado">✅ Cerrado</SelectItem>
                <SelectItem value="Perdido">🔴 Perdido</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              El estado del cliente se actualizará después de esta interacción
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Guardando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
