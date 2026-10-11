"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PropertyCard } from "@/components/home/property-card"
import { apiService } from "@/lib/services/api"
import type { Property } from "@/lib/services/api"
import { getImageUrl } from "@/lib/utils"

export default function VentaPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const response = await apiService.listProperties({
          tipo_operacion: "venta"
        })
        setProperties(response.propiedades)
      } catch (err: any) {
        console.error("Error fetching properties:", err)
        setError(err.message || "Error al cargar las propiedades")
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  // Transformar datos del backend al formato que espera PropertyCard
  const mapPropertyToCard = (property: Property) => ({
    id: property.id.toString(),
    title: property.titulo,
    location: `${property.zona}${property.direccion ? `, ${property.direccion}` : ''}`,
    price: property.moneda === 'USD' ? `$${property.precio.toLocaleString()}` : `Bs ${property.precio.toLocaleString()}`,
    operationType: property.tipo_operacion as "venta" | "alquiler" | "anticretico",
    bedrooms: property.dormitorios,
    bathrooms: property.banos,
    area: `${property.metros_edificados}m²`,
    image: property.imagenes && property.imagenes.length > 0
      ? (getImageUrl(property.imagenes[0].image_url) || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop")
      : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    publishedDate: property.fecha_publicacion ? new Date(property.fecha_publicacion).toLocaleDateString() : undefined,
    featured: property.destacado,
    alquilada: property.alquilada,
    description: property.descripcion,
    agentName: property.vendedor_contacto || property.vendedor_nombre,
    agencyName: property.vendedor_nombre,
    images: property.imagenes?.map(img => getImageUrl(img.image_url) || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop") || [],
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[var(--sale)]/10 via-background to-[var(--sale)]/5 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
                Propiedades en Venta
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Encuentra la propiedad de tus sueños
              </p>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8">
              {loading ? "Cargando..." : `${properties.length} propiedades en venta`}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Cargando propiedades...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  No hay propiedades en venta en este momento
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    {...mapPropertyToCard(property)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
