import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PropertyCard } from "@/components/home/property-card"

const ventaProperties = [
  {
    id: "1",
    title: "Residencia de Lujo en Urubó",
    location: "Santa Cruz, Zona Urubó",
    price: "$450,000",
    operationType: "venta" as const,
    bedrooms: 4,
    bathrooms: 3,
    area: "350m²",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    publishedDate: "2 días",
    featured: true,
  },
  {
    id: "4",
    title: "Penthouse con Vista",
    location: "Santa Cruz, Equipetrol",
    price: "$280,000",
    operationType: "venta" as const,
    bedrooms: 3,
    bathrooms: 2,
    area: "180m²",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    publishedDate: "5 días",
  },
  {
    id: "6",
    title: "Casa con Jardín",
    location: "Cochabamba, Cota Cota",
    price: "$195,000",
    operationType: "venta" as const,
    bedrooms: 4,
    bathrooms: 3,
    area: "280m²",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
    publishedDate: "4 días",
  },
  {
    id: "8",
    title: "Villa de Lujo",
    location: "Santa Cruz, San Martín",
    price: "$750,000",
    operationType: "venta" as const,
    bedrooms: 5,
    bathrooms: 4,
    area: "450m²",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop",
    publishedDate: "1 semana",
    featured: true,
  },
]

export default function VentaPage() {
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
              {ventaProperties.length} propiedades en venta
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ventaProperties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
