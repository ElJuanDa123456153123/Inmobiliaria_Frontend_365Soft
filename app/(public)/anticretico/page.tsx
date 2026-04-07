import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PropertyCard } from "@/components/home/property-card"

const anticreticoProperties = [
  {
    id: "3",
    title: "Casa Familiar",
    location: "Cochabamba, Cala Cala",
    price: "Bs 8,000 Anticrético",
    operationType: "anticretico" as const,
    bedrooms: 3,
    bathrooms: 2,
    area: "200m²",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
    publishedDate: "3 días",
    featured: true,
  },
]

export default function AnticreticoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[var(--anticretico)]/10 via-background to-[var(--anticretico)]/5 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
                Propiedades en Anticrético
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Sistema anticrético boliviano
              </p>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8">
              {anticreticoProperties.length} propiedades en anticrético
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {anticreticoProperties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>

            {anticreticoProperties.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">
                  No hay propiedades en anticrético disponibles en este momento
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
