import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const searches = [
  {
    title: "Alquiler en Santa Cruz",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
    href: "/alquiler/santa-cruz",
  },
  {
    title: "Venta en Santa Cruz",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
    href: "/venta/santa-cruz",
  },
  {
    title: "Venta en Bolivia",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop",
    href: "/venta/bolivia",
  },
  {
    title: "Alquiler en Bolivia",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
    href: "/alquiler/bolivia",
  },
  {
    title: "Venta en La Paz",
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&h=300&fit=crop",
    href: "/venta/la-paz",
  },
  {
    title: "Alquiler en La Paz",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=300&fit=crop",
    href: "/alquiler/la-paz",
  },
  {
    title: "Venta en Cochabamba",
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop",
    href: "/venta/cochabamba",
  },
  {
    title: "Alquiler en Cochabamba",
    image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400&h=300&fit=crop",
    href: "/alquiler/cochabamba",
  },
]

export function RecommendedSearches() {
  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Búsquedas Recomendadas
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Explora las búsquedas más populares en tu zona
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {searches.map((search, index) => (
            <Link
              key={index}
              href={search.href}
              className="group relative overflow-hidden rounded-xl aspect-[4/3] shadow-lg hover:shadow-xl transition-all"
            >
              <Image
                src={search.image}
                alt={search.title}
                fill
                className="object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {search.title}
                </h3>
                <span className="inline-flex items-center text-sm text-white/90 group-hover:text-white">
                  Ver más
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
