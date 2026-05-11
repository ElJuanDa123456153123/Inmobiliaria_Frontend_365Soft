"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  UserCog,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { apiService, Property } from "@/lib/services/api"
import { toast } from "sonner"
import { getImageUrl } from "@/lib/utils"
import dynamic from "next/dynamic"

// Cargar el mapa de forma dinámica para evitar problemas de SSR
const Mapa = dynamic(() => import("@/components/mapa/Mapa"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse rounded-lg" />
})

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  // Cargar propiedad desde el backend
  useEffect(() => {
    const fetchProperty = async () => {
      const id = params.id
      if (!id) return

      try {
        const propertyData = await apiService.getProperty(parseInt(id as string))
        console.log("📝 Propiedad cargada:", {
          id: propertyData.id,
          titulo: propertyData.titulo,
          asesores_asignados: propertyData.asesores_asignados,
          num_asesores: propertyData.asesores_asignados?.length || 0
        })
        setProperty(propertyData)
      } catch (error) {
        console.error('Error cargando propiedad:', error)
        toast.error('Error al cargar la propiedad')
        router.push('/propiedades')
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [params.id, router])

  // Formatear precio
  const formatPrice = () => {
    if (!property) return ''

    const precio = property.precio
    const moneda = property.moneda === 'BOB' ? 'Bs' : '$'

    if (property.tipo_operacion === 'alquiler') {
      return `${moneda} ${precio.toLocaleString()}/mes`
    } else if (property.tipo_operacion === 'anticretico') {
      return `${moneda} ${precio.toLocaleString()} Anticrético`
    } else {
      return `${moneda} ${precio.toLocaleString()}`
    }
  }

  // Obtener imágenes
  const getImages = () => {
    if (!property?.imagenes || property.imagenes.length === 0) {
      return ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop"]
    }
    return property.imagenes.map(img => getImageUrl(img.image_url) || img.image_url)
  }

  const images = getImages()

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando propiedad...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!property) {
    return null
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
              <span className="text-foreground">{property.titulo}</span>
            </nav>
          </div>
        </div>

        {/* Gallery */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-muted">
              <img
                src={images[currentImageIndex]}
                alt={property.titulo}
                className="w-full h-full object-cover"
              />

              {/* Navigation arrows */}
              {images.length > 1 && (
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
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
                  {currentImageIndex + 1} / {images.length}
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
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-video w-32 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Vista ${index + 1}`}
                      className="w-full h-full object-cover"
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
                        {property.titulo}
                      </h1>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{property.zona}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {formatPrice()}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {property.tipo_operacion}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex gap-6 py-4 border-y border-border">
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{property.dormitorios} Dormitorios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{property.banos} Baños</span>
                    </div>
                    {property.garaje && property.garaje !== "0" && (
                      <div className="flex items-center gap-2">
                        <Maximize className="h-5 w-5 text-primary" />
                        <span className="font-semibold">{property.garaje} Garaje(s)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Maximize className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{property.metros_edificados}m²</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Descripción</h2>
                  <div
                    className="text-muted-foreground leading-relaxed [&_p]:mb-4 [&_p]:last:mb-0"
                    dangerouslySetInnerHTML={{ __html: property.descripcion }}
                  />
                </div>

                {/* Confort y Seguridad */}
                {property.confort && Array.isArray(property.confort) && property.confort.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Confort</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {property.confort.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500 shrink-0" />
                          <span className="capitalize">{item.replace(/-/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {property.seguridad && Array.isArray(property.seguridad) && property.seguridad.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Seguridad</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {property.seguridad.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0" />
                          <span className="capitalize">{item.replace(/-/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Características</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {property.ano_construccion && (
                      <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                        <span className="text-muted-foreground">Año de construcción</span>
                        <span className="font-semibold">{property.ano_construccion}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                      <span className="text-muted-foreground">Estado</span>
                      <span className="font-semibold capitalize">{property.estado}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                      <span className="text-muted-foreground">Tipo de propiedad</span>
                      <span className="font-semibold capitalize">{property.tipo_propiedad}</span>
                    </div>
                    {property.metros_terreno > 0 && (
                      <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                        <span className="text-muted-foreground">Metros de terreno</span>
                        <span className="font-semibold">{property.metros_terreno}m²</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                      <span className="text-muted-foreground">Pisos</span>
                      <span className="font-semibold">{property.cantidad_pisos}</span>
                    </div>
                    {property.apto_oficina && (
                      <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                        <span className="text-muted-foreground">Apto oficina</span>
                        <span className="font-semibold">Sí</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                {property.latitud && property.longitud && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Ubicación</h2>
                    <div
                      className="relative rounded-lg overflow-hidden border border-border cursor-pointer group"
                      onClick={() => router.push(`/propiedades/${params.id}/mapa`)}
                    >
                      <div className="aspect-video w-full bg-muted">
                        <Mapa
                          latitud={property.latitud}
                          longitud={property.longitud}
                          zoom={15}
                          height="100%"
                          interactive={false}
                          showMarker={true}
                        />
                      </div>
                      {/* Overlay con hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                        <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                          <ExternalLink className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Click para ver mapa completo</span>
                        </div>
                      </div>
                    </div>
                    {property.direccion && (
                      <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {property.direccion}, {property.zona}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar - Contact Card */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-6">
                  {/* Asesores Asignados - Prioridad sobre vendedor */}
                  {property.asesores_asignados && property.asesores_asignados.length > 0 ? (
                    <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                      <h3 className="font-semibold text-lg mb-4">Contactar Asesor</h3>

                      <div className="space-y-4">
                        {property.asesores_asignados.map((asignacion) => {
                          const asesor = asignacion.asesor
                          if (!asesor) return null

                          return (
                            <div key={asignacion.id} className="space-y-4">
                              {/* Info del asesor */}
                              <div
                                className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border"
                              >
                                {/* Foto del asesor */}
                                {asesor.avatar_url || asesor.imagen_url ? (
                                  <img
                                    src={getImageUrl(asesor.avatar_url || asesor.imagen_url) || asesor.avatar_url || asesor.imagen_url}
                                    alt={asesor.nombre}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-primary flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 text-white text-xl font-bold">
                                    {asesor.nombre.charAt(0).toUpperCase()}
                                  </div>
                                )}

                                {/* Información del asesor */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-base">{asesor.nombre}</p>
                                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                                    {asesor.especialidad && (
                                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                        {asesor.especialidad}
                                      </span>
                                    )}
                                  </div>
                                  {asesor.telefono && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                      <Phone className="h-3 w-3" />
                                      <span>{asesor.telefono}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Botones de contacto */}
                              <div className="space-y-3">
                                {asesor.telefono && (
                                  <Button className="w-full" size="lg" asChild>
                                    <a href={`tel:${asesor.telefono}`}>
                                      <Phone className="h-4 w-4 mr-2" />
                                      Llamar ahora
                                    </a>
                                  </Button>
                                )}
                                {asesor.email && (
                                  <Button className="w-full" variant="outline" size="lg" asChild>
                                    <a href={`mailto:${asesor.email}`}>
                                      <Mail className="h-4 w-4 mr-2" />
                                      Enviar mensaje
                                    </a>
                                  </Button>
                                )}
                                <Button className="w-full" variant="outline" size="lg">
                                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                  </svg>
                                  WhatsApp
                                </Button>
                              </div>

                              {/* Info adicional */}
                              {(asesor.telefono || asesor.email) && (
                                <div className="pt-4 border-t border-border space-y-2 text-sm">
                                  {asesor.telefono && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Phone className="h-4 w-4" />
                                      <span>{asesor.telefono}</span>
                                    </div>
                                  )}
                                  {asesor.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Mail className="h-4 w-4" />
                                      <span>{asesor.email}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Agent Card - Solo si no hay asesores asignados */
                    <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                      <h3 className="font-semibold text-lg mb-4">Contactar Vendedor</h3>

                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-2xl font-bold">
                          {property.vendedor_nombre.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold">{property.vendedor_nombre}</div>
                          <div className="text-sm text-muted-foreground">
                            {property.vendedor_contacto || "Propietario"}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {property.vendedor_telefono && (
                          <Button className="w-full" size="lg" asChild>
                            <a href={`tel:${property.vendedor_telefono}`}>
                              <Phone className="h-4 w-4 mr-2" />
                              Llamar ahora
                            </a>
                          </Button>
                        )}
                        {property.vendedor_email && (
                          <Button className="w-full" variant="outline" size="lg" asChild>
                            <a href={`mailto:${property.vendedor_email}`}>
                              <Mail className="h-4 w-4 mr-2" />
                              Enviar mensaje
                            </a>
                          </Button>
                        )}
                        <Button className="w-full" variant="outline" size="lg">
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          WhatsApp
                        </Button>
                      </div>

                      <div className="pt-4 border-t border-border space-y-2 text-sm">
                        {property.vendedor_telefono && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{property.vendedor_telefono}</span>
                          </div>
                        )}
                        {property.vendedor_horario && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{property.vendedor_horario}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Publication Date */}
                  {property.fecha_publicacion && (
                    <div className="bg-card rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Publicado el {new Date(property.fecha_publicacion).toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  )}
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
