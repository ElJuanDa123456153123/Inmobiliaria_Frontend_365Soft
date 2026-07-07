"use client"

import { useState, useEffect } from "react"
import { Document, apiService } from "@/lib/services/api"
import { DocumentCard } from "./document-card"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, Image as ImageIcon } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

interface PropertyDocumentsProps {
  propertyId: number
  isOwner?: boolean
  onUploadClick?: () => void
}

export function PropertyDocuments({
  propertyId,
  isOwner = false,
  onUploadClick,
}: PropertyDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await apiService.getPropertyDocuments(propertyId)
      setDocuments(response.documents)
    } catch (error) {
      console.error("Error fetching property documents:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [propertyId])

  // Filter to show only public photos ( PROPERTY_PHOTO type and is_public)
  const publicPhotos = documents.filter(
    (doc) => doc.type === "PROPERTY_PHOTO" && doc.is_public
  )

  // Show limited or all photos
  const displayedPhotos = showAll ? publicPhotos : publicPhotos.slice(0, 6)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (publicPhotos.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Fotos de la Propiedad</h3>
        {isOwner && onUploadClick && (
          <Button size="sm" variant="outline" onClick={onUploadClick}>
            <FileText className="h-4 w-4 mr-2" />
            Agregar Fotos
          </Button>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {displayedPhotos.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => window.open(doc.file_url, "_blank")}
          >
            <Image
              src={doc.file_url}
              alt={doc.title || doc.description || "Foto de propiedad"}
              fill
              className="object-cover transition-transform group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            {doc.description && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs line-clamp-2">{doc.description}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Show More Button */}
      {publicPhotos.length > 6 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="w-full"
          >
            {showAll ? (
              "Mostrar menos"
            ) : (
              <>
                <ImageIcon className="h-4 w-4 mr-2" />
                Ver {publicPhotos.length - 6} fotos más
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
