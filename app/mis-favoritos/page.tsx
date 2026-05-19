"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PropertyCard } from "@/components/home/property-card"
import { apiService, Property } from "@/lib/services/api"
import { Heart, Loader2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getImageUrl } from "@/lib/utils"

interface Favorite {
  id: number
  property_id: number
  property: Property
}

export default function MisFavoritosPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFavorites = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/ingresar")
      return
    }

    try {
      setLoading(true)
      const res = await apiService.getFavorites()
      setFavorites(res.favorites || [])
    } catch (error) {
      console.error("Error fetching favorites:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()

    // Escuchar el evento de favoritos actualizados para recargar la lista si el usuario
    // desmarca uno mientras está en esta página.
    window.addEventListener("favorites-updated", fetchFavorites)
    return () => {
      window.removeEventListener("favorites-updated", fetchFavorites)
    }
  }, [router])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favorites.map((fav) => {
                const property = fav.property
                // Procesar imágenes
                const images = property.imagenes && property.imagenes.length > 0
                  ? property.imagenes.sort((a, b) => a.orden - b.orden).map(img => getImageUrl(img.image_url) || img.image_url)
                  : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"] // Fallback image

                // Formatear precio
                const moneda = property.moneda === 'BOB' ? 'Bs' : '$'
                let precioFormateado = `${moneda} ${property.precio.toLocaleString()}`
                if (property.tipo_operacion === 'alquiler') {
                  precioFormateado += '/mes'
                } else if (property.tipo_operacion === 'anticretico') {
                  precioFormateado += ' Anticrético'
                }

                return (
                  <PropertyCard
                    key={property.id}
                    id={property.id.toString()}
                    title={property.titulo}
                    location={property.zona}
                    price={precioFormateado}
                    operationType={property.tipo_operacion as any}
                    bedrooms={property.dormitorios}
                    bathrooms={property.banos}
                    area={property.metros_edificados > 0 ? `${property.metros_edificados} m²` : undefined}
                    image={images[0]}
                    images={images}
                    publishedDate={property.fecha_publicacion}
                    featured={property.destacado}
                    description={property.descripcion}
                    agentName={property.mostrar_vendedor ? property.vendedor_nombre : "365Soft"}
                    agencyName={property.mostrar_agencia && property.agencia_nombre_personalizado ? property.agencia_nombre_personalizado : undefined}
                    agentPhone={property.mostrar_vendedor ? property.vendedor_telefono : undefined}
                  />
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-border">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aún no tienes favoritos</h3>
              <p className="text-muted-foreground mb-6">
                Explora nuestras propiedades y guarda las que más te gusten haciendo clic en el corazón.
              </p>
              <Button onClick={() => router.push('/')} size="lg">
                <Home className="w-4 h-4 mr-2" />
                Explorar propiedades
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
