"use client"

import { useState } from "react"
import { apiService, Document } from "@/lib/services/api"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Upload, FileText, Image, Receipt } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface DocumentUploadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadSuccess: (document: Document) => void
  propertyId?: number
}

const documentTypes = [
  { value: "PROPERTY_PHOTO", label: "Foto de Propiedad", icon: Image },
  { value: "RECEIPT", label: "Comprobante de Pago", icon: Receipt },
  { value: "CONTRACT", label: "Contrato", icon: FileText },
  { value: "PUBLIC", label: "Documento Público", icon: FileText },
]

export function DocumentUpload({
  open,
  onOpenChange,
  onUploadSuccess,
  propertyId,
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [type, setType] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isPublic, setIsPublic] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validaciones
    if (!file) {
      setError("Debe seleccionar un archivo")
      return
    }

    if (!type) {
      setError("Debe seleccionar un tipo de documento")
      return
    }

    if (!title) {
      setError("Debe ingresar un título")
      return
    }

    // Validar tamaño del archivo (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setError("El archivo excede el tamaño máximo de 10MB")
      return
    }

    try {
      setLoading(true)

      const response = await apiService.uploadDocument({
        file,
        type,
        title,
        property_id: propertyId,
        is_public: isPublic,
        description: description || undefined,
      })

      onUploadSuccess(response.document)

      // Reset form
      setFile(null)
      setType("")
      setTitle("")
      setDescription("")
      setIsPublic(false)
      setError("")
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error uploading document:", error)
      setError(error.message || "Error al subir el documento")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Auto-generate title if empty
      if (!title) {
        setTitle(selectedFile.name.split('.')[0])
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Subir Documento</DialogTitle>
          <DialogDescription>
            Sube fotos de propiedades, comprobantes de pago u otros documentos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Archivo *</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                disabled={loading}
                className="flex-1"
              />
              {file && (
                <div className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              )}
            </div>
          </div>

          {/* Document Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Documento *</Label>
            <Select
              value={type}
              onValueChange={setType}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((docType) => {
                  const Icon = docType.icon
                  return (
                    <SelectItem key={docType.value} value={docType.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {docType.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Foto de fachada"
              disabled={loading}
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional del documento..."
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Is Public Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_public">Documento Público</Label>
              <p className="text-sm text-muted-foreground">
                Los documentos públicos son visibles para todos los usuarios
              </p>
            </div>
            <Switch
              id="is_public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Documento
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
