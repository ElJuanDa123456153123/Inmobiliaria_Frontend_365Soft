"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { MapPin, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { apiService, Property } from "@/lib/services/api"
import { toast } from "sonner"
import dynamic from "next/dynamic"

// Cargar el mapa de forma dinámica para evitar problemas de SSR
const Mapa = dynamic(() => import("@/components/mapa/Mapa"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse rounded-lg" />
})

export default function PropertyMapPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperty = async () => {
      const id = params.id
      if (!id) return

      try {
        const propertyData = await apiService.getProperty(parseInt(id as string))
        setProperty(propertyData)
      } catch (error) {
        console.error('Error cargando propiedad:', error)
        toast.error('Error al cargar la propiedad')
        router.push(`/propiedades/${id}`)
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando mapa...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!property || !property.latitud || !property.longitud) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Ubicación no disponible</p>
            <Button
              onClick={() => router.back()}
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Header con título y botón volver */}
        <div className="bg-white border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  size="icon"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-red-500" />
                    Ubicación de la propiedad
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {property.titulo}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa completo */}
        <div className="w-full h-[calc(100vh-180px)]">
          <Mapa
            latitud={property.latitud}
            longitud={property.longitud}
            zoom={16}
            height="100%"
            interactive={true}
            showMarker={true}
          />
        </div>

        {/* Información de dirección */}
        <div className="bg-white border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5 text-red-500" />
              <div>
                {property.direccion && (
                  <p className="font-medium text-foreground">
                    {property.direccion}, {property.zona}
                  </p>
                )}
                {!property.direccion && (
                  <p className="font-medium text-foreground">
                    {property.zona}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
