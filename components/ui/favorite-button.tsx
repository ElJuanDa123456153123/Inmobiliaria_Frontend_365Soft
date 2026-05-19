"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiService } from "@/lib/services/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface FavoriteButtonProps {
  propertyId: number
  className?: string
  variant?: "default" | "secondary" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function FavoriteButton({ propertyId, className, variant = "secondary", size = "icon" }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkFav = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const res = await apiService.checkFavorite(propertyId)
        setIsFavorite(res.isFavorite)
      } catch (error) {
        console.error("Error checking favorite:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkFav()
  }, [propertyId])

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation if inside a Link
    e.stopPropagation()

    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Debes iniciar sesión para guardar favoritos")
      router.push("/ingresar")
      return
    }

    try {
      if (isFavorite) {
        await apiService.removeFavorite(propertyId)
        setIsFavorite(false)
        toast.success("Eliminado de favoritos")
      } else {
        await apiService.addFavorite(propertyId)
        setIsFavorite(true)
        toast.success("Agregado a favoritos")
      }
      
      // Dispatch event to allow other components to update
      window.dispatchEvent(new Event("favorites-updated"))
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast.error("Ocurrió un error")
    }
  }

  if (isLoading) {
    return (
      <Button size={size} variant={variant} className={`rounded-full ${className}`} disabled>
        <Heart className="h-5 w-5 text-muted-foreground opacity-50" />
      </Button>
    )
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={toggleFavorite}
      className={`rounded-full ${className}`}
    >
      <Heart className={`h-5 w-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
    </Button>
  )
}
