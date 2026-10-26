"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Imagen {
  id: string
  file?: File  // Opcional: solo durante la subida
  preview: string  // Puede ser blob URL (temporal) o URL del backend (persistente)
  url?: string  // URL del backend después de subir
  orden: number
  uploading?: boolean  // Estado de subida
  error?: string  // Error de subida
}

export interface Archivo {
  id: string
  file: File
  nombre: string
}

interface DatosOperacion {
  titulo: string
  tipoOperacion: 'venta' | 'alquiler' | 'anticretico'
  precio: string
  moneda: 'USD' | 'BOB'
  aceptaPermuta: boolean
  financia: boolean
  // Campos específicos para alquiler
  deposito?: string  // Ej: "1 mes", "2 meses"
  plazoMinimo?: string  // Ej: "6 meses", "1 año"
  serviciosIncluidos?: string[]  // ["luz", "agua", "internet"]
  // Alquiler por habitaciones
  alquilaPorHabitaciones?: boolean
  habitaciones?: Array<{ nombre: string; descripcion?: string; precio?: string; activa?: boolean }>
  // Campos específicos para anticrético
  duracionContrato?: string  // Ej: "1 año", "2 años"
  opcionCompra?: boolean  // Opción de compra
}

interface DatosGenerales {
  tipoPropiedad: string
  direccion: string
  zona: string
  tipoMarcador: 'punto-exacto' | 'aproximado'
  latitud?: number
  longitud?: number
  mostrarDireccion: boolean
}

interface DetallesPropiedad {
  dormitorios: string
  banos: string
  garaje: string
  metrosEdificados: string
  metrosTerreno: string
  estado: string
  anoConstruccion: string
  aptoOficina: boolean
  viviendaSocial: boolean
  condominio: boolean
  cantidadPisos: string
}

interface ConfortSeguridad {
  confort: string[]
  seguridad: string[]
  noAplica: boolean
}

interface ImagenesDatos {
  imagenes: Imagen[]
  archivos: Archivo[]
  video: string
}

interface DescripcionDatos {
  descripcion: string
  terminosCondiciones: string
}

interface FormularioContextType {
  pasoActual: number
  datosOperacion: DatosOperacion
  datosGenerales: DatosGenerales
  detallesPropiedad: DetallesPropiedad
  confortSeguridad: ConfortSeguridad
  imagenesDatos: ImagenesDatos
  descripcionDatos: DescripcionDatos
  planSeleccionado?: string
  isInitialized: boolean
  editPropertyId: number | null
  setPasoActual: (paso: number) => void
  setDatosOperacion: (datos: Partial<DatosOperacion>) => void
  setDatosGenerales: (datos: Partial<DatosGenerales>) => void
  setDetallesPropiedad: (datos: Partial<DetallesPropiedad>) => void
  setConfortSeguridad: (datos: Partial<ConfortSeguridad>) => void
  setImagenesDatos: (datos: Partial<ImagenesDatos>) => void
  setDescripcionDatos: (datos: Partial<DescripcionDatos>) => void
  setPlanSeleccionado: (plan: string) => void
  setEditPropertyId: (id: number | null) => void
  addImagen: (imagen: Imagen) => void
  removeImagen: (id: string) => void
  updateImagenOrden: (imagenes: Imagen[]) => void
  addArchivo: (archivo: Archivo) => void
  removeArchivo: (id: string) => void
  resetFormulario: () => void
}

const FormularioContext = createContext<FormularioContextType | undefined>(undefined)

const initialState: {
  pasoActual: number
  datosOperacion: DatosOperacion
  datosGenerales: DatosGenerales
  detallesPropiedad: DetallesPropiedad
  confortSeguridad: ConfortSeguridad
  imagenesDatos: ImagenesDatos
  descripcionDatos: DescripcionDatos
} = {
  pasoActual: 1,
  datosOperacion: {
    titulo: '',
    tipoOperacion: 'venta',
    precio: '',
    moneda: 'BOB',
    aceptaPermuta: false,
    financia: false,
    deposito: '',
    plazoMinimo: '',
    serviciosIncluidos: [],
    duracionContrato: '',
    opcionCompra: false,
  },
  datosGenerales: {
    tipoPropiedad: '',
    direccion: '',
    zona: '',
    tipoMarcador: 'punto-exacto',
    mostrarDireccion: false,
  },
  detallesPropiedad: {
    dormitorios: '',
    banos: '',
    garaje: '',
    metrosEdificados: '',
    metrosTerreno: '',
    estado: '',
    anoConstruccion: '',
    aptoOficina: false,
    viviendaSocial: false,
    condominio: false,
    cantidadPisos: '1',
  },
  confortSeguridad: {
    confort: [],
    seguridad: [],
    noAplica: false,
  },
  imagenesDatos: {
    imagenes: [],
    archivos: [],
    video: '',
  },
  descripcionDatos: {
    descripcion: '',
    terminosCondiciones: '',
  },
}

export function FormularioProvider({ children }: { children: ReactNode }) {
  const [pasoActual, setPasoActual] = useState(1)
  const [datosOperacion, setDatosOperacionState] = useState(initialState.datosOperacion)
  const [datosGenerales, setDatosGeneralesState] = useState(initialState.datosGenerales)
  const [detallesPropiedad, setDetallesPropiedadState] = useState(initialState.detallesPropiedad)
  const [confortSeguridad, setConfortSeguridadState] = useState(initialState.confortSeguridad)
  const [imagenesDatos, setImagenesDatosState] = useState(initialState.imagenesDatos)
  const [descripcionDatos, setDescripcionDatosState] = useState(initialState.descripcionDatos)
  const [planSeleccionado, setPlanSeleccionado] = useState<string | undefined>()
  const [editPropertyId, setEditPropertyId] = useState<number | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Hydrate from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      try {
        const storage = localStorage.getItem('formulario-publicacion-storage')
        if (storage) {
          const parsed = JSON.parse(storage)
          if (parsed.state) {
            setPasoActual(parsed.state.pasoActual || 1)
            setDatosOperacionState(parsed.state.datosOperacion || initialState.datosOperacion)
            setDatosGeneralesState(parsed.state.datosGenerales || initialState.datosGenerales)
            setDetallesPropiedadState(parsed.state.detallesPropiedad || initialState.detallesPropiedad)
            setConfortSeguridadState(parsed.state.confortSeguridad || initialState.confortSeguridad)
            setImagenesDatosState(parsed.state.imagenesDatos || initialState.imagenesDatos)
            setDescripcionDatosState(parsed.state.descripcionDatos || initialState.descripcionDatos)
            setPlanSeleccionado(parsed.state.planSeleccionado)
            setEditPropertyId(parsed.state.editPropertyId ?? null)
          }
        }
      } catch (error) {
        console.error('Error hydrating form state:', error)
      }
      setIsInitialized(true)
    }
  }, [isInitialized])

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      try {
        const stateToPersist = {
          pasoActual,
          datosOperacion,
          datosGenerales,
          detallesPropiedad,
          confortSeguridad,
          imagenesDatos,
          descripcionDatos,
          planSeleccionado,
          editPropertyId,
        }
        localStorage.setItem('formulario-publicacion-storage', JSON.stringify({ state: stateToPersist }))
      } catch (error) {
        console.error('Error persisting form state:', error)
      }
    }
  }, [pasoActual, datosOperacion, datosGenerales, detallesPropiedad, confortSeguridad, imagenesDatos, descripcionDatos, planSeleccionado, editPropertyId, isInitialized])

  const setDatosOperacion = (datos: Partial<DatosOperacion>) => {
    setDatosOperacionState(prev => ({ ...prev, ...datos }))
  }

  const setDatosGenerales = (datos: Partial<DatosGenerales>) => {
    setDatosGeneralesState(prev => ({ ...prev, ...datos }))
  }

  const setDetallesPropiedad = (datos: Partial<DetallesPropiedad>) => {
    setDetallesPropiedadState(prev => ({ ...prev, ...datos }))
  }

  const setConfortSeguridad = (datos: Partial<ConfortSeguridad>) => {
    setConfortSeguridadState(prev => ({ ...prev, ...datos }))
  }

  const setImagenesDatos = (datos: Partial<ImagenesDatos>) => {
    setImagenesDatosState(prev => ({ ...prev, ...datos }))
  }

  const setDescripcionDatos = (datos: Partial<DescripcionDatos>) => {
    setDescripcionDatosState(prev => ({ ...prev, ...datos }))
  }

  const addImagen = (imagen: Imagen) => {
    setImagenesDatosState(prev => ({
      ...prev,
      imagenes: [...prev.imagenes, imagen],
    }))
  }

  const removeImagen = (id: string) => {
    setImagenesDatosState(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter(img => img.id !== id),
    }))
  }

  const updateImagenOrden = (imagenes: Imagen[]) => {
    setImagenesDatosState(prev => ({
      ...prev,
      imagenes,
    }))
  }

  const addArchivo = (archivo: Archivo) => {
    setImagenesDatosState(prev => ({
      ...prev,
      archivos: [...prev.archivos, archivo],
    }))
  }

  const removeArchivo = (id: string) => {
    setImagenesDatosState(prev => ({
      ...prev,
      archivos: prev.archivos.filter(arc => arc.id !== id),
    }))
  }

  const resetFormulario = () => {
    setPasoActual(1)
    setDatosOperacionState(initialState.datosOperacion)
    setDatosGeneralesState(initialState.datosGenerales)
    setDetallesPropiedadState(initialState.detallesPropiedad)
    setConfortSeguridadState(initialState.confortSeguridad)
    setImagenesDatosState(initialState.imagenesDatos)
    setDescripcionDatosState(initialState.descripcionDatos)
    setPlanSeleccionado(undefined)
    setEditPropertyId(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('formulario-publicacion-storage')
    }
  }

  return (
    <FormularioContext.Provider
      value={{
        pasoActual,
        datosOperacion,
        datosGenerales,
        detallesPropiedad,
        confortSeguridad,
        imagenesDatos,
        descripcionDatos,
        planSeleccionado,
        isInitialized,
        editPropertyId,
        setPasoActual,
        setDatosOperacion,
        setDatosGenerales,
        setDetallesPropiedad,
        setConfortSeguridad,
        setImagenesDatos,
        setDescripcionDatos,
        setPlanSeleccionado,
        setEditPropertyId,
        addImagen,
        removeImagen,
        updateImagenOrden,
        addArchivo,
        removeArchivo,
        resetFormulario,
      }}
    >
      {children}
    </FormularioContext.Provider>
  )
}

export function useFormularioPublicacion() {
  const context = useContext(FormularioContext)
  if (context === undefined) {
    throw new Error('useFormularioPublicacion must be used within a FormularioProvider')
  }
  return context
}
