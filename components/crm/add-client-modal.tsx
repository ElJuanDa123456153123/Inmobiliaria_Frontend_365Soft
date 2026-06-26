"use client"

import { useState } from "react"
import { X, User, Phone, Mail, MessageSquare, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { crmApiService, CreateClientRequest, ClientStatus, ClientOrigin } from "@/lib/services/crm-api"
import { toast } from "sonner"

interface AddClientModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function AddClientModal({ onClose, onSuccess }: AddClientModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateClientRequest>({
    nombre: "",
    telefono: "",
    whatsapp: "",
    email: "",
    estado: "Nuevo",
    origen: "Web",
    notas: "",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validaciones
    if (!formData.nombre.trim()) {
      toast.error("El nombre es requerido")
      return
    }
    if (!formData.telefono.trim()) {
      toast.error("El teléfono es requerido")
      return
    }
    if (formData.nombre.length < 3) {
      toast.error("El nombre debe tener al menos 3 caracteres")
      return
    }
    if (formData.telefono.length < 8) {
      toast.error("El teléfono debe tener al menos 8 caracteres")
      return
    }

    try {
      setLoading(true)
      await crmApiService.createClient(formData)
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Error creating client:", error)
      toast.error(error.message || "Error al crear cliente")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof CreateClientRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Nuevo Cliente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo *</Label>
            <Input
              id="nombre"
              placeholder="Ej: Juan Pérez"
              value={formData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              id="telefono"
              placeholder="Ej: +591 77712345"
              value={formData.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
            <Input
              id="whatsapp"
              placeholder="Ej: +591 77712345"
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
              placeholder="Ej: juan@email.com"
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

          {/* Origen */}
          <div className="space-y-2">
            <Label htmlFor="origen">Origen</Label>
            <Select
              value={formData.origen}
              onValueChange={(value) => handleChange("origen", value as ClientOrigin)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Web">🌐 Web</SelectItem>
                <SelectItem value="WhatsApp">💬 WhatsApp</SelectItem>
                <SelectItem value="Referencia">👥 Referencia</SelectItem>
                <SelectItem value="Instagram">📸 Instagram</SelectItem>
                <SelectItem value="Facebook">📘 Facebook</SelectItem>
                <SelectItem value="Telefono">📞 Teléfono</SelectItem>
              </SelectContent>
            </Select>
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
              {loading ? "Guardando..." : "Guardar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
