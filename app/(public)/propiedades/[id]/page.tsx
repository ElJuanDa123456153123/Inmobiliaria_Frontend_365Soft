"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Heart,
  Share2,
  Phone,
  Mail,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

// Datos de ejemplo
const propertyData = {
  id: "1",
  title: "Residencia de Lujo en Urubó",
  location: "Santa Cruz, Zona Urubó",
  address: "Calle Principal #123, Urubó",
  price: "$450,000",
  operationType: "venta" as const,
  bedrooms: 4,
  bathrooms: 3,
  area: "350m²",
  description: "Hermosa residencia de lujo ubicada en la exclusiva zona de Urubó. Esta propiedad cuenta con acabados de primera calidad, amplios espacios, y una vista panorámica impresionante. La casa distribuye en sala comedor, cocina integral, 4 dormitorios con baño suite en el principal, baño de visitas, estudio, jardín y piscina.",
  images: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
  ],
  features: {
    general: [
      { name: "Año de construcción", value: "2023" },
      { name: "Estacionamiento", value: "2 vehículos" },
      { name: "Antigüedad", value: "Estreno" },
      { name: "Orientación", value: "Este" },
    ],
    amenities: [
      "Piscina",
      "Jardín",
      "Terraza",
      "Balcón",
      "Churrasquera",
      "Cuarto de servicio",
      "Bodega",
      "Sistema de seguridad",
    ],
    services: [
      "Agua potable",
      "Electricidad",
      "Gas domiciliario",
      "Internet fibra óptica",
      "Cable",
    ],
  },
  agent: {
    name: "María González",
    company: "365 Inmobiliaria",
    phone: "+591 777 12345",
    email: "maria@365soft.bo",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  },
  publishedDate: "2 días",
  coordinates: {
    lat: -17.7563,
    lng: -63.1474,
  },
}

export default function PropertyDetailPage() {
  const params = useParams()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % propertyData.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? propertyData.images.length - 1 : prev - 1
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground">Inicio</a>
              <span className="mx-2">/</span>
              <a href="/propiedades" className="hover:text-foreground">Propiedades</a>
              <span className="mx-2">/</span>
              <span className="text-foreground">{propertyData.title}</span>
            </nav>
          </div>
        </div>

        {/* Gallery */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-muted">
              <Image
                src={propertyData.images[currentImageIndex]}
                alt={propertyData.title}
                fill
                className="object-cover"
              />

              {/* Navigation arrows */}
              {propertyData.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Image counter */}
              {propertyData.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
                  {currentImageIndex + 1} / {propertyData.images.length}
                </div>
              )}

              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="rounded-full"
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button size="icon" variant="secondary" className="rounded-full">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Thumbnails */}
            {propertyData.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {propertyData.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-video w-32 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Vista ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Property Details */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2">
                        {propertyData.title}
                      </h1>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{propertyData.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {propertyData.price}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {propertyData.operationType}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex gap-6 py-4 border-y border-border">
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{propertyData.bedrooms} Dormitorios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{propertyData.bathrooms} Baños</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Maximize className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{propertyData.area}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Descripción</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {propertyData.description}
                  </p>
                </div>

                {/* Features */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Características</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {propertyData.features.general.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
                      >
                        <span className="text-muted-foreground">{feature.name}</span>
                        <span className="font-semibold">{feature.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Servicios y Amenidades</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {propertyData.features.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Servicios Disponibles</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {propertyData.features.services.map((service, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0" />
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Ubicación</h2>
                  <div className="bg-muted rounded-lg p-6 text-center">
                    <MapPin className="h-12 w-12 mx-auto text-primary mb-4" />
                    <p className="text-lg font-medium mb-2">{propertyData.address}</p>
                    <p className="text-muted-foreground mb-4">{propertyData.location}</p>
                    <Button variant="outline">
                      Ver en mapa
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sidebar - Contact Card */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-6">
                  {/* Agent Card */}
                  <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                    <h3 className="font-semibold text-lg mb-4">Contactar Agente</h3>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted">
                        <Image
                          src={propertyData.agent.image}
                          alt={propertyData.agent.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold">{propertyData.agent.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {propertyData.agent.company}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button className="w-full" size="lg">
                        <Phone className="h-4 w-4 mr-2" />
                        Llamar ahora
                      </Button>
                      <Button className="w-full" variant="outline" size="lg">
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar mensaje
                      </Button>
                      <Button className="w-full" variant="outline" size="lg">
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </Button>
                    </div>

                    <div className="pt-4 border-t border-border space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{propertyData.agent.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{propertyData.agent.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Publication Date */}
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Publicado hace {propertyData.publishedDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
