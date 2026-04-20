"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { adminApi, AdminProperty } from "@/lib/services/admin-api"
import { toast } from "sonner"

export default function AdminEditarPropiedadPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<AdminProperty | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperty()
  }, [params.id])

  const fetchProperty = async () => {
    try {
      const data = await adminApi.getProperty(Number(params.id))
      setProperty(data)
    } catch (error: any) {
      toast.error("Error cargando propiedad")
      router.push("/admin/propiedades")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    try {
      const propertyData = {
        titulo: formData.datosOperacion.titulo,
        tipo_operacion: formData.datosOperacion.tipoOperacion,
        precio: parseFloat(formData.datosOperacion.precio),
        moneda: formData.datosOperacion.moneda,
        acepta_permuta: formData.datosOperacion.aceptaPermuta,
        financia: formData.datosOperacion.financia,
        tipo_propiedad: formData.datosGenerales.tipoPropiedad,
        direccion: formData.datosGenerales.direccion,
        zona: formData.datosGenerales.zona,
        tipo_marcador: formData.datosGenerales.tipoMarcador,
        latitud: formData.datosGenerales.latitud,
        longitud: formData.datosGenerales.longitud,
        mostrar_direccion: formData.datosGenerales.mostrarDireccion,
        dormitorios: formData.detallesPropiedad.dormitorios,
        banos: formData.detallesPropiedad.banos,
        garaje: formData.detallesPropiedad.garaje,
        metros_edificados: parseFloat(formData.detallesPropiedad.metrosEdificados),
        metros_terreno: parseFloat(formData.detallesPropiedad.metrosTerreno),
        estado: formData.detallesPropiedad.estado,
        ano_construccion: parseInt(formData.detallesPropiedad.anoConstruccion) || 0,
        apto_oficina: formData.detallesPropiedad.aptoOficina,
        vivienda_social: formData.detallesPropiedad.viviendaSocial,
        condominio: formData.detallesPropiedad.condominio,
        cantidad_pisos: parseInt(formData.detallesPropiedad.cantidadPisos) || 1,
        confort: formData.confortSeguridad.noAplica ? [] : formData.confortSeguridad.confort,
        seguridad: formData.confortSeguridad.noAplica ? [] : formData.confortSeguridad.seguridad,
        no_aplica_confort: formData.confortSeguridad.noAplica,
        imagenes: formData.imagenesDatos.imagenes.map((img: any) => ({
          url: img.url,
          orden: img.orden,
        })),
        video_url: formData.imagenesDatos.video,
        descripcion: formData.descripcionDatos.descripcion,
        terminos_condiciones: formData.descripcionDatos.terminosCondiciones,
        advisor_id: formData.advisorId || undefined,
      }

      await adminApi.updateProperty(Number(params.id), propertyData)
      toast.success("Propiedad actualizada exitosamente")
      router.push("/admin/propiedades")
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar propiedad")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        Cargando propiedad...
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        Propiedad no encontrada
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Edit className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Editar Propiedad #{params.id}</h1>
              <p className="text-white/90 text-sm">{property.titulo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del formulario */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">Editar Propiedad</h2>
          <p className="text-muted-foreground mb-6">
            El formulario multi-paso existente se integrará aquí.
            Por ahora, esta es una vista placeholder.
          </p>

          {/* Información de la propiedad actual */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-4">Información Actual</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-700">Título:</span>
                <p className="text-gray-700">{property.titulo}</p>
              </div>
              <div>
                <span className="font-medium text-blue-700">Precio:</span>
                <p className="text-gray-700">
                  {property.moneda === 'USD' ? 'U$S' : 'Bs'} {property.precio.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="font-medium text-blue-700">Tipo:</span>
                <p className="text-gray-700">{property.tipo_propiedad} - {property.tipo_operacion}</p>
              </div>
              <div>
                <span className="font-medium text-blue-700">Zona:</span>
                <p className="text-gray-700">{property.zona}</p>
              </div>
              <div>
                <span className="font-medium text-blue-700">Estado:</span>
                <p className="text-gray-700">{property.estado_propiedad}</p>
              </div>
              <div>
                <span className="font-medium text-blue-700">Vendedor:</span>
                <p className="text-gray-700">{property.vendedor_nombre}</p>
              </div>
              {property.advisor && (
                <div>
                  <span className="font-medium text-blue-700">Asesor:</span>
                  <p className="text-gray-700">{property.advisor.nombre}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Para editar la propiedad completamente, necesitarías
              integrar el formulario multi-paso existente y precargarlo con los datos de la propiedad.
            </p>
          </div>

          {/* Botones de acción rápida */}
          <div className="flex gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/propiedades")}
            >
              Volver sin guardar
            </Button>
            <Button
              onClick={() => toast.success("La edición completa se integrará aquí")}
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
