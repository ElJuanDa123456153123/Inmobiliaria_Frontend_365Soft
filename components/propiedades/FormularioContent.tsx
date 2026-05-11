"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamicImport from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useFormularioPublicacion } from "@/lib/contexts/FormularioContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiService } from "@/lib/services/api"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

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

export function FormularioContent() {
  const router = useRouter()
  const [publishing, setPublishing] = useState(false)
  const [mapaCentro, setMapaCentro] = useState<{ lat: number; lng: number } | undefined>()
  const [isAdmin, setIsAdmin] = useState(false)
  const [mostrarDialogoCancelar, setMostrarDialogoCancelar] = useState(false)
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

  // Detectar si es admin
  useEffect(() => {
    const adminFlag = localStorage.getItem('isAdmin')
    setIsAdmin(adminFlag === 'true')
  }, [])

  // Cargar plan seleccionado de localStorage
  useEffect(() => {
    const plan = localStorage.getItem('planSeleccionado')
    if (plan) {
      toast.success(`Plan seleccionado: ${plan}`)
      localStorage.removeItem('planSeleccionado')
    }
  }, [])

  const handleNextStep = () => {
    if (pasoActual < 7) {
      // Validar paso actual antes de avanzar
      if (!validarPasoActual()) {
        toast.error('Completa los campos obligatorios antes de continuar')
        return
      }
      setPasoActual(pasoActual + 1)
      toast.success('Progreso guardado automáticamente')
    }
  }

  const handlePrevStep = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1)
    }
  }

  // Manejar selección de ubicación desde el autocompletado
  const handleUbicacionSeleccionada = (lat: number, lng: number, zona?: string) => {
    // Actualizar el centro del mapa para que se mueva
    setMapaCentro({ lat, lng })

    // Actualizar las coordenadas en el formulario
    setDatosGenerales({
      latitud: lat,
      longitud: lng
    })

    // Si se proporciona una zona, también actualizarla
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
    // Verificar autenticación
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Debes iniciar sesión para publicar una propiedad')
      router.push('/ingresar')
      return
    }

    // Verificar que todas las imágenes se hayan subido correctamente
    const imagenesSinSubir = imagenesDatos.imagenes.filter(img => !img.url || img.error)
    if (imagenesSinSubir.length > 0) {
      toast.error('Hay imágenes que aún no se han subido o tienen errores. Por favor espera a que se suban todas.')
      return
    }

    setPublishing(true)

    try {
      // Las imágenes ya están subidas al backend, solo usar las URLs
      const imagenesSubidas = imagenesDatos.imagenes
        .filter(img => img.url)  // Solo imágenes con URL válida
        .map(img => ({
          url: img.url!,  // URL del backend (ej: /api/imagenes/propiedad-123-1.webp)
          orden: img.orden,
        }))

      // Preparar payload con todos los datos del formulario
      const payload: any = {
        // === PASO 1: Datos de la operación ===
        titulo: datosOperacion.titulo.trim(),
        tipo_operacion: datosOperacion.tipoOperacion,
        precio: parseFloat(datosOperacion.precio) || 0,
        moneda: datosOperacion.moneda,
        acepta_permuta: datosOperacion.aceptaPermuta,
        financia: datosOperacion.financia,

        // Campos específicos por operación
        ...(datosOperacion.tipoOperacion === 'alquiler' && {
          deposito: datosOperacion.deposito,
          plazo_minimo: datosOperacion.plazoMinimo,
          servicios_incluidos: datosOperacion.serviciosIncluidos,
        }),
        ...(datosOperacion.tipoOperacion === 'anticretico' && {
          duracion_contrato: datosOperacion.duracionContrato,
          opcion_compra: datosOperacion.opcionCompra,
        }),

        // === PASO 2: Datos generales ===
        tipo_propiedad: datosGenerales.tipoPropiedad,
        direccion: datosGenerales.direccion.trim(),
        zona: datosGenerales.zona.trim(),
        tipo_marcador: datosGenerales.tipoMarcador,
        latitud: datosGenerales.latitud,
        longitud: datosGenerales.longitud,
        mostrar_direccion: datosGenerales.mostrarDireccion,

        // === PASO 3: Detalles de la propiedad ===
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

        // === PASO 4: Confort y seguridad ===
        confort: confortSeguridad.confort,
        seguridad: confortSeguridad.seguridad,
        no_aplica_confort: confortSeguridad.noAplica,

        // === PASO 5: Imágenes y Video ===
        imagenes: imagenesSubidas,  // Ahora son URLs en lugar de base64
        video_url: imagenesDatos.video.trim(),

        // === PASO 6: Descripción ===
        descripcion: descripcionDatos.descripcion.trim(),
        terminos_condiciones: descripcionDatos.terminosCondiciones.trim(),
      }

      // Enviar al backend
      const response = await apiService.createProperty(payload)

      toast.success('¡Propiedad publicada con éxito!', {
        description: 'Será redirigido a tu perfil...',
        duration: 3000,
      })

      // Limpiar formulario
      resetFormulario()

      // Redirigir después de un momento
      setTimeout(() => {
        router.push(isAdmin ? '/admin/propiedades' : '/perfil')
      }, 2000)
    } catch (error: any) {
      console.error('Error publicando propiedad:', error)
      toast.error(error.message || 'Error al publicar la propiedad')
    } finally {
      setPublishing(false)
    }
  }

  const handleCancelar = () => {
    setMostrarDialogoCancelar(true)
  }

  const confirmarCancelar = () => {
    // Resetear formulario
    resetFormulario()
    // Limpiar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('formulario-publicacion-storage')
    }
    // Mostrar toast
    toast.info('Publicación cancelada', {
      description: 'Los datos han sido descartados',
    })
    // Cerrar diálogo
    setMostrarDialogoCancelar(false)
    // Redirigir al home o según el rol
    if (isAdmin) {
      router.push('/admin/propiedades')
    } else {
      router.push('/')
    }
  }

  const calcularProgreso = () => {
    return Math.round((pasoActual / 7) * 100)
  }

  return (
    <div className={isAdmin ? "min-h-screen bg-gray-100" : "flex flex-col min-h-screen bg-gray-50"}>
      {!isAdmin && <Header />}

      <main className={isAdmin ? "flex-1 py-8" : "flex-1 py-8"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header para admin */}
          {isAdmin && (
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/propiedades')}
                className="mb-4"
              >
                ← Volver al Panel de Admin
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Publicar Propiedad</h1>
              <p className="text-gray-600 mt-2">Completa el formulario para publicar una nueva propiedad</p>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Pasos */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Ingreso de propiedad
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
                    Completa el proceso para publicar
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${calcularProgreso()}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {calcularProgreso()}% del progreso
                  </p>

                  {/* Botón Cancelar */}
                  <Button
                    variant="outline"
                    onClick={handleCancelar}
                    className="w-full mt-4 bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 hover:text-white font-semibold"
                  >
                    Cancelar publicación
                  </Button>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Ingreso de propiedad
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
                          {datosOperacion.tipoOperacion === 'venta' && 'Precio de venta'}
                          {datosOperacion.tipoOperacion === 'alquiler' && 'Precio mensual de alquiler'}
                          {datosOperacion.tipoOperacion === 'anticretico' && 'Monto de anticrético'}
                          {!datosOperacion.tipoOperacion && 'Precio'}
                          <span className="text-red-500">*</span>
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
                            placeholder={datosOperacion.tipoOperacion === 'alquiler' ? 'Ej: 500' : datosOperacion.tipoOperacion === 'anticretico' ? 'Ej: 50000' : 'Ej: 120000'}
                            className="flex-1 bg-gray-50 border-gray-300"
                          />
                        </div>
                        {datosOperacion.tipoOperacion === 'alquiler' && (
                          <p className="text-xs text-gray-500 mt-1">Precio mensual en {datosOperacion.moneda === 'USD' ? 'dólares' : 'bolivianos'}</p>
                        )}
                        {datosOperacion.tipoOperacion === 'anticretico' && (
                          <p className="text-xs text-gray-500 mt-1">Monto del anticrético en {datosOperacion.moneda === 'USD' ? 'dólares' : 'bolivianos'}</p>
                        )}
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

                      {/* Campos específicos para ALQUILER */}
                      {datosOperacion.tipoOperacion === 'alquiler' && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Depósito / Garantía:
                            </label>
                            <Select
                              value={datosOperacion.deposito || ''}
                              onValueChange={(value) => {
                                if (value !== 'personalizado') {
                                  setDatosOperacion({ deposito: value })
                                } else {
                                  setDatosOperacion({ deposito: '' })
                                }
                              }}
                            >
                              <SelectTrigger className="bg-gray-50 border-gray-300">
                                <SelectValue placeholder="Selecciona" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1 mes">1 mes</SelectItem>
                                <SelectItem value="2 meses">2 meses</SelectItem>
                                <SelectItem value="3 meses">3 meses</SelectItem>
                                <SelectItem value="6 meses">6 meses</SelectItem>
                                <SelectItem value="personalizado">Personalizado...</SelectItem>
                              </SelectContent>
                            </Select>
                            {(!datosOperacion.deposito || datosOperacion.deposito === 'personalizado') && (
                              <Input
                                type="text"
                                value={datosOperacion.deposito === 'personalizado' ? '' : datosOperacion.deposito || ''}
                                onChange={(e) => setDatosOperacion({ deposito: e.target.value })}
                                placeholder="Escribe el depósito personalizado"
                                className="bg-gray-50 border-gray-300 mt-2"
                              />
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Plazo mínimo de contrato:
                            </label>
                            <Select
                              value={datosOperacion.plazoMinimo || ''}
                              onValueChange={(value) => {
                                if (value !== 'personalizado') {
                                  setDatosOperacion({ plazoMinimo: value })
                                } else {
                                  setDatosOperacion({ plazoMinimo: '' })
                                }
                              }}
                            >
                              <SelectTrigger className="bg-gray-50 border-gray-300">
                                <SelectValue placeholder="Selecciona" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3 meses">3 meses</SelectItem>
                                <SelectItem value="6 meses">6 meses</SelectItem>
                                <SelectItem value="1 año">1 año</SelectItem>
                                <SelectItem value="2 años">2 años</SelectItem>
                                <SelectItem value="3 años">3 años</SelectItem>
                                <SelectItem value="personalizado">Personalizado...</SelectItem>
                              </SelectContent>
                            </Select>
                            {(!datosOperacion.plazoMinimo || datosOperacion.plazoMinimo === 'personalizado') && (
                              <Input
                                type="text"
                                value={datosOperacion.plazoMinimo === 'personalizado' ? '' : datosOperacion.plazoMinimo || ''}
                                onChange={(e) => setDatosOperacion({ plazoMinimo: e.target.value })}
                                placeholder="Escribe el plazo personalizado"
                                className="bg-gray-50 border-gray-300 mt-2"
                              />
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Servicios incluidos:
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {[
                                { value: 'luz', label: 'Luz' },
                                { value: 'agua', label: 'Agua' },
                                { value: 'gas', label: 'Gas' },
                                { value: 'internet', label: 'Internet' },
                                { value: 'cable', label: 'Cable TV' },
                                { value: 'mantenimiento', label: 'Mantenimiento' },
                              ].map((servicio) => (
                                <label key={servicio.value} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={datosOperacion.serviciosIncluidos?.includes(servicio.value) || false}
                                    onChange={(e) => {
                                      const current = datosOperacion.serviciosIncluidos || []
                                      if (e.target.checked) {
                                        setDatosOperacion({ serviciosIncluidos: [...current, servicio.value] })
                                      } else {
                                        setDatosOperacion({ serviciosIncluidos: current.filter(s => s !== servicio.value) })
                                      }
                                    }}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                  />
                                  <span className="text-sm">{servicio.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Campos específicos para ANTICRÉTICO */}
                      {datosOperacion.tipoOperacion === 'anticretico' && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Duración del contrato:
                            </label>
                            <Select value={datosOperacion.duracionContrato || ''} onValueChange={(value) => setDatosOperacion({ duracionContrato: value })}>
                              <SelectTrigger className="bg-gray-50 border-gray-300">
                                <SelectValue placeholder="Selecciona" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1 año">1 año</SelectItem>
                                <SelectItem value="2 años">2 años</SelectItem>
                                <SelectItem value="3 años">3 años</SelectItem>
                                <SelectItem value="5 años">5 años</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={datosOperacion.opcionCompra || false}
                                onChange={(e) => setDatosOperacion({ opcionCompra: e.target.checked })}
                                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                              />
                              <span className="text-sm font-semibold text-gray-700">
                                Opción de compra
                              </span>
                            </label>
                            <p className="text-xs text-gray-500 ml-7 mt-1">
                              El inquilino tiene opción a comprar la propiedad al finalizar el contrato
                            </p>
                          </div>
                        </>
                      )}

                      <div className="flex justify-end pt-4">
                        <Button onClick={handleNextStep} className="bg-primary hover:bg-primary/90">
                          Siguiente {">"}
                        </Button>
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
                            <SelectValue placeholder="Casas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="casa">Casas</SelectItem>
                            <SelectItem value="departamento">Departamentos</SelectItem>
                            <SelectItem value="terreno">Terrenos</SelectItem>
                            <SelectItem value="oficina">Oficinas</SelectItem>
                            <SelectItem value="local">Local Comercial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="border-t pt-6 space-y-4">
                        <h4 className="text-sm font-semibold text-gray-700">— Ubicación —</h4>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Zona <span className="text-red-500">*</span>
                          </label>
                          <AutocompleteUbicacion
                            valor={datosGenerales.zona}
                            onChange={(zona, lat, lng) => {
                              setDatosGenerales({ zona: zona })
                              if (lat && lng) {
                                handleUbicacionSeleccionada(lat, lng)
                              }
                            }}
                            onUbicacionSeleccionada={(lat, lng) => handleUbicacionSeleccionada(lat, lng)}
                            placeholder="Escribe la ubicación"
                          />
                        </div>

                        <div>
                          <label className="flex items-center gap-2 mb-2">
                            <input
                              type="checkbox"
                              checked={datosGenerales.mostrarDireccion}
                              onChange={(e) => setDatosGenerales({ mostrarDireccion: e.target.checked })}
                            />
                            <span className="text-sm font-semibold text-gray-700">
                              No mostrar la dirección pública
                            </span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-4">
                            Selecciona la ubicación en el mapa:
                          </label>
                          <MapaSelector
                            latitud={datosGenerales.latitud}
                            longitud={datosGenerales.longitud}
                            onUbicacionChange={(lat, lng) => setDatosGenerales({ latitud: lat, longitud: lng })}
                            forzarCentro={mapaCentro}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button onClick={handlePrevStep} variant="outline">
                          Anterior
                        </Button>
                        <Button onClick={handleNextStep} className="bg-primary hover:bg-primary/90">
                          Siguiente {">"}
                        </Button>
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
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Dormitorios <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3 flex-wrap">
                          {["1 Ambiente", "1", "2", "3", "4", "5+"].map((opcion) => {
                            const isSelected = detallesPropiedad.dormitorios === opcion
                            return (
                              <label
                                key={opcion}
                                className={`
                                  flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all
                                  ${isSelected
                                    ? 'bg-primary text-white border-primary shadow-md'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:bg-primary/5'
                                  }
                                `}
                              >
                                <input
                                  type="radio"
                                  name="dormitorios"
                                  value={opcion}
                                  checked={isSelected}
                                  onChange={(e) => setDetallesPropiedad({ dormitorios: e.target.value })}
                                  className="sr-only"
                                />
                                <span className="font-medium">{opcion}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Baños <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3 flex-wrap">
                          {["1", "2", "3+"].map((opcion) => {
                            const isSelected = detallesPropiedad.banos === opcion
                            return (
                              <label
                                key={opcion}
                                className={`
                                  flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all
                                  ${isSelected
                                    ? 'bg-primary text-white border-primary shadow-md'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:bg-primary/5'
                                  }
                                `}
                              >
                                <input
                                  type="radio"
                                  name="banos"
                                  value={opcion}
                                  checked={isSelected}
                                  onChange={(e) => setDetallesPropiedad({ banos: e.target.value })}
                                  className="sr-only"
                                />
                                <span className="font-medium">{opcion}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Metros edificados <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          value={detallesPropiedad.metrosEdificados}
                          onChange={(e) => setDetallesPropiedad({ metrosEdificados: e.target.value })}
                          className="bg-gray-50 border-gray-300"
                          placeholder="Ej: 120"
                        />
                        <p className="text-xs text-gray-500 mt-1">Superficie cubierta en m²</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Metros del terreno
                        </label>
                        <Input
                          type="number"
                          value={detallesPropiedad.metrosTerreno}
                          onChange={(e) => setDetallesPropiedad({ metrosTerreno: e.target.value })}
                          className="bg-gray-50 border-gray-300"
                          placeholder="Ej: 200"
                        />
                        <p className="text-xs text-gray-500 mt-1">Superficie total del terreno en m² (opcional)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Garaje
                        </label>
                        <div className="flex gap-3 flex-wrap">
                          {["0", "1", "2", "3+"].map((opcion) => {
                            const isSelected = detallesPropiedad.garaje === opcion
                            return (
                              <label
                                key={opcion}
                                className={`
                                  flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all
                                  ${isSelected
                                    ? 'bg-primary text-white border-primary shadow-md'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:bg-primary/5'
                                  }
                                `}
                              >
                                <input
                                  type="radio"
                                  name="garaje"
                                  value={opcion}
                                  checked={isSelected}
                                  onChange={(e) => setDetallesPropiedad({ garaje: e.target.value })}
                                  className="sr-only"
                                />
                                <span className="font-medium">{opcion === "0" ? "Sin garaje" : opcion}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Estado <span className="text-red-500">*</span>
                          </label>
                          <Select value={detallesPropiedad.estado} onValueChange={(value) => setDetallesPropiedad({ estado: value })}>
                            <SelectTrigger className="bg-gray-50 border-gray-300">
                              <SelectValue placeholder="Sin Definir" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sin-definir">Sin Definir</SelectItem>
                              <SelectItem value="excelente">Excelente</SelectItem>
                              <SelectItem value="muy-bueno">Muy Bueno</SelectItem>
                              <SelectItem value="bueno">Bueno</SelectItem>
                              <SelectItem value="regular">Regular</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Año de construcción
                          </label>
                          <Input
                            type="number"
                            value={detallesPropiedad.anoConstruccion}
                            onChange={(e) => setDetallesPropiedad({ anoConstruccion: e.target.value })}
                            className="bg-gray-50 border-gray-300"
                            placeholder="Ej: 2020"
                            min="1900"
                            max={new Date().getFullYear()}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Cantidad de pisos
                          </label>
                          <Input
                            type="number"
                            value={detallesPropiedad.cantidadPisos}
                            onChange={(e) => setDetallesPropiedad({ cantidadPisos: e.target.value })}
                            className="bg-gray-50 border-gray-300"
                            placeholder="Ej: 1"
                            min="1"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-700">Características adicionales</h4>

                        <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={detallesPropiedad.aptoOficina}
                              onChange={(e) => setDetallesPropiedad({ aptoOficina: e.target.checked })}
                              className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-700">Apto para oficina</span>
                              <p className="text-xs text-gray-500">Apto para funcionamiento profesional</p>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={detallesPropiedad.viviendaSocial}
                              onChange={(e) => setDetallesPropiedad({ viviendaSocial: e.target.checked })}
                              className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-700">Vivienda social</span>
                              <p className="text-xs text-gray-500">Plan de vivienda social o programa gubernamental</p>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={detallesPropiedad.condominio}
                              onChange={(e) => setDetallesPropiedad({ condominio: e.target.checked })}
                              className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-700">En condominio</span>
                              <p className="text-xs text-gray-500">La propiedad está dentro de un condominio privado</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button onClick={handlePrevStep} variant="outline">
                          Anterior
                        </Button>
                        <Button onClick={handleNextStep} className="bg-primary hover:bg-primary/90">
                          Siguiente {">"}
                        </Button>
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
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={confortSeguridad.noAplica}
                          onChange={(e) => setConfortSeguridad({ noAplica: e.target.checked })}
                        />
                        <span className="text-sm font-semibold text-gray-700">No aplica</span>
                      </label>

                      {!confortSeguridad.noAplica && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Confort:
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {[
                                { value: 'aire-acondicionado', label: 'Aire Acondicionado' },
                                { value: 'calefaccion', label: 'Calefacción' },
                                { value: 'piscina', label: 'Piscina' },
                                { value: 'jardin', label: 'Jardín' },
                                { value: 'terraza', label: 'Terraza' },
                                { value: 'balcon', label: 'Balcón' },
                                { value: 'gimnasio', label: 'Gimnasio' },
                                { value: 'sauna', label: 'Sauna' },
                                { value: 'jacuzzi', label: 'Jacuzzi' },
                              ].map((opcion) => (
                                <label key={opcion.value} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={confortSeguridad.confort.includes(opcion.value)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setConfortSeguridad({
                                          confort: [...confortSeguridad.confort, opcion.value]
                                        })
                                      } else {
                                        setConfortSeguridad({
                                          confort: confortSeguridad.confort.filter(c => c !== opcion.value)
                                        })
                                      }
                                    }}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                  />
                                  <span className="text-sm">{opcion.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Seguridad:
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {[
                                { value: 'seguridad-24h', label: 'Seguridad 24hs' },
                                { value: 'porton-electrico', label: 'Portón Eléctrico' },
                                { value: 'camaras', label: 'Cámaras' },
                                { value: 'alarma', label: 'Alarma' },
                                { value: 'guardia', label: 'Guardia' },
                                { value: 'cercado', label: 'Cercado' },
                              ].map((opcion) => (
                                <label key={opcion.value} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={confortSeguridad.seguridad.includes(opcion.value)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setConfortSeguridad({
                                          seguridad: [...confortSeguridad.seguridad, opcion.value]
                                        })
                                      } else {
                                        setConfortSeguridad({
                                          seguridad: confortSeguridad.seguridad.filter(s => s !== opcion.value)
                                        })
                                      }
                                    }}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                  />
                                  <span className="text-sm">{opcion.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between pt-4">
                        <Button onClick={handlePrevStep} variant="outline">
                          Anterior
                        </Button>
                        <Button onClick={handleNextStep} className="bg-primary hover:bg-primary/90">
                          Siguiente {">"}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* PASO 5 - Gestor de imágenes */}
                  {pasoActual === 5 && (
                    <motion.div
                      key="paso5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">
                          5. Gestor de imágenes <span className="text-red-500">*</span>
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Selecciona varios archivos a la vez (solo formato JPG). Puedes subir hasta 30 imágenes.
                          Para ordenar, haz click y arrastra la imagen donde desees.
                        </p>
                      </div>

                      <UploadImagenes
                        imagenes={imagenesDatos.imagenes}
                        onImagenesChange={(imgs) => setImagenesDatos({ imagenes: imgs })}
                        maxImagenes={30}
                      />

                      <div className="border-t pt-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Video (Link Youtube):
                        </h4>
                        <Input
                          type="text"
                          value={imagenesDatos.video}
                          onChange={(e) => setImagenesDatos({ video: e.target.value })}
                          placeholder="https://youtube.com/watch?v=..."
                          className="bg-gray-50 border-gray-300"
                        />
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button onClick={handlePrevStep} variant="outline">
                          Anterior
                        </Button>
                        <Button onClick={handleNextStep} className="bg-primary hover:bg-primary/90">
                          Siguiente {">"}
                        </Button>
                      </div>
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
                      className="space-y-6"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">
                          6. Descripción de la propiedad
                        </h4>

                        <EditorDescripcion
                          value={descripcionDatos.descripcion}
                          onChange={(value) => setDescripcionDatos({ descripcion: value })}
                          placeholder="Describe tu propiedad aquí..."
                        />
                      </div>

                      <div className="border-t pt-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">
                          — Términos y condiciones —
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          De ser necesario, ingresa términos y condiciones adicionales.
                        </p>
                        <p className="text-xs text-gray-500 mb-2">Quedan 250 caracteres</p>
                        <textarea
                          value={descripcionDatos.terminosCondiciones}
                          onChange={(e) => setDescripcionDatos({ terminosCondiciones: e.target.value })}
                          rows={3}
                          maxLength={250}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Ejemplo: Depósito fijo del 10%."
                        />
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button onClick={handlePrevStep} variant="outline">
                          Anterior
                        </Button>
                        <Button onClick={handleNextStep} className="bg-primary hover:bg-primary/90">
                          Ver Resumen {">"}
                        </Button>
                      </div>
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
                        onEditarPaso={setPasoActual}
                        onPublicar={handleSubmit}
                        publishing={publishing}
                      />

                      <div className="flex justify-between pt-4">
                        <Button onClick={handlePrevStep} variant="outline">
                          Anterior
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>

      {!isAdmin && <Footer />}

      {/* Diálogo de confirmación para cancelar */}
      <AlertDialog open={mostrarDialogoCancelar} onOpenChange={setMostrarDialogoCancelar}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <AlertDialogTitle>¿Cancelar publicación?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base mt-4">
              Esta acción descartará todos los datos ingresados y no podrás recuperar la publicación.
              <br /><br />
              <strong>¿Estás seguro de que deseas cancelar?</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="mt-0">
              No, volver al formulario
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarCancelar}
              className="bg-red-600 hover:bg-red-700 mt-0"
            >
              Sí, cancelar publicación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
