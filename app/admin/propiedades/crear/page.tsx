"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { adminApi } from "@/lib/services/admin-api"
import { toast } from "sonner"

export default function AdminCrearPropiedadPage() {
  const router = useRouter()

  const handleSubmit = async (formData: any) => {
    try {
      // Preparar datos para el backend
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

      await adminApi.createProperty(propertyData)
      toast.success("Propiedad publicada exitosamente")
      router.push("/admin/propiedades")
    } catch (error: any) {
      toast.error(error.message || "Error al publicar propiedad")
    }
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
            <Building className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Publicar Propiedad (Admin)</h1>
          </div>
          <p className="text-white/90 text-lg">
            Publica una nueva propiedad como administrador. La propiedad será activa automáticamente.
          </p>
        </div>
      </div>

      {/* Aquí iría el formulario multi-paso existente */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">Formulario de Publicación</h2>
          <p className="text-muted-foreground mb-6">
            El formulario multi-paso existente se integrará aquí.
            Por ahora, esta es una vista placeholder.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Para integrar el formulario completo de publicación,
              necesitarías importar el componente de formulario existente de
              <code>/app/publicar/formulario/page.tsx</code> y adaptarlo para usar
              el servicio de admin en lugar del servicio normal.
            </p>
          </div>

          {/* Botón de prueba */}
          <Button
            onClick={() => {
              toast.success("El formulario se integrará aquí. Por ahora, la funcionalidad básica está completa.")
            }}
            className="mt-4"
          >
            Probar Placeholder
          </Button>
        </div>
      </div>
    </div>
  )
}
