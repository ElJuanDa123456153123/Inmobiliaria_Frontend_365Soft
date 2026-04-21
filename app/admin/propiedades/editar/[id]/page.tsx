"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { adminApi, AdminProperty } from "@/lib/services/admin-api"
import { toast } from "sonner"
import { FormularioProvider, useFormularioPublicacion } from "@/lib/contexts/FormularioContext"
import dynamicImport from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

// Dynamically import components with SSR disabled
const MapaSelector = dynamicImport(() => import("@/components/mapa/MapaSelector"), { ssr: false })
const AutocompleteUbicacion = dynamicImport(() => import("@/components/mapa/AutocompleteUbicacion"), { ssr: false })
const UploadImagenes = dynamicImport(() => import("@/components/propiedades/UploadImagenes"), { ssr: false })
const EditorDescripcion = dynamicImport(() => import("@/components/propiedades/EditorDescripcion"), { ssr: false })
const ResumenPublicacion = dynamicImport(() => import("@/components/propiedades/ResumenPublicacion"), { ssr: false })

type PasoType = 1 | 2 | 3 | 4 | 5 | 6 | 7

const pasos = [
  { id: 1, nombre: "Datos operación" },
  { id: 2, nombre: "Datos generales" },
  { id: 3, nombre: "Detalles de la propiedad" },
  { id: 4, nombre: "Confort y seguridad" },
  { id: 5, nombre: "Gestor imágen." },
  { id: 6, nombre: "Descripción" },
  { id: 7, nombre: "Resumen" },
]

function AdminEditarFormulario({ property }: { property: AdminProperty }) {
  const router = useRouter()
  const [publishing, setPublishing] = useState(false)
  const [mapaCentro, setMapaCentro] = useState<{ lat: number; lng: number } | undefined>(
    property.latitud && property.longitud ? { lat: property.latitud, lng: property.longitud } : undefined
  )
  const [advisorId, setAdvisorId] = useState<number | undefined>(property.advisor?.id)
  const {
    pasoActual,
    datosOperacion,
    datosGenerales,
    detallesPropiedad,
    confortSeguridad,
    imagenesDatos,
    descripcionDatos,
    setPasoActual,
    setDatosOperacion,
    setDatosGenerales,
    setDetallesPropiedad,
    setConfortSeguridad,
    setImagenesDatos,
    setDescripcionDatos,
    resetFormulario,
  } = useFormularioPublicacion()

  // Precargar datos de la propiedad
  useEffect(() => {
    if (property) {
      // Paso 1 - Datos operación
      setDatosOperacion({
        titulo: property.titulo || '',
        tipoOperacion: (property.tipo_operacion || 'venta') as 'venta' | 'alquiler' | 'anticretico',
        precio: property.precio?.toString() || '',
        moneda: (property.moneda || 'USD') as 'USD' | 'BOB',
        aceptaPermuta: property.acepta_permuta || false,
        financia: property.financia || false,
      })

      // Paso 2 - Datos generales
      setDatosGenerales({
        tipoPropiedad: (property.tipo_propiedad || '') as 'casa' | 'departamento' | 'terreno' | 'oficina' | 'local',
        direccion: property.direccion || '',
        zona: property.zona || '',
        tipoMarcador: (property.tipo_marcador || 'punto-exacto') as 'punto-exacto' | 'aproximado',
        latitud: property.latitud,
        longitud: property.longitud,
        mostrarDireccion: property.mostrar_direccion || false,
      })

      // Paso 3 - Detalles
      setDetallesPropiedad({
        dormitorios: property.dormitorios || '',
        banos: property.banos || '',
        garaje: property.garaje || '0',
        metrosEdificados: property.metros_edificados?.toString() || '',
        metrosTerreno: property.metros_terreno?.toString() || '',
        estado: property.estado || '',
        anoConstruccion: property.ano_construccion?.toString() || '',
        aptoOficina: property.apto_oficina || false,
        viviendaSocial: property.vivienda_social || false,
        condominio: property.condominio || false,
        cantidadPisos: property.cantidad_pisos?.toString() || '1',
      })

      // Paso 4 - Confort y seguridad
      setConfortSeguridad({
        confort: property.confort || [],
        seguridad: property.seguridad || [],
        noAplica: property.no_aplica_confort || false,
      })

      // Paso 5 - Imágenes
      if (property.property_images && property.property_images.length > 0) {
        setImagenesDatos({
          imagenes: property.property_images.map(img => ({
            id: img.id.toString(),
            url: img.url,
            preview: img.url,
            file: undefined,
            orden: img.orden,
            uploaded: true,
            error: ''
          })),
          video: property.video_url || ''
        })
      }

      // Paso 6 - Descripción
      setDescripcionDatos({
        descripcion: property.descripcion || '',
        terminosCondiciones: property.terminos_condiciones || ''
      })
    }
  }, [property])

  const handleNextStep = () => {
    if (pasoActual < 7) {
      if (!validarPasoActual()) {
        toast.error('Completa los campos obligatorios antes de continuar')
        return
      }
      setPasoActual(pasoActual + 1)
      toast.success('Progreso guardado')
    }
  }

  const handlePrevStep = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1)
    }
  }

  const handleUbicacionSeleccionada = (lat: number, lng: number, zona?: string) => {
    setMapaCentro({ lat, lng })
    setDatosGenerales({
      latitud: lat,
      longitud: lng
    })
    if (zona) {
      setDatosGenerales({
        zona: zona
      })
    }
  }

  const validarPasoActual = () => {
    switch (pasoActual) {
      case 1:
        return datosOperacion.titulo.length >= 10 &&
               datosOperacion.tipoOperacion &&
               datosOperacion.precio
      case 2:
        return datosGenerales.tipoPropiedad &&
               datosGenerales.zona.length >= 3
      case 3:
        return detallesPropiedad.dormitorios &&
               detallesPropiedad.banos &&
               detallesPropiedad.metrosEdificados &&
               detallesPropiedad.estado
      case 5:
        return imagenesDatos.imagenes.length >= 1
      case 6:
        return descripcionDatos.descripcion.length >= 20
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    const imagenesSinSubir = imagenesDatos.imagenes.filter(img => !img.url || img.error)
    if (imagenesSinSubir.length > 0) {
      toast.error('Hay imágenes que aún no se han subido o tienen errores.')
      return
    }

    setPublishing(true)

    try {
      const imagenesSubidas = imagenesDatos.imagenes
        .filter(img => img.url)
        .map(img => ({
          url: img.url!,
          orden: img.orden,
        }))

      const payload = {
        titulo: datosOperacion.titulo.trim(),
        tipo_operacion: datosOperacion.tipoOperacion,
        precio: parseFloat(datosOperacion.precio) || 0,
        moneda: datosOperacion.moneda,
        acepta_permuta: datosOperacion.aceptaPermuta,
        financia: datosOperacion.financia,
        tipo_propiedad: datosGenerales.tipoPropiedad,
        direccion: datosGenerales.direccion.trim(),
        zona: datosGenerales.zona.trim(),
        tipo_marcador: datosGenerales.tipoMarcador,
        latitud: datosGenerales.latitud,
        longitud: datosGenerales.longitud,
        mostrar_direccion: datosGenerales.mostrarDireccion,
        dormitorios: detallesPropiedad.dormitorios,
        banos: detallesPropiedad.banos,
        garaje: detallesPropiedad.garaje || '0',
        metros_edificados: parseFloat(detallesPropiedad.metrosEdificados) || 0,
        metros_terreno: parseFloat(detallesPropiedad.metrosTerreno) || 0,
        estado: detallesPropiedad.estado,
        ano_construccion: parseInt(detallesPropiedad.anoConstruccion) || 0,
        apto_oficina: detallesPropiedad.aptoOficina,
        vivienda_social: detallesPropiedad.viviendaSocial,
        condominio: detallesPropiedad.condominio,
        cantidad_pisos: parseInt(detallesPropiedad.cantidadPisos) || 1,
        confort: confortSeguridad.confort,
        seguridad: confortSeguridad.seguridad,
        no_aplica_confort: confortSeguridad.noAplica,
        imagenes: imagenesSubidas,
        video_url: imagenesDatos.video.trim(),
        descripcion: descripcionDatos.descripcion.trim(),
        terminos_condiciones: descripcionDatos.terminosCondiciones.trim(),
        advisor_id: advisorId,
      }

      await adminApi.updateProperty(property.id, payload)
      toast.success('¡Propiedad actualizada con éxito!')
      setTimeout(() => {
        router.push('/admin/propiedades')
      }, 1500)
    } catch (error: any) {
      console.error('Error actualizando propiedad:', error)
      toast.error(error.message || 'Error al actualizar la propiedad')
    } finally {
      setPublishing(false)
    }
  }

  const calcularProgreso = () => {
    return Math.round((pasoActual / 7) * 100)
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
              <h1 className="text-3xl font-bold">Editar Propiedad #{property.id}</h1>
              <p className="text-white/90 text-sm">{property.titulo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del formulario */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Pasos */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Editar propiedad
                </h2>

                <nav className="space-y-1">
                  {pasos.map((paso) => (
                    <button
                      key={paso.id}
                      onClick={() => setPasoActual(paso.id as PasoType)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        pasoActual === paso.id
                          ? "bg-primary text-white font-semibold"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span className="text-sm">
                        {pasoActual === paso.id ? "▶" : " "} {paso.id}. {paso.nombre}
                      </span>
                    </button>
                  ))}
                </nav>

                <div className="border-t mt-6 pt-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Progreso de edición
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${calcularProgreso()}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {calcularProgreso()}% completado
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Editar propiedad
                </h2>

                <h3 className="text-lg font-semibold text-gray-800 mb-6">
                  {pasoActual}. {pasos.find(p => p.id === pasoActual)?.nombre}
                </h3>

                <AnimatePresence mode="wait">
                  {/* PASO 1 - Datos de la operación */}
                  {pasoActual === 1 && (
                    <motion.div
                      key="paso1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Título de la propiedad <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          value={datosOperacion.titulo}
                          onChange={(e) => setDatosOperacion({ titulo: e.target.value })}
                          placeholder=""
                          maxLength={80}
                          className="bg-gray-50 border-gray-300"
                        />
                        <p className="text-xs text-gray-500 mt-1">Quedan {80 - datosOperacion.titulo.length} car.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tipo de operación <span className="text-red-500">*</span>
                        </label>
                        <Select value={datosOperacion.tipoOperacion} onValueChange={(value) => setDatosOperacion({ tipoOperacion: value as any })}>
                          <SelectTrigger className="bg-gray-50 border-gray-300">
                            <SelectValue placeholder="Venta" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="venta">Venta</SelectItem>
                            <SelectItem value="alquiler">Alquiler</SelectItem>
                            <SelectItem value="anticretico">Anticrético</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Precio de venta <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <Select value={datosOperacion.moneda} onValueChange={(value) => setDatosOperacion({ moneda: value as any })}>
                            <SelectTrigger className="w-24 bg-gray-50 border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">U$S</SelectItem>
                              <SelectItem value="BOB">Bs</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            value={datosOperacion.precio}
                            onChange={(e) => setDatosOperacion({ precio: e.target.value })}
                            placeholder=""
                            className="flex-1 bg-gray-50 border-gray-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Acepta permuta:
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="aceptaPermuta"
                              checked={datosOperacion.aceptaPermuta}
                              onChange={() => setDatosOperacion({ aceptaPermuta: true })}
                            />
                            <span>Sí</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="aceptaPermuta"
                              checked={!datosOperacion.aceptaPermuta}
                              onChange={() => setDatosOperacion({ aceptaPermuta: false })}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Financia:
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="financia"
                              checked={datosOperacion.financia}
                              onChange={() => setDatosOperacion({ financia: true })}
                            />
                            <span>Sí</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="financia"
                              checked={!datosOperacion.financia}
                              onChange={() => setDatosOperacion({ financia: false })}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* PASO 2 - Datos generales */}
                  {pasoActual === 2 && (
                    <motion.div
                      key="paso2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tipo de propiedad <span className="text-red-500">*</span>
                        </label>
                        <Select value={datosGenerales.tipoPropiedad} onValueChange={(value) => setDatosGenerales({ tipoPropiedad: value })}>
                          <SelectTrigger className="bg-gray-50 border-gray-300">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="casa">Casa</SelectItem>
                            <SelectItem value="departamento">Departamento</SelectItem>
                            <SelectItem value="terreno">Terreno</SelectItem>
                            <SelectItem value="local">Local</SelectItem>
                            <SelectItem value="oficina">Oficina</SelectItem>
                            <SelectItem value="galpon">Galpón</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Zona <span className="text-red-500">*</span>
                        </label>
                        <AutocompleteUbicacion
                          valor={datosGenerales.zona}
                          onChange={(valor, lat, lng) => {
                            setDatosGenerales({ zona: valor })
                            if (lat && lng) {
                              setDatosGenerales({ latitud: lat, longitud: lng })
                            }
                          }}
                          onUbicacionSeleccionada={handleUbicacionSeleccionada}
                          placeholder="Ej: Sopocachi, San Pedro, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Dirección:
                        </label>
                        <Input
                          type="text"
                          value={datosGenerales.direccion}
                          onChange={(e) => setDatosGenerales({ direccion: e.target.value })}
                          placeholder="Calle, número, referencias"
                          className="bg-gray-50 border-gray-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ubicación en el mapa:
                        </label>
                        <MapaSelector
                          latitud={datosGenerales.latitud}
                          longitud={datosGenerales.longitud}
                          onUbicacionChange={(lat, lng) => {
                            setDatosGenerales({ latitud: lat, longitud: lng })
                          }}
                          forzarCentro={mapaCentro}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tipo de marcador:
                        </label>
                        <Select value={datosGenerales.tipoMarcador} onValueChange={(value) => setDatosGenerales({ tipoMarcador: value as 'punto-exacto' | 'aproximado' })}>
                          <SelectTrigger className="bg-gray-50 border-gray-300">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="punto-exacto">Punto exacto</SelectItem>
                            <SelectItem value="aproximado">Aproximado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={datosGenerales.mostrarDireccion}
                            onChange={(e) => setDatosGenerales({ mostrarDireccion: e.target.checked })}
                          />
                          <span className="text-sm font-medium text-gray-700">Mostrar dirección completa al público</span>
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {/* PASO 3 - Detalles de la propiedad */}
                  {pasoActual === 3 && (
                    <motion.div
                      key="paso3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Dormitorios <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            value={detallesPropiedad.dormitorios}
                            onChange={(e) => setDetallesPropiedad({ dormitorios: e.target.value })}
                            placeholder="Ej: 3"
                            className="bg-gray-50 border-gray-300"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Baños <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            value={detallesPropiedad.banos}
                            onChange={(e) => setDetallesPropiedad({ banos: e.target.value })}
                            placeholder="Ej: 2"
                            className="bg-gray-50 border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Garajes:
                          </label>
                          <Input
                            type="text"
                            value={detallesPropiedad.garaje}
                            onChange={(e) => setDetallesPropiedad({ garaje: e.target.value })}
                            placeholder="Ej: 1"
                            className="bg-gray-50 border-gray-300"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Metros edificados <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            value={detallesPropiedad.metrosEdificados}
                            onChange={(e) => setDetallesPropiedad({ metrosEdificados: e.target.value })}
                            placeholder="Ej: 120"
                            className="bg-gray-50 border-gray-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Metros de terreno:
                        </label>
                        <Input
                          type="number"
                          value={detallesPropiedad.metrosTerreno}
                          onChange={(e) => setDetallesPropiedad({ metrosTerreno: e.target.value })}
                          placeholder="Ej: 200"
                          className="bg-gray-50 border-gray-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Estado <span className="text-red-500">*</span>
                        </label>
                        <Select value={detallesPropiedad.estado} onValueChange={(value) => setDetallesPropiedad({ estado: value })}>
                          <SelectTrigger className="bg-gray-50 border-gray-300">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nuevo">Nuevo</SelectItem>
                            <SelectItem value="muy_bueno">Muy bueno</SelectItem>
                            <SelectItem value="bueno">Bueno</SelectItem>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="a_remodelar">A remodelar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Año de construcción:
                          </label>
                          <Input
                            type="number"
                            value={detallesPropiedad.anoConstruccion}
                            onChange={(e) => setDetallesPropiedad({ anoConstruccion: e.target.value })}
                            placeholder="Ej: 2020"
                            className="bg-gray-50 border-gray-300"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Cantidad de pisos:
                          </label>
                          <Input
                            type="number"
                            value={detallesPropiedad.cantidadPisos}
                            onChange={(e) => setDetallesPropiedad({ cantidadPisos: e.target.value })}
                            placeholder="Ej: 2"
                            className="bg-gray-50 border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={detallesPropiedad.aptoOficina}
                            onChange={(e) => setDetallesPropiedad({ aptoOficina: e.target.checked })}
                          />
                          <span className="text-sm">Apto oficina</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={detallesPropiedad.viviendaSocial}
                            onChange={(e) => setDetallesPropiedad({ viviendaSocial: e.target.checked })}
                          />
                          <span className="text-sm">Vivienda social</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={detallesPropiedad.condominio}
                            onChange={(e) => setDetallesPropiedad({ condominio: e.target.checked })}
                          />
                          <span className="text-sm">Condominio</span>
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {/* PASO 4 - Confort y seguridad */}
                  {pasoActual === 4 && (
                    <motion.div
                      key="paso4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="flex items-center gap-2 mb-4">
                          <input
                            type="checkbox"
                            checked={confortSeguridad.noAplica}
                            onChange={(e) => setConfortSeguridad({ noAplica: e.target.checked, confort: [], seguridad: [] })}
                          />
                          <span className="text-sm font-medium text-gray-700">No aplica (propiedad sin confort/seguridad)</span>
                        </label>
                      </div>

                      {!confortSeguridad.noAplica && (
                        <>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Confort</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {['agua_corriente', 'electricidad', 'gas', 'internet', 'cable', 'telefono', 'aire_acondicionado', 'calefaccion', 'jacuzzi', 'sauna', 'chimenea', 'jardin', 'piscina', 'quincho', 'barbacoa', 'lavadero'].map((item) => (
                                <label key={item} className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={confortSeguridad.confort.includes(item)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setConfortSeguridad({ confort: [...confortSeguridad.confort, item] })
                                      } else {
                                        setConfortSeguridad({ confort: confortSeguridad.confort.filter(c => c !== item) })
                                      }
                                    }}
                                  />
                                  <span className="capitalize">{item.replace(/_/g, ' ')}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Seguridad</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {['seguridad_privada', 'camara_seguridad', 'alarma', 'porton_electrico', 'reja', 'portero_24h', 'cercado_perimetral'].map((item) => (
                                <label key={item} className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={confortSeguridad.seguridad.includes(item)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setConfortSeguridad({ seguridad: [...confortSeguridad.seguridad, item] })
                                      } else {
                                        setConfortSeguridad({ seguridad: confortSeguridad.seguridad.filter(s => s !== item) })
                                      }
                                    }}
                                  />
                                  <span className="capitalize">{item.replace(/_/g, ' ')}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* PASO 5 - Imágenes */}
                  {pasoActual === 5 && (
                    <motion.div
                      key="paso5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <UploadImagenes
                        imagenes={imagenesDatos.imagenes}
                        onImagenesChange={(imagenes) => setImagenesDatos({ imagenes })}
                      />
                    </motion.div>
                  )}

                  {/* PASO 6 - Descripción */}
                  {pasoActual === 6 && (
                    <motion.div
                      key="paso6"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <EditorDescripcion
                        value={descripcionDatos.descripcion}
                        onChange={(descripcion) => setDescripcionDatos({ descripcion })}
                      />
                    </motion.div>
                  )}

                  {/* PASO 7 - Resumen */}
                  {pasoActual === 7 && (
                    <motion.div
                      key="paso7"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ResumenPublicacion
                        datosOperacion={datosOperacion}
                        datosGenerales={datosGenerales}
                        detallesPropiedad={detallesPropiedad}
                        confortSeguridad={confortSeguridad}
                        imagenesDatos={imagenesDatos}
                        descripcionDatos={descripcionDatos}
                        onEditarPaso={(paso) => setPasoActual(paso)}
                        onPublicar={handleSubmit}
                        publishing={publishing}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navegación */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    onClick={handlePrevStep}
                    disabled={pasoActual === 1 || publishing}
                    variant="outline"
                  >
                    Anterior
                  </Button>

                  {pasoActual === 7 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={publishing}
                    >
                      {publishing ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextStep}
                      disabled={publishing}
                    >
                      Siguiente
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AdminEditarPropiedadPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<AdminProperty | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

    fetchProperty()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando propiedad...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-muted-foreground">Propiedad no encontrada</p>
      </div>
    )
  }

  return (
    <FormularioProvider>
      <AdminEditarFormulario property={property} />
    </FormularioProvider>
  )
}
