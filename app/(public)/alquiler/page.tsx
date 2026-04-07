import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PropertyCard } from "@/components/home/property-card"

const alquilerProperties = [
  {
    id: "2",
    title: "Departamento Moderno",
    location: "La Paz, Achumani",
    price: "$1,200/mes",
    operationType: "alquiler" as const,
    bedrooms: 2,
    bathrooms: 2,
    area: "120m²",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    publishedDate: "1 semana",
  },
  {
    id: "5",
    title: "Loft Industrial",
    location: "La Paz, Sopocachi",
    price: "$850/mes",
    operationType: "alquiler" as const,
    bedrooms: 1,
    bathrooms: 1,
    area: "85m²",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    publishedDate: "1 día",
  },
  {
    id: "7",
    title: "Departamento en el Centro",
    location: "Santa Cruz, Centro",
    price: "$650/mes",
    operationType: "alquiler" as const,
    bedrooms: 2,
    bathrooms: 1,
    area: "90m²",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    publishedDate: "6 días",
  },
]

export default function AlquilerPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[var(--rent)]/10 via-background to-[var(--rent)]/5 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
                Propiedades en Alquiler
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Alquila la propiedad perfecta para ti
              </p>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8">
              {alquilerProperties.length} propiedades en alquiler
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {alquilerProperties.map((property) => (
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
