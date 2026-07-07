"use client"

import { Document } from "@/lib/services/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Image as ImageIcon,
  Receipt,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  HardDrive,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface DocumentCardProps {
  document: Document
  onDelete?: (documentId: number) => void
  onPreview?: (document: Document) => void
}

const documentTypeConfig = {
  PROPERTY_PHOTO: {
    icon: ImageIcon,
    label: "Foto de Propiedad",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  RECEIPT: {
    icon: Receipt,
    label: "Comprobante de Pago",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  CONTRACT: {
    icon: FileText,
    label: "Contrato",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  PUBLIC: {
    icon: FileText,
    label: "Documento Público",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
  },
}

export function DocumentCard({ document, onDelete, onPreview }: DocumentCardProps) {
  const config = documentTypeConfig[document.type as keyof typeof documentTypeConfig] || {
    icon: FileText,
    label: "Documento",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
  }

  const Icon = config.icon

  const handleDownload = () => {
    window.open(document.file_url, "_blank")
  }

  const handleDelete = () => {
    if (onDelete && window.confirm("¿Estás seguro de eliminar este documento?")) {
      onDelete(document.id)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`p-3 rounded-lg ${config.bgColor}`}>
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">{document.title}</h3>
                <p className={`text-sm ${config.color} mt-1`}>{config.label}</p>
              </div>

              {/* Visibility Badge */}
              <div className="flex items-center gap-1 text-xs">
                {document.is_public ? (
                  <>
                    <Eye className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Público</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-400">Privado</span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {document.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {document.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <HardDrive className="h-3 w-3" />
                {formatFileSize(document.file_size)}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(document.created_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>

              {onPreview && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPreview(document)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}

              {onDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
