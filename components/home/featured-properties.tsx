"use client"

import { useEffect, useState } from "react"
import { PropertyCard } from "./property-card"
import { apiService, Property } from "@/lib/services/api"
import { Loader2 } from "lucide-react"
import { getImageUrl } from "@/lib/utils"

export function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProperties = async () => {
      try {
        // Cargar propiedades activas desde el backend
        const response = await apiService.listProperties({
          estado: "activo",  // Solo propiedades activas
          limite: 6,         // Máximo 6 propiedades
        })

        setProperties(response.propiedades)
      } catch (err) {
        console.error('Error cargando propiedades:', err)
        setError('Error al cargar propiedades')
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  // Formatear precio para mostrar
  const formatPrice = (property: Property) => {
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

  // Calcular tiempo de publicación
  const getTimeAgo = (fecha: string) => {
    const date = new Date(fecha)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Hoy'
    if (diffDays < 7) return `${diffDays} días`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} semanas`
    return `${Math.ceil(diffDays / 30)} meses`
  }

  // Convertir propiedad del backend al formato que espera PropertyCard
  const formatProperty = (property: Property) => {
    // Debug: Ver qué datos llegan
    console.log("📦 [FORMAT PROPERTY] Datos recibidos:", {
      id: property.id,
      titulo: property.titulo,
      mostrar_vendedor: property.mostrar_vendedor,
      mostrar_agencia: property.mostrar_agencia,
      num_asesores: property.asesores_asignados?.length || 0,
      primer_asesor: property.asesores_asignados?.[0]?.asesor
    })

    // Obtener todas las imágenes usando getImageUrl para normalización correcta
    const allImages = property.imagenes && property.imagenes.length > 0
      ? property.imagenes
          .map(img => getImageUrl(img.image_url))
          .filter((url): url is string => url !== null)
      : []

    // Obtener la imagen principal (primera imagen o la marcada como principal)
    const mainImage = property.imagenes && property.imagenes.length > 0
      ? (property.imagenes.find(img => img.principal) || property.imagenes[0])
      : null

    const imageUrl = mainImage
      ? (getImageUrl(mainImage.image_url) || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop")
      : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"

    // Determinar si mostrar vendedor real o 365Soft (ahora default es false = 365Soft)
    const mostrarVendedor = property.mostrar_vendedor === true;
    const mostrarAgencia = property.mostrar_agencia === true;

    // Prioridad: Asesor asignado > Vendedor real > 365Soft
    const primerAsesor = property.asesores_asignados && property.asesores_asignados.length > 0
      ? property.asesores_asignados[0].asesor
      : null;

    // Lógica del Agente: Toggle ON + Asesor → Asesor, Toggle OFF o Sin Asesor → 365Soft
    let nombreVendedor = '365Soft';
    let avatarUrl = null;
    let telefonoContacto = '';

    if (mostrarVendedor && primerAsesor) {
      // Solo mostrar asesor si el toggle está ON Y hay asesor asignado
      nombreVendedor = primerAsesor.nombre;
      avatarUrl = primerAsesor.avatar_url || primerAsesor.imagen_url
        ? (getImageUrl(primerAsesor.avatar_url || primerAsesor.imagen_url) || null)
        : null;
      telefonoContacto = primerAsesor.telefono || '';
    }
    // Si no hay asesor o toggle está OFF, se mantiene 365Soft

    const nombreAgencia = mostrarAgencia
      ? (property.agencia_nombre_personalizado || property.vendedor_nombre)
      : '365Soft';

    console.log("✅ [FORMAT PROPERTY] Valores calculados:", {
      id: property.id,
      nombreVendedor,
      nombreAgencia,
      avatarUrl,
      telefonoContacto,
      tieneAsesor: !!primerAsesor,
      nombreAsesor: primerAsesor?.nombre
    })

    return {
      id: property.id.toString(),
      title: property.titulo,
      location: property.zona,
      price: formatPrice(property),
      operationType: property.tipo_operacion as "venta" | "alquiler" | "anticretico",
      bedrooms: parseInt(property.dormitorios) || 0,
      bathrooms: parseInt(property.banos) || 0,
      area: `${property.metros_edificados}m²`,
      image: imageUrl,
      publishedDate: property.fecha_publicacion ? getTimeAgo(property.fecha_publicacion) : 'Reciente',
      featured: property.destacado,
    alquilada: property.alquilada,
      description: property.descripcion,
      agentName: nombreVendedor,
      agencyName: nombreAgencia,
      agentAvatar: avatarUrl,
      agentPhone: telefonoContacto,
      images: allImages,
    }
  }

  if (loading) {
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

          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Propiedades Destacadas
            </h2>
          </div>

          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
            <p className="text-sm text-gray-500 mt-2">
              Asegúrate de que el backend esté corriendo
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (properties.length === 0) {
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

          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              No hay propiedades activas en este momento
            </p>
            <p className="text-sm text-gray-400 mt-2">
              ¡Sé el primero en publicar una propiedad!
            </p>
          </div>
        </div>
      </section>
    )
  }

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
          {properties.map((property) => {
            const formatted = formatProperty(property)
            return <PropertyCard key={property.id} {...formatted} />
          })}
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
