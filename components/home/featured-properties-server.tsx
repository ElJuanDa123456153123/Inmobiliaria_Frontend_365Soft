import { PropertyCard } from "./property-card"
import { getFeaturedProperties } from "@/app/actions/properties"
import { getImageUrl } from "@/lib/utils"

/**
 * Server Component para propiedades destacadas
 * Se ejecuta en el servidor donde API_URL_INTERNAL está disponible
 */
export async function FeaturedPropertiesServer() {
  const result = await getFeaturedProperties()

  // Error de carga
  if (!result.success) {
    return (
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Propiedades Destacadas
            </h2>
          </div>
          <div className="text-center py-20">
            <p className="text-red-500">{result.error}</p>
            <p className="text-sm text-gray-500 mt-2">
              Asegúrate de que el backend esté corriendo
            </p>
          </div>
        </div>
      </section>
    )
  }

  const { propiedades } = result.data || { propiedades: [], total: 0, limite: 6, offset: 0 }

  // No hay propiedades
  if (propiedades.length === 0) {
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
          </div>
        </div>
      </section>
    )
  }

  // Formatear precio
  const formatPrice = (property: any) => {
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

  // Convertir propiedad del backend al formato que espera PropertyCard
  const formatProperty = (property: any) => {
    // Toggle "Agente": false = 365Soft, true = Asesor (si hay) o 365Soft (si no)
    const mostrarAgente = property.mostrar_vendedor === true;
    const mostrarAgencia = property.mostrar_agencia === true;

    // Buscar asesor asignado
    const primerAsesor = property.asesores_asignados && property.asesores_asignados.length > 0
      ? property.asesores_asignados[0].asesor
      : null;

    // Lógica del Agente: Toggle ON + Asesor → Asesor, Toggle OFF o Sin Asesor → 365Soft
    let nombreVendedor = '365Soft';
    let avatarUrl = null;
    let telefonoContacto = '';

    if (mostrarAgente && primerAsesor) {
      // Solo mostrar asesor si el toggle está ON Y hay asesor asignado
      nombreVendedor = primerAsesor.nombre;
      avatarUrl = primerAsesor.avatar_url || primerAsesor.imagen_url
        ? (getImageUrl(primerAsesor.avatar_url || primerAsesor.imagen_url) || null)
        : null;
      telefonoContacto = primerAsesor.telefono || '';
    }
    // Si no hay asesor o toggle está OFF, se mantiene 365Soft

    // Nombre de agencia: Personalizado > Vendedor real > 365Soft
    const nombreAgencia = mostrarAgencia
      ? (property.agencia_nombre_personalizado || property.vendedor_nombre)
      : '365Soft';

    // Obtener todas las imágenes usando getImageUrl
    const allImages = property.imagenes && property.imagenes.length > 0
      ? property.imagenes
          .map((img: any) => getImageUrl(img.image_url))
          .filter((url: string | null): url is string => url !== null)
      : []

    // Obtener la imagen principal
    const mainImage = property.imagenes && property.imagenes.length > 0
      ? (property.imagenes.find((img: any) => img.principal) || property.imagenes[0])
      : null

    const imageUrl = mainImage
      ? (getImageUrl(mainImage.image_url) || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop")
      : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"

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
          {propiedades.map((property) => {
            const formatted = formatProperty(property)
            return <PropertyCard key={property.id} {...formatted} />
          })}
        </div>
      </div>
    </section>
  )
}
