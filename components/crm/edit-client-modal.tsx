"use client"

import { useState, useEffect } from "react"
import { User, Phone, Mail, MessageSquare, FileText } from "lucide-react"
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
import { crmApiService, Client, UpdateClientRequest, ClientStatus, ClientOrigin } from "@/lib/services/crm-api"
import { toast } from "sonner"

interface EditClientModalProps {
  client: Client
  onClose: () => void
  onSuccess: () => void
}

export function EditClientModal({ client, onClose, onSuccess }: EditClientModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateClientRequest>({
    nombre: client.nombre,
    telefono: client.telefono,
    whatsapp: client.whatsapp || "",
    email: client.email || "",
    estado: client.estado,
    notas: client.notas || "",
    proximo_contacto: client.proximo_contacto || "",
  })

  useEffect(() => {
    setFormData({
      nombre: client.nombre,
      telefono: client.telefono,
      whatsapp: client.whatsapp || "",
      email: client.email || "",
      estado: client.estado,
      notas: client.notas || "",
      proximo_contacto: client.proximo_contacto || "",
    })
  }, [client])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validaciones
    if (!formData.nombre?.trim()) {
      toast.error("El nombre es requerido")
      return
    }
    if (!formData.telefono?.trim()) {
      toast.error("El teléfono es requerido")
      return
    }

    try {
      setLoading(true)
      await crmApiService.updateClient(client.id, formData)
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Error updating client:", error)
      toast.error(error.message || "Error al actualizar cliente")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof UpdateClientRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Editar Cliente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => handleChange("whatsapp", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) => handleChange("estado", value as ClientStatus)}
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
          </div>

          {/* Próximo Contacto */}
          <div className="space-y-2">
            <Label htmlFor="proximo_contacto">Próximo Contacto (opcional)</Label>
            <Input
              id="proximo_contacto"
              type="datetime-local"
              value={formData.proximo_contacto}
              onChange={(e) => handleChange("proximo_contacto", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              placeholder="Notas adicionales sobre el cliente..."
              value={formData.notas}
              onChange={(e) => handleChange("notas", e.target.value)}
              disabled={loading}
              rows={3}
            />
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
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
