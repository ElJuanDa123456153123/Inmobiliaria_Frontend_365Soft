"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { MapPin, Bed, Bath, Maximize, Calendar, MessageCircle, Phone, Star, ChevronLeft, ChevronRight, Building2, Check, Circle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FavoriteButton } from "@/components/ui/favorite-button"

interface PropertyCardProps {
  id: string
  title: string
  location: string
  price: string
  operationType: "venta" | "alquiler" | "anticretico"
  bedrooms?: number | string
  bathrooms?: number | string
  area?: string
  image: string
  publishedDate?: string
  featured?: boolean
  description?: string
  agentName?: string
  agencyName?: string
  agentAvatar?: string | null
  agentPhone?: string
  images?: string[]
  currentImageIndex?: number
}

const operationColors = {
  venta: "bg-blue-500",
  alquiler: "bg-green-500",
  anticretico: "bg-orange-500",
}

export function PropertyCard({
  id,
  title,
  location,
  price,
  operationType,
  bedrooms,
  bathrooms,
  area,
  image,
  publishedDate,
  featured = false,
  description,
  agentName,
  agencyName,
  agentAvatar,
  agentPhone,
  images = [],
}: PropertyCardProps) {
  // Debug: Ver qué props recibe el card
  console.log("🎴 [PROPERTY CARD] Props recibidas:", {
    id,
    agentName,
    agencyName,
    agentAvatar,
    agentPhone,
    title
  })

  // Estado para el índice de la imagen actual
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Usar las imágenes disponibles o la imagen principal como fallback
  const allImages = images.length > 0 ? images : [image]
  const totalImages = allImages.length

  // Auto-cambio cada 10 segundos
  useEffect(() => {
    if (totalImages <= 1 || isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages)
    }, 10000)

    return () => clearInterval(interval)
  }, [totalImages, isPaused])

  // Funciones de navegación
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <Card
      className="overflow-hidden hover:shadow-xl transition-shadow group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={allImages[currentIndex]}
          alt={`${title} - Imagen ${currentIndex + 1} de ${totalImages}`}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />

        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            Destacado
          </div>
        )}

        {/* Operation Type & Favorite Button */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
          <FavoriteButton propertyId={parseInt(id)} className="bg-white/90 hover:bg-white dark:bg-gray-900/90" />
          <div className="bg-white/90 dark:bg-gray-900/90 px-3 py-1 rounded-full text-sm font-medium">
            <span className={cn("inline-block w-2 h-2 rounded-full mr-1", operationColors[operationType])}></span>
            {operationType.charAt(0).toUpperCase() + operationType.slice(1)}
          </div>
        </div>

        {/* Image Counter */}
        {totalImages > 1 && (
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
            {currentIndex + 1} / {totalImages}
          </div>
        )}

        {/* Navigation Arrows */}
        {totalImages > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {totalImages > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className="transition-all"
                aria-label={`Ir a imagen ${index + 1}`}
              >
                <Circle
                  className={cn(
                    "transition-all",
                    index === currentIndex
                      ? "h-2.5 w-2.5 fill-white text-white"
                      : "h-2 w-2 fill-transparent text-white/50 hover:text-white/80"
                  )}
                />
              </button>
            ))}
          </div>
        )}

        {/* Area Badge */}
        {area && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Maximize className="h-3 w-3" />
            {area}
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {/* Price */}
        <div className="text-2xl font-bold text-foreground mb-2">
          {price}
        </div>

        {/* Title */}
        <Link
          href={`/propiedades/${id}`}
          className="hover:text-primary transition-colors"
        >
          <h3 className="text-xl font-bold mb-2 line-clamp-1">
            {title}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground mb-4">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{location}</span>
        </div>

        {/* Description - compacta */}
        {description && (
          <div
            className="text-sm text-muted-foreground mb-4 line-clamp-2 [&_p]:mb-2 [&_p]:last:mb-0"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        {/* Property Details - más compacto */}
        <div className="flex items-center gap-4 text-sm mb-4">
          {bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span>{bedrooms}</span>
            </div>
          )}
          {bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4 text-muted-foreground" />
              <span>{bathrooms}</span>
            </div>
          )}
          {area && (
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4 text-muted-foreground" />
              <span>{area}</span>
            </div>
          )}
        </div>

        {/* Agent Info - más compacto */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b">
          <div className="relative">
            {agentAvatar ? (
              <img
                src={agentAvatar}
                alt={agentName || "Agente"}
                className="rounded-full object-cover border-2 border-border"
                style={{ width: '32px', height: '32px' }}
                onError={(e) => {
                  // Si falla la carga, ocultar imagen y mostrar icono
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`bg-muted rounded-full flex items-center justify-center ${agentAvatar ? 'hidden' : ''}`} style={{ width: '32px', height: '32px' }}>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 bg-[#FF6B00] rounded-full flex items-center justify-center border-2 border-background" style={{ width: '14px', height: '14px' }}>
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{agentName || "Agente Inmobiliario"}</p>
            {agencyName && (
              <p className="text-xs text-muted-foreground truncate">{agencyName}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button className="flex-1 bg-[#FF6B00] hover:bg-[#e65f00] text-white text-xs" asChild>
            <Link href={`/propiedades/${id}`}>
              Ver detalles
            </Link>
          </Button>
          <Button variant="outline" className="text-xs gap-1" asChild>
            <a href={`tel:${agentPhone || ''}`}>
              <Phone className="h-3 w-3" />
            </a>
          </Button>
          <Button className="bg-[#25D366] hover:bg-[#1ebc57] text-white p-2" size="icon">
            <MessageCircle className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
