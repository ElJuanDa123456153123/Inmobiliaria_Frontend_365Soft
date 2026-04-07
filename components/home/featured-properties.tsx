import { PropertyCard } from "./property-card"

// Datos de ejemplo - después vendrán de la API
const featuredProperties = [
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
]

export function FeaturedProperties() {
  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Propiedades Destacadas
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Las mejores oportunidades inmobiliarias seleccionadas para ti
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            Ver todas las propiedades
          </button>
        </div>
      </div>
    </section>
  )
}
