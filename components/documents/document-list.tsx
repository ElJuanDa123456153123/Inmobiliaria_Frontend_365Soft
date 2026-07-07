"use client"

import { useState, useEffect } from "react"
import { Document } from "@/lib/services/api"
import { DocumentCard } from "./document-card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, FileText, Filter } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface DocumentListProps {
  documents: Document[]
  loading?: boolean
  onDelete?: (documentId: number) => void
  onPreview?: (document: Document) => void
  totalCount?: number
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onFilterChange?: (type: string | undefined) => void
  currentFilter?: string
}

const documentTypes = [
  { value: "", label: "Todos los documentos" },
  { value: "PROPERTY_PHOTO", label: "Fotos de Propiedades" },
  { value: "RECEIPT", label: "Comprobantes de Pago" },
  { value: "CONTRACT", label: "Contratos" },
  { value: "PUBLIC", label: "Documentos Públicos" },
]

export function DocumentList({
  documents,
  loading = false,
  onDelete,
  onPreview,
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onFilterChange,
  currentFilter,
}: DocumentListProps) {
  const [filter, setFilter] = useState<string>(currentFilter || "")

  useEffect(() => {
    setFilter(currentFilter || "")
  }, [currentFilter])

  const handleFilterChange = (value: string) => {
    setFilter(value)
    if (onFilterChange) {
      onFilterChange(value || undefined)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">Cargando documentos...</p>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-full bg-muted">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 font-semibold text-lg">No hay documentos</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {filter
            ? "No se encontraron documentos con el filtro seleccionado."
            : "Aún no has subido ningún documento. Comienza subiendo tu primer documento."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtrar por:</span>
          </div>
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos los documentos" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {totalCount} documento{totalCount !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Documents Grid */}
      <motion.div
        layout
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence>
          {documents.map((document) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DocumentCard
                document={document}
                onDelete={onDelete}
                onPreview={onPreview}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="w-9"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}
