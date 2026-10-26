"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamicImport from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useFormularioPublicacion } from "@/lib/contexts/FormularioContext"
import { getUserIdFromToken } from "@/lib/user-prefs"
import { getImageUrl } from "@/lib/utils"
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
import { AlertTriangle, Pencil, DollarSign, KeyRound, Handshake, Check } from "lucide-react"

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
  const [cargandoEdicion, setCargandoEdicion] = useState(false)
  const {
    pasoActual,
    datosOperacion,
    datosGenerales,
    detallesPropiedad,
    confortSeguridad,
    imagenesDatos,
    descripcionDatos,
    isInitialized,
    editPropertyId,
    setPasoActual,
    setDatosOperacion,
    setDatosGenerales,
    setDetallesPropiedad,
    setConfortSeguridad,
    setImagenesDatos,
    setDescripcionDatos,
    setEditPropertyId,
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

  // ══════════ MODO EDICIÓN (?edit=<id>) ══════════
  // Se activa desde el panel de propiedades. Espera a que el provider
  // hidrate localStorage para limpiar cualquier borrador anterior y
  // precargar los datos reales de la propiedad.
  useEffect(() => {
    if (!isInitialized) return
    const editParam = new URLSearchParams(window.location.search).get('edit')
    if (!editParam) return

    const id = parseInt(editParam)
    if (isNaN(id)) return

    // Ya está cargada esta propiedad en contexto (refresh de página)
    if (editPropertyId === id) return

    iniciarEdicion(id)
  }, [isInitialized])

  const iniciarEdicion = async (id: number) => {
    // Verificar que el usuario logueado sea el dueño
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Debes iniciar sesión para editar una propiedad')
      router.push('/ingresar')
      return
    }
    const userId = getUserIdFromToken()
    try {
      setCargandoEdicion(true)

      const propiedad = await apiService.getProperty(id)
      if (userId && Number(userId) !== propiedad.user_id) {
        toast.error('No tienes permiso para editar esta propiedad')
        router.push('/panel/propiedades')
        return
      }

      // Limpiar cualquier borrador previo y marcar modo edición
      resetFormulario()
      setEditPropertyId(id)

      // ══════════ PASO 1: Datos de operación ══════════
      setDatosOperacion({
        titulo: propiedad.titulo,
        tipoOperacion: (propiedad.tipo_operacion as 'venta' | 'alquiler' | 'anticretico') || 'venta',
        precio: String(propiedad.precio ?? ''),
        moneda: (propiedad.moneda as 'USD' | 'BOB') || 'BOB',
        aceptaPermuta: Boolean(propiedad.acepta_permuta),
        financia: Boolean(propiedad.financia),
        deposito: propiedad.deposito || '',
        plazoMinimo: propiedad.plazo_minimo || '',
        serviciosIncluidos: propiedad.servicios_incluidos || [],
        alquilaPorHabitaciones: Boolean(propiedad.alquila_por_habitaciones),
        habitaciones: (propiedad.habitaciones || []).map((h) => ({
          nombre: h.nombre,
          descripcion: h.descripcion || '',
          precio: h.precio != null ? String(h.precio) : '',
          activa: h.activa,
        })),
        duracionContrato: propiedad.duracion_contrato || '',
        opcionCompra: Boolean(propiedad.opcion_compra),
      })

      // ══════════ PASO 2: Datos generales ══════════
      setDatosGenerales({
        tipoPropiedad: propiedad.tipo_propiedad || '',
        direccion: propiedad.direccion || '',
        zona: propiedad.zona || '',
        tipoMarcador: (propiedad.tipo_marcador as 'punto-exacto' | 'aproximado') || 'punto-exacto',
        latitud: propiedad.latitud,
        longitud: propiedad.longitud,
        mostrarDireccion: Boolean(propiedad.mostrar_direccion),
      })
      if (propiedad.latitud && propiedad.longitud) {
        setMapaCentro({ lat: propiedad.latitud, lng: propiedad.longitud })
      }

      // ══════════ PASO 3: Detalles ══════════
      setDetallesPropiedad({
        dormitorios: String(propiedad.dormitorios ?? ''),
        banos: String(propiedad.banos ?? ''),
        garaje: String(propiedad.garaje ?? '0'),
        metrosEdificados: String(propiedad.metros_edificados ?? ''),
        metrosTerreno: String(propiedad.metros_terreno ?? ''),
        estado: propiedad.estado || '',
        anoConstruccion: propiedad.ano_construccion ? String(propiedad.ano_construccion) : '',
        aptoOficina: Boolean(propiedad.apto_oficina),
        viviendaSocial: Boolean(propiedad.vivienda_social),
        condominio: Boolean(propiedad.condominio),
        cantidadPisos: String(propiedad.cantidad_pisos || 1),
      })

      // ══════════ PASO 4: Confort y seguridad ══════════
      setConfortSeguridad({
        confort: propiedad.confort || [],
        seguridad: propiedad.seguridad || [],
        noAplica: Boolean(propiedad.no_aplica_confort),
      })

      // ══════════ PASO 5: Imágenes y video ══════════
      setImagenesDatos({
        imagenes: (propiedad.imagenes || []).map((img) => ({
          id: `img-${img.id}`,
          preview: getImageUrl(img.image_url) || img.image_url,
          url: img.image_url,
          orden: img.orden,
        })),
        archivos: [],
        video: propiedad.video_url || '',
      })

      // ══════════ PASO 6: Descripción ══════════
      setDescripcionDatos({
        descripcion: propiedad.descripcion || '',
        terminosCondiciones: propiedad.terminos_condiciones || '',
      })

      setPasoActual(1)
      toast.info('Modo edición', {
        description: 'Los cambios reemplazarán el aviso actual',
      })
    } catch (error: any) {
      console.error('Error cargando propiedad para editar:', error)
      toast.error(error.message || 'No se pudo cargar la propiedad')
      router.push('/panel/propiedades')
    } finally {
      setCargandoEdicion(false)
    }
  }

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

  // Click en el mapa → guardar coordenadas + autocompletar la zona con
  // geocodificación inversa (Nominatim / OpenStreetMap)
  const handleMapaClick = async (lat: number, lng: number) => {
    setDatosGenerales({ latitud: lat, longitud: lng })

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`,
        { headers: { 'Accept-Language': 'es' } }
      )
      if (!res.ok) return

      const data = await res.json()
      const address = data?.address || {}
      const calle = address.road || address.pedestrian || address.residential || ''
      const numero = address.house_number || ''
      const calleCompleta = numero ? `${calle} ${numero}` : calle
      const barrio = address.suburb || address.district || address.neighbourhood || ''
      const localidad = address.city || address.town || address.village || address.municipality || ''
      const departamento = address.state || ''

      // Zona formateada sin duplicados: "Calle, Barrio, Ciudad, Departamento"
      const partes = [calleCompleta, barrio, localidad, departamento]
        .filter(Boolean)
        .filter((v, i, arr) => arr.indexOf(v) === i)

      if (partes.length > 0) {
        setDatosGenerales({ zona: partes.join(', ') })
      }
    } catch (error) {
      console.error('Error en geocodificación inversa:', error)
      // Si falla, el usuario puede escribir la zona manualmente
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
      // En modo "por habitaciones", el precio general = mínimo de las habitaciones
      const preciosHabitaciones = (datosOperacion.habitaciones || [])
        .map((h) => parseFloat(h.precio || ''))
        .filter((p) => !isNaN(p) && p > 0)
      const esPorHabitaciones = datosOperacion.tipoOperacion === 'alquiler' && datosOperacion.alquilaPorHabitaciones

      const payload: any = {
        // === PASO 1: Datos de la operación ===
        titulo: datosOperacion.titulo.trim(),
        tipo_operacion: datosOperacion.tipoOperacion,
        precio: esPorHabitaciones && preciosHabitaciones.length > 0
          ? Math.min(...preciosHabitaciones)
          : (parseFloat(datosOperacion.precio) || 0),
        moneda: datosOperacion.moneda,
        acepta_permuta: datosOperacion.aceptaPermuta,
        financia: datosOperacion.financia,

        // Campos específicos por operación
        ...(datosOperacion.tipoOperacion === 'alquiler' && {
          deposito: datosOperacion.deposito,
          plazo_minimo: datosOperacion.plazoMinimo,
          servicios_incluidos: datosOperacion.serviciosIncluidos,
          alquila_por_habitaciones: Boolean(datosOperacion.alquilaPorHabitaciones),
          habitaciones: (datosOperacion.habitaciones || [])
            .filter((h) => (h.nombre || '').trim())
            .map((h) => ({
              nombre: h.nombre.trim(),
              descripcion: h.descripcion?.trim(),
              precio: h.precio && parseFloat(h.precio) > 0 ? parseFloat(h.precio) : null,
              activa: h.activa !== false,
            })),
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

      // Enviar al backend: PUT en modo edición, POST al crear
      const modoEdicion = Boolean(editPropertyId)
      if (modoEdicion) {
        await apiService.updateProperty(editPropertyId!, payload)
      } else {
        await apiService.createProperty(payload)
      }

      toast.success(modoEdicion ? '¡Propiedad actualizada con éxito!' : '¡Propiedad publicada con éxito!', {
        description: 'Serás redirigido a tu panel...',
        duration: 3000,
      })

      // Limpiar formulario
      resetFormulario()

      // Redirigir después de un momento
      setTimeout(() => {
        if (modoEdicion || !isAdmin) {
          router.push('/panel/propiedades')
        } else {
          router.push('/admin/propiedades')
        }
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
    toast.info(editPropertyId ? 'Cambios descartados' : 'Borrador descartado', {
      description: editPropertyId
        ? 'Tu aviso sigue publicado tal como estaba'
        : 'Los datos han sido descartados',
    })
    // Cerrar diálogo
    setMostrarDialogoCancelar(false)
    // Redirigir: en edición al panel, según el rol en creación
    if (isAdmin) {
      router.push('/admin/propiedades')
    } else {
      router.push('/panel/propiedades')
    }
  }

  const calcularProgreso = () => {
    return Math.round((pasoActual / 7) * 100)
  }

  return (
    <div className={isAdmin ? "min-h-screen bg-gray-100" : "flex flex-col min-h-screen bg-gray-50"}>
      {!isAdmin && <Header />}

      {/* Pantalla de carga al precargar una propiedad en modo edición */}
      {cargandoEdicion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos de la propiedad...</p>
          </div>
        </div>
      )}

      <main className={isAdmin ? "flex-1 py-8" : "flex-1 py-8"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Banner modo edición */}
          {editPropertyId && !cargandoEdicion && (
            <div className="mb-6 rounded-lg border-l-4 border-primary bg-primary/10 px-5 py-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Pencil className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Estás editando tu aviso
                  </p>
                  <p className="text-sm text-gray-600">
                    Guarda los cambios al final para que se reflejen en tu publicación
                  </p>
                </div>
              </div>
              <Link href="/panel/propiedades">
                <Button size="sm" className="shadow">
                  ← Volver al panel
                </Button>
              </Link>
            </div>
          )}

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
              <h1 className="text-3xl font-bold text-gray-900">
                {editPropertyId ? "Editar Propiedad" : "Publicar Propiedad"}
              </h1>
              <p className="text-gray-600 mt-2">
                {editPropertyId
                  ? "Modifica los datos que quieras actualizar"
                  : "Completa el formulario para publicar una nueva propiedad"}
              </p>
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
                    {editPropertyId ? "Revisa y guarda tus cambios" : "Completa el proceso para publicar"}
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

                  {/* Botón descartar: en edición descarta cambios, en creación descarta borrador.
                      Nunca elimina la propiedad publicada. */}
                  <Button
                    variant="outline"
                    onClick={handleCancelar}
                    className="w-full mt-4 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 font-medium"
                  >
                    {editPropertyId ? "Descartar cambios" : "Descartar borrador"}
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
                          Título del aviso <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          value={datosOperacion.titulo}
                          onChange={(e) => setDatosOperacion({ titulo: e.target.value })}
                          placeholder="Ej: Amplia casa con jardín en Condominio Los Olivos"
                          maxLength={80}
                          className="bg-gray-50 border-gray-300"
                        />
                        <p className="text-xs text-gray-500 mt-1">Quedan {80 - datosOperacion.titulo.length} caracteres</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          ¿Qué quieres hacer? <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'venta', label: 'Vender', desc: 'Venta de propiedad', icon: DollarSign },
                            { value: 'alquiler', label: 'Alquilar', desc: 'Renta mensual', icon: KeyRound },
                            { value: 'anticretico', label: 'Anticrético', desc: 'Capital a cambio de uso', icon: Handshake },
                          ].map((op) => {
                            const Icon = op.icon
                            const isSelected = datosOperacion.tipoOperacion === op.value
                            return (
                              <button
                                key={op.value}
                                type="button"
                                onClick={() => setDatosOperacion({ tipoOperacion: op.value as any })}
                                className={`
                                  flex flex-col items-center gap-1 px-3 py-4 rounded-xl border-2 text-center transition-all
                                  ${isSelected
                                    ? 'bg-primary/5 border-primary shadow-md'
                                    : 'bg-gray-50 border-gray-200 hover:border-primary/50'
                                  }
                                `}
                              >
                                <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-gray-400'}`} />
                                <span className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                                  {op.label}
                                </span>
                                <span className="text-[11px] text-gray-500 leading-tight">{op.desc}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* ¿Cómo se alquila? — solo alquiler, va ANTES del precio */}
                      {datosOperacion.tipoOperacion === 'alquiler' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ¿Cómo se alquila? <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => setDatosOperacion({ alquilaPorHabitaciones: false })}
                              className={`
                                relative p-4 rounded-xl border-2 text-left transition-all group hover:shadow-md
                                ${!datosOperacion.alquilaPorHabitaciones
                                  ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5'
                                  : 'border-gray-200 bg-white hover:border-primary/50'
                                }
                              `}
                            >
                              {!datosOperacion.alquilaPorHabitaciones && (
                                <div className="absolute top-3 right-3 bg-primary rounded-full p-1">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                              <p className="font-semibold text-gray-900">🏠 Propiedad completa</p>
                              <p className="text-xs text-gray-500 mt-1">Un solo inquilino alquila todo. Una renta mensual para toda la propiedad.</p>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!datosOperacion.habitaciones || datosOperacion.habitaciones.length === 0) {
                                  setDatosOperacion({
                                    alquilaPorHabitaciones: true,
                                    habitaciones: [{ nombre: 'Habitación 1', descripcion: '', precio: '', activa: true }],
                                  })
                                } else {
                                  setDatosOperacion({ alquilaPorHabitaciones: true })
                                }
                              }}
                              className={`
                                relative p-4 rounded-xl border-2 text-left transition-all group hover:shadow-md
                                ${datosOperacion.alquilaPorHabitaciones
                                  ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5'
                                  : 'border-gray-200 bg-white hover:border-primary/50'
                                }
                              `}
                            >
                              {datosOperacion.alquilaPorHabitaciones && (
                                <div className="absolute top-3 right-3 bg-primary rounded-full p-1">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                              <p className="font-semibold text-gray-900">🛏️ Por habitaciones</p>
                              <p className="text-xs text-gray-500 mt-1">Varios inquilinos, cada uno alquila su habitación (ej: condominios). Precio por habitación.</p>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Precio: en modo habitaciones es referencia (mínimo de las habitaciones) */}
                      {!(datosOperacion.tipoOperacion === 'alquiler' && datosOperacion.alquilaPorHabitaciones) ? (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {datosOperacion.tipoOperacion === 'venta' && 'Precio de venta'}
                            {datosOperacion.tipoOperacion === 'alquiler' && 'Alquiler mensual'}
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
                      ) : (
                        <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-3 text-sm text-gray-600">
                          💡 El precio de referencia del aviso será el <strong>mínimo entre tus habitaciones</strong>
                          {(() => {
                            const precios = (datosOperacion.habitaciones || []).map((h) => parseFloat(h.precio || '')).filter((p) => !isNaN(p) && p > 0)
                            if (precios.length === 0) {
                              return <span>. Define el precio de cada habitación en la lista de abajo 👇</span>
                            }
                            const moneda = datosOperacion.moneda === 'USD' ? 'US$' : 'Bs'
                            return <span>: <strong>{moneda} {Math.min(...precios).toLocaleString()}/mes</strong></span>
                          })()}
                        </div>
                      )}

                      {/* Habitaciones: solo en modo "por habitaciones" */}
                      {datosOperacion.tipoOperacion === 'alquiler' && datosOperacion.alquilaPorHabitaciones && (
                        <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
                          <p className="text-sm font-semibold text-gray-800 mb-3">
                            🛏️ Habitaciones a alquilar
                            <span className="ml-2 text-xs font-normal text-gray-500">(mínimo 1 — cada inquilino elige la suya)</span>
                          </p>
                          <div className="space-y-3">
                            {(datosOperacion.habitaciones || []).map((hab, idx) => (
                              <div key={idx} className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-gray-400 shrink-0">#{idx + 1}</span>
                                  <Input
                                    type="text"
                                    value={hab.nombre}
                                    onChange={(e) => {
                                      const habs = [...(datosOperacion.habitaciones || [])]
                                      habs[idx] = { ...habs[idx], nombre: e.target.value }
                                      setDatosOperacion({ habitaciones: habs })
                                    }}
                                    placeholder={`Nombre (ej: Habitación ${idx + 1} — baño privado)`}
                                    className="bg-gray-50 border-gray-300 flex-1"
                                  />
                                  {(datosOperacion.habitaciones || []).length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDatosOperacion({
                                          habitaciones: (datosOperacion.habitaciones || []).filter((_, i) => i !== idx),
                                        })
                                      }}
                                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded"
                                      title="Quitar habitación"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    type="text"
                                    value={hab.precio ?? ''}
                                    onChange={(e) => {
                                      const habs = [...(datosOperacion.habitaciones || [])]
                                      habs[idx] = { ...habs[idx], precio: e.target.value }
                                      setDatosOperacion({ habitaciones: habs })
                                    }}
                                    placeholder={`Precio mensual (${datosOperacion.moneda === 'USD' ? 'US$' : 'Bs'})`}
                                    className="bg-gray-50 border-gray-300 w-1/2"
                                  />
                                  <Input
                                    type="text"
                                    value={hab.descripcion ?? ''}
                                    onChange={(e) => {
                                      const habs = [...(datosOperacion.habitaciones || [])]
                                      habs[idx] = { ...habs[idx], descripcion: e.target.value }
                                      setDatosOperacion({ habitaciones: habs })
                                    }}
                                    placeholder="Detalles (amoblado, closet...)"
                                    className="bg-gray-50 border-gray-300 flex-1"
                                  />
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const habs = datosOperacion.habitaciones || []
                                if (habs.length >= 30) return
                                setDatosOperacion({
                                  habitaciones: [...habs, { nombre: `Habitación ${habs.length + 1}`, descripcion: '', precio: '', activa: true }],
                                })
                              }}
                              className="text-sm text-primary hover:underline font-medium"
                            >
                              + Agregar habitación
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Condiciones de venta: solo aplican para VENTA */}
                      {datosOperacion.tipoOperacion === 'venta' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Acepta permuta
                            </label>
                            <div className="flex gap-2">
                              {[
                                { value: true, label: 'Sí' },
                                { value: false, label: 'No' },
                              ].map((op) => (
                                <button
                                  key={String(op.value)}
                                  type="button"
                                  onClick={() => setDatosOperacion({ aceptaPermuta: op.value })}
                                  className={`
                                    px-5 py-2 rounded-lg border-2 text-sm font-medium transition-all
                                    ${datosOperacion.aceptaPermuta === op.value
                                      ? 'bg-primary text-white border-primary shadow'
                                      : 'bg-white text-gray-600 border-gray-300 hover:border-primary/50'
                                    }
                                  `}
                                >
                                  {op.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Financia la venta
                            </label>
                            <div className="flex gap-2">
                              {[
                                { value: true, label: 'Sí' },
                                { value: false, label: 'No' },
                              ].map((op) => (
                                <button
                                  key={String(op.value)}
                                  type="button"
                                  onClick={() => setDatosOperacion({ financia: op.value })}
                                  className={`
                                    px-5 py-2 rounded-lg border-2 text-sm font-medium transition-all
                                    ${datosOperacion.financia === op.value
                                      ? 'bg-primary text-white border-primary shadow'
                                      : 'bg-white text-gray-600 border-gray-300 hover:border-primary/50'
                                    }
                                  `}
                                >
                                  {op.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

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
                            onUbicacionChange={handleMapaClick}
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
                      {/* Distribución */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Distribución</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Dormitorios <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2 flex-wrap">
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
                            <div className="flex gap-2 flex-wrap">
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
                              Garaje
                            </label>
                            <div className="flex gap-2 flex-wrap">
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
                      </div>

                      {/* Superficies */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Superficies</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        </div>
                      </div>

                      {/* Estado y antigüedad */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Estado y antigüedad</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Estado <span className="text-red-500">*</span>
                            </label>
                            <Select value={detallesPropiedad.estado} onValueChange={(value) => setDetallesPropiedad({ estado: value })}>
                              <SelectTrigger className="bg-gray-50 border-gray-300">
                                <SelectValue placeholder="Selecciona" />
                              </SelectTrigger>
                              <SelectContent>
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
                      </div>

                      {/* Características adicionales */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Características adicionales</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {[
                            { key: 'aptoOficina', label: 'Apto para oficina', desc: 'Uso profesional' },
                            { key: 'viviendaSocial', label: 'Vivienda social', desc: 'Programa gubernamental' },
                            { key: 'condominio', label: 'En condominio', desc: 'Condominio privado' },
                          ].map((car) => {
                            const checked = detallesPropiedad[car.key as keyof typeof detallesPropiedad] as boolean
                            return (
                              <label
                                key={car.key}
                                className={`
                                  flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                                  ${checked ? 'bg-primary/5 border-primary' : 'bg-white border-gray-200 hover:border-primary/40'}
                                `}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => setDetallesPropiedad({ [car.key]: e.target.checked })}
                                  className="w-5 h-5 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <div>
                                  <span className="text-sm font-semibold text-gray-700 block">{car.label}</span>
                                  <p className="text-xs text-gray-500">{car.desc}</p>
                                </div>
                              </label>
                            )
                          })}
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
                      <label
                        className={`
                          flex items-center justify-between gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all max-w-md
                          ${confortSeguridad.noAplica ? 'bg-primary/5 border-primary' : 'bg-white border-gray-200 hover:border-primary/40'}
                        `}
                      >
                        <div>
                          <span className="text-sm font-semibold text-gray-700 block">La propiedad no tiene comodidades</span>
                          <p className="text-xs text-gray-500">Marca esto si quieres saltar este paso</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={confortSeguridad.noAplica}
                          onChange={(e) => setConfortSeguridad({ noAplica: e.target.checked })}
                          className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      </label>

                      {!confortSeguridad.noAplica && (
                        <>
                          <div className="p-5 rounded-xl border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Comodidades (confort)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                              ].map((opcion) => {
                                const checked = confortSeguridad.confort.includes(opcion.value)
                                return (
                                  <button
                                    key={opcion.value}
                                    type="button"
                                    onClick={() => {
                                      if (checked) {
                                        setConfortSeguridad({
                                          confort: confortSeguridad.confort.filter(c => c !== opcion.value)
                                        })
                                      } else {
                                        setConfortSeguridad({
                                          confort: [...confortSeguridad.confort, opcion.value]
                                        })
                                      }
                                    }}
                                    className={`
                                      px-3 py-2 rounded-lg border-2 text-sm text-left transition-all
                                      ${checked
                                        ? 'bg-primary/5 border-primary text-primary font-medium'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40'
                                      }
                                    `}
                                  >
                                    {checked && '✓ '}{opcion.label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          <div className="p-5 rounded-xl border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Seguridad
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {[
                                { value: 'seguridad-24h', label: 'Seguridad 24hs' },
                                { value: 'porton-electrico', label: 'Portón Eléctrico' },
                                { value: 'camaras', label: 'Cámaras' },
                                { value: 'alarma', label: 'Alarma' },
                                { value: 'guardia', label: 'Guardia' },
                                { value: 'cercado', label: 'Cercado' },
                              ].map((opcion) => {
                                const checked = confortSeguridad.seguridad.includes(opcion.value)
                                return (
                                  <button
                                    key={opcion.value}
                                    type="button"
                                    onClick={() => {
                                      if (checked) {
                                        setConfortSeguridad({
                                          seguridad: confortSeguridad.seguridad.filter(s => s !== opcion.value)
                                        })
                                      } else {
                                        setConfortSeguridad({
                                          seguridad: [...confortSeguridad.seguridad, opcion.value]
                                        })
                                      }
                                    }}
                                    className={`
                                      px-3 py-2 rounded-lg border-2 text-sm text-left transition-all
                                      ${checked
                                        ? 'bg-primary/5 border-primary text-primary font-medium'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40'
                                      }
                                    `}
                                  >
                                    {checked && '✓ '}{opcion.label}
                                  </button>
                                )
                              })}
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
                        modoEdicion={Boolean(editPropertyId)}
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

      {/* Diálogo de confirmación para descartar */}
      <AlertDialog open={mostrarDialogoCancelar} onOpenChange={setMostrarDialogoCancelar}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <AlertDialogTitle>
                {editPropertyId ? "¿Descartar cambios?" : "¿Descartar borrador?"}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base mt-4">
              {editPropertyId ? (
                <>
                  Los cambios que no hayas guardado se perderán.
                  <br /><br />
                  Tu aviso actual <strong>se mantiene publicado tal como está</strong>. Esta acción no elimina ninguna propiedad.
                </>
              ) : (
                <>
                  Se perderán los datos que hayas ingresado en este formulario.
                  <br /><br />
                  Aún no has publicado nada: esta acción <strong>no elimina ninguna propiedad</strong>.
                </>
              )}
              <br /><br />
              <strong>¿Estás seguro de que deseas continuar?</strong>
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
              {editPropertyId ? "Sí, descartar cambios" : "Sí, descartar borrador"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
