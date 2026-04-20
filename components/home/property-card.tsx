import Image from "next/image"
import Link from "next/link"
import { MapPin, Bed, Bath, Maximize, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
}

const operationColors = {
  venta: "bg-[var(--sale)]",
  alquiler: "bg-[var(--rent)]",
  anticretico: "bg-[var(--anticretico)]",
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
}: PropertyCardProps) {
  return (
    <Card className={cn(
      "group overflow-hidden transition-all hover:shadow-xl",
      featured && "ring-2 ring-primary"
    )}>
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className={cn(
          "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white",
          operationColors[operationType]
        )}>
          {operationType.charAt(0).toUpperCase() + operationType.slice(1)}
        </div>
        {featured && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Destacado
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
        </div>

        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mr-1 shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="text-2xl font-bold text-primary mb-3">
          {price}
        </div>

        {(bedrooms || bathrooms || area) && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            {bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{bedrooms}</span>
              </div>
            )}
            {bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{bathrooms}</span>
              </div>
            )}
            {area && (
              <div className="flex items-center gap-1">
                <Maximize className="h-4 w-4" />
                <span>{area}</span>
              </div>
            )}
          </div>
        )}

        {publishedDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
            <Calendar className="h-3 w-3" />
            <span>Publicado hace {publishedDate}</span>
          </div>
        )}

        <Button asChild className="w-full">
          <Link href={`/propiedades/${id}`}>
            Ver más detalles
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
